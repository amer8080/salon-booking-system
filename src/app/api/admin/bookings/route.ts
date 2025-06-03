import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseIstanbulDate, toDatabaseTime, fromDatabaseTime, formatIstanbulDate } from '@/lib/timezone'

export async function GET(request: NextRequest) {
  try {
    const bookings = await prisma.reservation.findMany({
      include: {
        customer: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customerName: booking.customer.name,
      customerPhone: booking.customer.phone,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      services: JSON.parse(booking.services),
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt
    }))

    return NextResponse.json({
      success: true,
      bookings: formattedBookings
    })

  } catch (error) {
    console.error('خطأ في جلب الحجوزات:', error)
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
        services: JSON.stringify(selectedServices),
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
    console.error('خطأ في إنشاء الحجز:', error)
    
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