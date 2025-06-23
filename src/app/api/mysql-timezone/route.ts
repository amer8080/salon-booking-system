import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'  // ✅ مُصحح

export async function POST() {
  try {
    // تعديل المنطقة الزمنية لـ MySQL
    await prisma.$executeRaw`SET time_zone = '+03:00'`
    
    // التحقق من المنطقة الزمنية الحالية
    const result = await prisma.$queryRaw`SHOW VARIABLES LIKE 'time_zone'`
    
    return NextResponse.json({
      success: true,
      message: 'تم تعديل المنطقة الزمنية بنجاح',
      timezone: result
    })

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في تعديل المنطقة الزمنية',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}