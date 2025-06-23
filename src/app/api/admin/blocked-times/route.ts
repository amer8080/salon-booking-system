import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseIstanbulDate, toDatabaseTime, fromDatabaseTime, formatIstanbulDate } from '@/lib/timezone'

export async function GET(_request: NextRequest) {
  try {
    const blockedTimes = await prisma.blockedTime.findMany({
      orderBy: {
        date: 'asc'
      }
    })

    const formattedBlockedTimes = blockedTimes.map(blocked => ({
      id: blocked.id,
      date: formatIstanbulDate(fromDatabaseTime(blocked.date), 'date'),
      startTime: blocked.startTime ? formatIstanbulDate(fromDatabaseTime(blocked.startTime), 'time') : null,
      endTime: blocked.endTime ? formatIstanbulDate(fromDatabaseTime(blocked.endTime), 'time') : null,
      isRecurring: blocked.isRecurring,
      recurringType: blocked.recurringType,
      reason: blocked.reason,
      createdBy: blocked.createdBy,
      createdAt: blocked.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      blockedTimes: formattedBlockedTimes,
      count: blockedTimes.length
    })

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب الأوقات المقفلة',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json()
    const { date, startTime, endTime, isRecurring, recurringType, reason } = body

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'التاريخ مطلوب' },
        { status: 400 }
      )
    }

    const blockDate = parseIstanbulDate(date)
    let blockStartTime = null
    let blockEndTime = null

    if (startTime && endTime) {
      blockStartTime = parseIstanbulDate(date, startTime)
      blockEndTime = parseIstanbulDate(date, endTime)
    }

    const newBlockedTime = await prisma.blockedTime.create({
      data: {
        date: toDatabaseTime(blockDate),
        startTime: blockStartTime ? toDatabaseTime(blockStartTime) : null,
        endTime: blockEndTime ? toDatabaseTime(blockEndTime) : null,
        isRecurring: isRecurring || false,
        recurringType: recurringType || null,
        reason: reason || null,
        createdBy: 'admin'
      }
    })

    return NextResponse.json({
      success: true,
      blockedTime: {
        id: newBlockedTime.id,
        date: formatIstanbulDate(fromDatabaseTime(newBlockedTime.date), 'date'),
        startTime: newBlockedTime.startTime ? formatIstanbulDate(fromDatabaseTime(newBlockedTime.startTime), 'time') : null,
        endTime: newBlockedTime.endTime ? formatIstanbulDate(fromDatabaseTime(newBlockedTime.endTime), 'time') : null,
        isRecurring: newBlockedTime.isRecurring,
        recurringType: newBlockedTime.recurringType,
        reason: newBlockedTime.reason,
        createdBy: newBlockedTime.createdBy
      },
      message: startTime ? 'تم إقفال الوقت بنجاح' : 'تم إقفال اليوم بنجاح'
    })

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في إقفال الوقت',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}