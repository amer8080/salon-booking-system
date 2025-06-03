import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'  // ✅ مُصحح

// إضافة خدمة جديدة
export async function POST(request: NextRequest) {
  try {
    console.log('➕ إضافة خدمة جديدة...')
    
    const body = await request.json()
    const { 
      nameAr, 
      nameEn, 
      nameTr, 
      category, 
      price, 
      duration, 
      description 
    } = body

    // التحقق من البيانات المطلوبة
    if (!nameAr || !nameEn || !nameTr || !category || !price || !duration) {
      return NextResponse.json(
        { success: false, error: 'جميع البيانات الأساسية مطلوبة (الأسماء، الفئة، السعر، المدة)' },
        { status: 400 }
      )
    }

    // التحقق من صحة البيانات
    if (parseFloat(price) <= 0) {
      return NextResponse.json(
        { success: false, error: 'السعر يجب أن يكون أكبر من صفر' },
        { status: 400 }
      )
    }

    if (parseInt(duration) <= 0) {
      return NextResponse.json(
        { success: false, error: 'مدة الخدمة يجب أن تكون أكبر من صفر' },
        { status: 400 }
      )
    }

    // التحقق من عدم تكرار الاسم العربي
    const existingService = await prisma.service.findFirst({
      where: {
        OR: [
          { nameAr: nameAr },
          { nameEn: nameEn },
          { nameTr: nameTr }
        ]
      }
    })

    if (existingService) {
      return NextResponse.json(
        { success: false, error: 'يوجد خدمة بنفس الاسم مسبقاً' },
        { status: 400 }
      )
    }

    // الحصول على أعلى ترتيب لتحديد الترتيب التالي
    const maxOrderService = await prisma.service.findFirst({
      orderBy: {
        displayOrder: 'desc'
      }
    })

    const nextDisplayOrder = (maxOrderService?.displayOrder || 0) + 1

    // إنشاء الخدمة الجديدة
    const newService = await prisma.service.create({
      data: {
        name: nameAr, // الاسم الرئيسي بالعربية
        nameAr: nameAr,
        nameEn: nameEn,
        nameTr: nameTr,
        category: category,
        price: parseFloat(price),
        duration: parseInt(duration),
        description: description || null,
        isActive: true, // مفعل افتراضياً
        displayOrder: nextDisplayOrder
      }
    })

    console.log('✅ تم إنشاء خدمة جديدة بنجاح:', newService.id)

    return NextResponse.json({
      success: true,
      service: newService,
      message: 'تم إضافة الخدمة بنجاح'
    })

  } catch (error) {
    console.error('❌ خطأ في إنشاء الخدمة:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في إضافة الخدمة',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// جلب جميع الخدمات (للأدمن) - مع المعطلة
export async function GET(request: NextRequest) {
  try {
    console.log('📋 جلب جميع الخدمات للأدمن...')

    const services = await prisma.service.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    console.log('✅ تم جلب', services.length, 'خدمة بنجاح')

    return NextResponse.json({
      success: true,
      services: services,
      count: services.length,
      message: 'تم جلب الخدمات بنجاح'
    })

  } catch (error) {
    console.error('❌ خطأ في جلب الخدمات:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب الخدمات',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}