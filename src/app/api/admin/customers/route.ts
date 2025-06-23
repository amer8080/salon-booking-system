import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = searchParams.get('limit') // null means "all"
    const limitNum = limit ? parseInt(limit) : undefined
    
    // Filter parameters
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const minVisits = parseInt(searchParams.get('minVisits') || '0')
    const lastVisitDays = searchParams.get('lastVisitDays') || 'all'
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'lastVisit'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const whereConditions: any = {}

    // Search filter
    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { phone: { contains: search } }
      ]
    }

    // Status filter
    if (status !== 'all') {
      whereConditions.status = status
    }

    // Visits filter
    if (minVisits > 0) {
      whereConditions.totalVisits = { gte: minVisits }
    }

    // Last visit filter
    if (lastVisitDays !== 'all') {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(lastVisitDays))
      whereConditions.lastVisit = { gte: daysAgo }
    }

    // Build orderBy
    const orderByClause: any = {}
    
    // Handle special sorting cases
    if (sortBy === 'name') {
      orderByClause.name = sortOrder
    } else if (sortBy === 'totalVisits') {
      orderByClause.totalVisits = sortOrder
    } else if (sortBy === 'lastVisit') {
      orderByClause.lastVisit = sortOrder
    } else if (sortBy === 'createdAt') {
      orderByClause.createdAt = sortOrder
    } else {
      // Default fallback
      orderByClause.lastVisit = 'desc'
    }

    // Calculate pagination
    const skip = limitNum ? (page - 1) * limitNum : 0
    const take = limitNum || undefined

    // Execute queries in parallel for better performance
    const [customers, totalCount] = await Promise.all([
      // Get customers with pagination
      prisma.customer.findMany({
        where: whereConditions,
        orderBy: orderByClause,
        skip,
        take,
        include: {
          reservations: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              date: true,
              startTime: true,
              services: true,
              status: true,
              totalPrice: true
            }
          },
          coupons: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              reservations: true,
              coupons: true
            }
          }
        }
      }),
      
      // Get total count for pagination
      prisma.customer.count({
        where: whereConditions
      })
    ])

    // Calculate general stats (not affected by filters)
    const [totalCustomers, activeCustomers, vipCustomersCount, newCustomersThisMonth] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'active' } }),
      prisma.customer.count({ where: { totalVisits: { gte: 20 } } }), // VIP customers
      prisma.customer.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    // Process customers with enhanced stats
    const customersWithStats = customers.map(customer => {
      // Fix coupon calculations
      const totalCoupons = customer.coupons.length
      const usedCoupons = customer.coupons.filter(c => c.isUsed).length
      const availableCoupons = customer.coupons.filter(c => !c.isUsed).length
      
      // Calculate average days between visits
      const reservations = customer.reservations
      let avgDaysBetweenVisits = 0
      if (reservations.length > 1) {
        const dates = reservations.map(r => new Date(r.date)).sort()
        const totalDays = (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)
        avgDaysBetweenVisits = Math.round(totalDays / (dates.length - 1))
      }

      // Determine customer level (updated to match new design)
      let customerLevel = 'عميل جديد'
      if (customer.totalVisits >= 20) customerLevel = 'عميل VIP'
      else if (customer.totalVisits >= 10) customerLevel = 'عميل ذهبي'
      else if (customer.totalVisits >= 5) customerLevel = 'عميل فضي'
      else if (customer.totalVisits >= 2) customerLevel = 'عميل عادي'

      // Calculate days since last visit
      const daysSinceLastVisit = customer.lastVisit 
        ? Math.floor((new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
        : 999 // High number for customers with no visits

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        firstVisit: customer.firstVisit,
        lastVisit: customer.lastVisit,
        totalVisits: customer.totalVisits,
        status: customer.status,
        language: customer.language,
        notes: customer.notes,
        createdAt: customer.createdAt,
        totalReservations: customer._count.reservations,
        totalCoupons,
        usedCoupons,
        availableCoupons,
        avgDaysBetweenVisits,
        customerLevel,
        daysSinceLastVisit,
        recentReservations: reservations.slice(0, 3)
      }
    })

    // Calculate pagination metadata
    const totalPages = limitNum ? Math.ceil(totalCount / limitNum) : 1
    const hasNext = limitNum ? page * limitNum < totalCount : false
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
      pagination: {
        page,
        limit: limitNum || totalCount,
        total: totalCount,
        totalPages,
        hasNext,
        hasPrev
      },
      stats: {
        totalCustomers,
        activeCustomers,
        vipCustomers: vipCustomersCount,
        newCustomersThisMonth
      }
    })

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطأ في جلب العملاء',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, notes, status = 'active' } = body

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'الاسم ورقم الهاتف مطلوبان' },
        { status: 400 }
      )
    }

    // Check for existing phone number
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مستخدم مسبقاً' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        notes,
        status,
        totalVisits: 0,
        language: 'ar',
        firstVisit: new Date(),
        lastVisit: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إضافة العميل بنجاح',
      customer
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في إضافة العميل' },
      { status: 500 }
    )
  }
}