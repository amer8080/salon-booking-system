import { parseServices, formatServicesForDatabase } from '@/lib/services-utils'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseIstanbulDate, toDatabaseTime, fromDatabaseTime, formatIstanbulDate } from '@/lib/timezone'

export async function GET(request: NextRequest) {
  try {
    // استخراج معاملات التاريخ من URL
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const view = searchParams.get('view') || 'week' // week, month, day


    // إعداد تصفية التواريخ
    let dateFilter = {}
    
    if (startDate && endDate) {
      // تحويل التواريخ لقاعدة البيانات
      const start = parseIstanbulDate(startDate)
      const end = parseIstanbulDate(endDate)
      // إضافة 24 ساعة لنهاية اليوم
      end.setHours(23, 59, 59, 999)
      
      dateFilter = {
        startTime: {
          gte: toDatabaseTime(start),
          lte: toDatabaseTime(end)
        }
      }
      
    } else {
      // إذا لم يتم تحديد تواريخ، استخدم الأسبوع الحالي
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // بداية الأسبوع (الأحد)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // نهاية الأسبوع (السبت)
      endOfWeek.setHours(23, 59, 59, 999)
      
      dateFilter = {
        startTime: {
          gte: toDatabaseTime(startOfWeek),
          lte: toDatabaseTime(endOfWeek)
        }
      }
      
    }

    // جلب الحجوزات مع التصفية
    const bookings = await prisma.reservation.findMany({
      where: dateFilter,
      include: {
        customer: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })


    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customerName: booking.customer.name,
      customerPhone: booking.customer.phone,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      services: parseServices(booking.services),
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt
    }))

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      count: formattedBookings.length,
      dateRange: { startDate, endDate, view },
      performance: {
        message: `تم تحميل ${formattedBookings.length} حجز بدلاً من جميع الحجوزات - تحسين كبير في الأداء!`,
        optimized: true
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب الحجوزات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, phoneNumber, selectedDate, selectedTime, selectedServices, notes, createdBy = 'admin' } = body

    if (!customerName || !phoneNumber || !selectedDate || !selectedTime || !selectedServices?.length) {
      return NextResponse.json(
        { success: false, error: 'جميع البيانات مطلوبة' },
        { status: 400 }
      )
    }

    const appointmentDate = parseIstanbulDate(selectedDate)
    const startTime = parseIstanbulDate(selectedDate, selectedTime)
    const endTime = new Date(startTime.getTime() + (30 * 60 * 1000))

    let customer = await prisma.customer.findUnique({
      where: { phone: phoneNumber }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: phoneNumber,
          totalVisits: 1,
          language: 'ar'
        }
      })
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName,
          totalVisits: customer.totalVisits + 1
        }
      })
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerId: customer.id,
        date: toDatabaseTime(appointmentDate),
        startTime: toDatabaseTime(startTime),
        endTime: toDatabaseTime(endTime),
        services: formatServicesForDatabase(selectedServices),
        status: 'confirmed',
        totalPrice: 0,
        createdBy: createdBy,
        notes: notes || null
      }
    })

    let coupon = null
    const updatedTotalVisits = customer.totalVisits
    
    if (updatedTotalVisits % 5 === 0) {
      coupon = await prisma.coupon.create({
        data: {
          code: `ADMIN${customer.id}${Date.now()}`,
          customerId: customer.id,
          discountType: 'percentage',
          discountValue: 10,
          visitMilestone: updatedTotalVisits
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحجز بنجاح! 🎉',
      data: {
        reservationId: reservation.id,
        customerId: customer.id,
        customerName: customer.name,
        appointmentDate: appointmentDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        services: selectedServices,
        status: 'confirmed',
        totalVisits: updatedTotalVisits,
        coupon: coupon ? {
          code: coupon.code,
          discount: coupon.discountValue,
          expiresAt: coupon.expiresAt
        } : null
      }
    })

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في إنشاء الحجز',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}