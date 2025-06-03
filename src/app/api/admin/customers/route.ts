import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const minVisits = searchParams.get('minVisits') || '0'
    const lastVisitDays = searchParams.get('lastVisitDays') || 'all'

    // بناء شروط البحث
    const whereConditions: any = {}

    // البحث في الاسم أو رقم الهاتف
    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { phone: { contains: search } }
      ]
    }

    // فلترة حسب الحالة
    if (status !== 'all') {
      whereConditions.status = status
    }

    // فلترة حسب عدد الزيارات
    if (minVisits !== '0') {
      whereConditions.totalVisits = { gte: parseInt(minVisits) }
    }

    // فلترة حسب آخر زيارة
    if (lastVisitDays !== 'all') {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(lastVisitDays))
      whereConditions.lastVisit = { gte: daysAgo }
    }

    const customers = await prisma.customer.findMany({
      where: whereConditions,
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
        // جلب جميع الكوبونات لحساب الإحصائيات
        coupons: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reservations: true,
            coupons: true
          }
        }
      },
      orderBy: [
        { totalVisits: 'desc' },
        { lastVisit: 'desc' }
      ]
    })

    // حساب إحصائيات إضافية لكل عميل
    const customersWithStats = customers.map(customer => {
      // إصلاح حساب الكوبونات
      const totalCoupons = customer.coupons.length
      const usedCoupons = customer.coupons.filter(c => c.isUsed).length
      const availableCoupons = customer.coupons.filter(c => !c.isUsed).length
      
      // حساب متوسط الفترة بين الزيارات
      const reservations = customer.reservations
      let avgDaysBetweenVisits = 0
      if (reservations.length > 1) {
        const dates = reservations.map(r => new Date(r.date)).sort()
        const totalDays = (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)
        avgDaysBetweenVisits = Math.round(totalDays / (dates.length - 1))
      }

      // تحديد مستوى العميل
      let customerLevel = 'جديد'
      if (customer.totalVisits >= 20) customerLevel = 'VIP'
      else if (customer.totalVisits >= 10) customerLevel = 'ذهبي'
      else if (customer.totalVisits >= 5) customerLevel = 'فضي'
      else if (customer.totalVisits >= 2) customerLevel = 'عادي'

      // حساب آخر زيارة بالأيام
      const daysSinceLastVisit = Math.floor(
        (new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
      )

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

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
      total: customersWithStats.length
    })

  } catch (error) {
    console.error('خطأ في جلب العملاء:', error)
    console.error('تفاصيل الخطأ:', error)
    
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

    // التحقق من عدم وجود رقم الهاتف مسبقاً
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
        language: 'ar'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إضافة العميل بنجاح',
      customer
    })

  } catch (error) {
    console.error('خطأ في إضافة العميل:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في إضافة العميل' },
      { status: 500 }
    )
  }
}