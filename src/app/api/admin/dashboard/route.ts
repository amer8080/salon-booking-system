import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'  // ✅ مُصحح

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 جمع إحصائيات لوحة التحكم الكاملة...')

    // جمع الإحصائيات بالتوازي لتحسين الأداء
    const [
      totalBookings,
      todayBookings,
      pendingBookings,
      totalCustomers,
      totalServices
    ] = await Promise.all([
      // إجمالي الحجوزات (غير الملغية)
      prisma.reservation.count({
        where: {
          status: {
            not: 'cancelled'
          }
        }
      }),

      // حجوزات اليوم
      prisma.reservation.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          },
          status: {
            not: 'cancelled'
          }
        }
      }),

      // الحجوزات المعلقة
      prisma.reservation.count({
        where: {
          status: 'pending'
        }
      }),

      // إجمالي العملاء
      prisma.customer.count(),

      // إجمالي الخدمات النشطة
      prisma.service.count({
        where: {
          isActive: true
        }
      })
    ])

    console.log('✅ تم جمع الإحصائيات بنجاح:', {
      totalBookings,
      todayBookings,
      pendingBookings,
      totalCustomers,
      totalServices
    })

    const stats = {
      totalBookings,
      todayBookings,
      pendingBookings,
      totalCustomers,
      totalServices
    }

    return NextResponse.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString(),
      message: 'تم جلب الإحصائيات بنجاح'
    })

  } catch (error) {
    console.error('❌ خطأ في جمع إحصائيات لوحة التحكم:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جمع الإحصائيات',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}