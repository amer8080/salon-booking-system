import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'  // ✅ مُصحح

export async function GET() {
  try {
    // قراءة جميع الخدمات النشطة من قاعدة البيانات
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        nameEn: true,
        nameTr: true,
        category: true,
        price: true,
        duration: true,
        description: true
      }
    })

    // تحويل البيانات للتنسيق المطلوب
    const formattedServices = services.map(service => ({
      id: service.id.toString(),
      name: service.nameAr, // استخدم العربي كافتراضي
      nameAr: service.nameAr,
      nameEn: service.nameEn,
      nameTr: service.nameTr,
      category: service.category,
      price: Number(service.price),
      duration: service.duration,
      description: service.description
    }))

    return NextResponse.json({
      success: true,
      services: formattedServices,
      count: services.length
    })

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في قراءة الخدمات',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}