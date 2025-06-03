import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseIstanbulDate, getIstanbulStartOfDay, getIstanbulEndOfDay, createIstanbulDate, formatIstanbulDate, fromDatabaseTime } from '@/lib/timezone'

const WORKING_HOURS = {
  start: '11:30',
  end: '18:30',
  slotDuration: 30
}

function generateTimeSlots() {
  const slots = []
  const startTime = new Date()
  startTime.setHours(11, 30, 0, 0)
  const endTime = new Date()
  endTime.setHours(18, 30, 0, 0)

  const current = new Date(startTime)
  while (current <= endTime) {
    const timeString = current.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    slots.push(timeString)
    current.setMinutes(current.getMinutes() + WORKING_HOURS.slotDuration)
  }
  return slots
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const selectedDate = searchParams.get('date')
    const userType = searchParams.get('userType') || 'customer'

    if (!selectedDate) {
      return NextResponse.json(
        { success: false, error: 'التاريخ مطلوب' },
        { status: 400 }
      )
    }

    const allTimeSlots = generateTimeSlots()
    const today = formatIstanbulDate(createIstanbulDate(), 'date')
    const now = createIstanbulDate()

    let availableSlots = allTimeSlots
    
    if (selectedDate === today) {
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      availableSlots = allTimeSlots.filter(timeSlot => {
        const [hour, minute] = timeSlot.split(':').map(Number)
        const slotTime = hour * 60 + minute
        const currentTime = currentHour * 60 + currentMinute
        
        return slotTime > (currentTime + 30)
      })
    }

    // فحص الأوقات المقفلة
    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        date: {
          gte: getIstanbulStartOfDay(parseIstanbulDate(selectedDate)),
          lte: getIstanbulEndOfDay(parseIstanbulDate(selectedDate))
        }
      }
    })

    // فحص إذا كان اليوم مقفل كاملاً
    const isDayBlocked = blockedTimes.some(blocked => 
      formatIstanbulDate(fromDatabaseTime(blocked.date), 'date') === selectedDate && 
      blocked.startTime === null && 
      blocked.endTime === null
    )

    if (isDayBlocked && userType === 'customer') {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        bookedSlots: [],
        blockedSlots: allTimeSlots,
        totalSlots: 0,
        allSlots: allTimeSlots.length,
        userType: 'customer',
        message: 'هذا اليوم مقفل كاملاً',
        debug: process.env.NODE_ENV === 'development' ? {
          selectedDate,
          isDayBlocked: true,
          blockedTimesFound: blockedTimes.length
        } : undefined
      })
    }

    // فلترة الأوقات المقفلة للعملاء
    const blockedTimeSlots = blockedTimes
      .filter(blocked => blocked.startTime !== null)
      .map(blocked => {
        const blockedTime = fromDatabaseTime(blocked.startTime!)
        return formatIstanbulDate(blockedTime, 'time')
      })

    if (userType === 'customer') {
      availableSlots = availableSlots.filter(slot => !blockedTimeSlots.includes(slot))
    }

    if (userType === 'admin') {
      return NextResponse.json({
        success: true,
        availableSlots: availableSlots,
        blockedSlots: blockedTimeSlots,
        totalSlots: availableSlots.length,
        userType: 'admin',
        note: 'الأدمن يمكنه الحجز في أي وقت (حتى المقفل)',
        debug: process.env.NODE_ENV === 'development' ? {
          selectedDate,
          isDayBlocked,
          blockedTimesFound: blockedTimes.length,
          blockedTimeSlots
        } : undefined
      })
    }

    const selectedDateObj = parseIstanbulDate(selectedDate)
    const startOfDay = getIstanbulStartOfDay(selectedDateObj)
    const endOfDay = getIstanbulEndOfDay(selectedDateObj)

    const existingReservations = await prisma.reservation.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'cancelled'
        }
      },
      select: {
        id: true,
        startTime: true,
        customerId: true
      }
    })

    const bookedTimes = existingReservations.map(reservation => {
      const reservationTime = new Date(reservation.startTime)
      const timeString = reservationTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      return timeString
    })

    const finalAvailableSlots = availableSlots.filter(slot => {
      const isBooked = bookedTimes.includes(slot)
      return !isBooked
    })

    return NextResponse.json({
      success: true,
      availableSlots: finalAvailableSlots,
      bookedSlots: bookedTimes,
      blockedSlots: blockedTimeSlots,
      totalSlots: finalAvailableSlots.length,
      allSlots: allTimeSlots.length,
      userType: 'customer',
      debug: process.env.NODE_ENV === 'development' ? {
        selectedDate,
        isDayBlocked,
        reservationsFound: existingReservations.length,
        bookedTimes,
        blockedTimeSlots,
        blockedTimesFound: blockedTimes.length,
        filteredOut: availableSlots.length - finalAvailableSlots.length
      } : undefined
    })

  } catch (error) {
    console.error('خطأ في جلب الأوقات المتاحة:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب الأوقات المتاحة',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}