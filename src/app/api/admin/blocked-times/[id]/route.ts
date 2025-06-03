import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const blockedTimeId = parseInt(params.id)

    if (isNaN(blockedTimeId)) {
      return NextResponse.json(
        { success: false, error: 'معرف الإقفال غير صحيح' },
        { status: 400 }
      )
    }

    const blockedTime = await prisma.blockedTime.findUnique({
      where: { id: blockedTimeId }
    })

    if (!blockedTime) {
      return NextResponse.json(
        { success: false, error: 'الإقفال غير موجود' },
        { status: 404 }
      )
    }

    await prisma.blockedTime.delete({
      where: { id: blockedTimeId }
    })

    const message = blockedTime.startTime ? 'تم فتح الوقت بنجاح' : 'تم فتح اليوم بنجاح'

    return NextResponse.json({
      success: true,
      message: message
    })

  } catch (error) {
    console.error('خطأ في حذف الإقفال:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'الإقفال غير موجود' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في حذف الإقفال',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const blockedTimeId = parseInt(params.id)

    if (isNaN(blockedTimeId)) {
      return NextResponse.json(
        { success: false, error: 'معرف الإقفال غير صحيح' },
        { status: 400 }
      )
    }

    const blockedTime = await prisma.blockedTime.findUnique({
      where: { id: blockedTimeId }
    })

    if (!blockedTime) {
      return NextResponse.json(
        { success: false, error: 'الإقفال غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      blockedTime: {
        id: blockedTime.id,
        date: blockedTime.date.toISOString(),
        startTime: blockedTime.startTime?.toISOString() || null,
        endTime: blockedTime.endTime?.toISOString() || null,
        isRecurring: blockedTime.isRecurring,
        recurringType: blockedTime.recurringType,
        reason: blockedTime.reason,
        createdBy: blockedTime.createdBy,
        createdAt: blockedTime.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('خطأ في جلب الإقفال:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب الإقفال',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}