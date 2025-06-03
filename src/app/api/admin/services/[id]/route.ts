import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'  // ✅ مُصحح

// تحديث خدمة موجودة
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔄 تحديث الخدمة:', params.id)
    
    const body = await request.json()
    const { 
      nameAr, 
      nameEn, 
      nameTr, 
      category, 
      price, 
      duration, 
      description,
      displayOrder 
    } = body

    // التحقق من البيانات المطلوبة
    if (!nameAr || !nameEn || !nameTr || !category || !price || !duration) {
      return NextResponse.json(
        { success: false, error: 'جميع البيانات الأساسية مطلوبة' },
        { status: 400 }
      )
    }

    // تحديث الخدمة في قاعدة البيانات
    const updatedService = await prisma.service.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        name: nameAr, // الاسم الرئيسي بالعربية
        nameAr: nameAr,
        nameEn: nameEn,
        nameTr: nameTr,
        category: category,
        price: parseFloat(price),
        duration: parseInt(duration),
        description: description || null,
        displayOrder: displayOrder || 0
      }
    })

    console.log('✅ تم تحديث الخدمة بنجاح:', updatedService.id)

    return NextResponse.json({
      success: true,
      service: updatedService,
      message: 'تم تحديث الخدمة بنجاح'
    })

  } catch (error) {
    console.error('❌ خطأ في تحديث الخدمة:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في تحديث الخدمة',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// تحديث حالة تفعيل/تعطيل الخدمة
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔄 تحديث حالة الخدمة:', params.id)
    
    const body = await request.json()
    const { isActive } = body

    // التحقق من وجود البيانات
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'حالة التفعيل مطلوبة' },
        { status: 400 }
      )
    }

    // تحديث حالة الخدمة
    const updatedService = await prisma.service.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        isActive: isActive
      }
    })

    console.log('✅ تم تحديث حالة الخدمة:', updatedService.id, '→', isActive)

    return NextResponse.json({
      success: true,
      service: updatedService,
      message: `تم ${isActive ? 'تفعيل' : 'تعطيل'} الخدمة بنجاح`
    })

  } catch (error) {
    console.error('❌ خطأ في تحديث حالة الخدمة:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في تحديث حالة الخدمة',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// حذف خدمة
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🗑️ حذف الخدمة:', params.id)
    
    const serviceId = parseInt(params.id)

    // التحقق من وجود حجوزات مرتبطة بهذه الخدمة
    const reservationsWithService = await prisma.reservation.findMany({
      where: {
        services: {
          contains: `"${serviceId}"`
        }
      }
    })

    if (reservationsWithService.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `لا يمكن حذف الخدمة لأنها مرتبطة بـ ${reservationsWithService.length} حجز. يمكنك تعطيلها بدلاً من الحذف.`
        },
        { status: 400 }
      )
    }

    // حذف الخدمة
    await prisma.service.delete({
      where: {
        id: serviceId
      }
    })

    console.log('✅ تم حذف الخدمة بنجاح:', serviceId)

    return NextResponse.json({
      success: true,
      message: 'تم حذف الخدمة بنجاح'
    })

  } catch (error) {
    console.error('❌ خطأ في حذف الخدمة:', error)
    
    // التحقق من نوع الخطأ
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'الخدمة غير موجودة' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في حذف الخدمة',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// جلب تفاصيل خدمة محددة
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 جلب تفاصيل الخدمة:', params.id)
    
    const service = await prisma.service.findUnique({
      where: {
        id: parseInt(params.id)
      }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'الخدمة غير موجودة' },
        { status: 404 }
      )
    }

    console.log('✅ تم جلب تفاصيل الخدمة بنجاح')

    return NextResponse.json({
      success: true,
      service: service
    })

  } catch (error) {
    console.error('❌ خطأ في جلب تفاصيل الخدمة:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب تفاصيل الخدمة',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}