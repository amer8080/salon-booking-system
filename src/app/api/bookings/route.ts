import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseIstanbulDate, toDatabaseTime } from '@/lib/timezone'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, customerName, selectedDate, selectedTime, selectedServices } = body

    if (!phoneNumber || !customerName || !selectedDate || !selectedTime || !selectedServices?.length) {
      return NextResponse.json(
        { success: false, error: 'جميع البيانات مطلوبة' },
        { status: 400 }
      )
    }

    const appointmentDate = parseIstanbulDate(selectedDate)
    const startTime = parseIstanbulDate(selectedDate, selectedTime)
    const endTime = new Date(startTime.getTime() + (30 * 60 * 1000))

    const existingReservation = await prisma.reservation.findFirst({
      where: {
        startTime: toDatabaseTime(startTime),
        status: {
          not: 'cancelled'
        }
      }
    })

    if (existingReservation) {
      return NextResponse.json(
        { success: false, error: 'هذا الوقت محجوز مسبقاً. يرجى اختيار وقت آخر.' },
        { status: 409 }
      )
    }

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
        createdBy: 'customer'
      }
    })

    let coupon = null
    const updatedTotalVisits = customer.totalVisits
    
    if (updatedTotalVisits % 5 === 0) {
      coupon = await prisma.coupon.create({
        data: {
          code: `LOYAL${customer.id}${Date.now()}`,
          customerId: customer.id,
          discountType: 'percentage',
          discountValue: 10,
          visitMilestone: updatedTotalVisits
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد حجزك بنجاح! 🎉',
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