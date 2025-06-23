import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// الألوان الافتراضية
const DEFAULT_COLORS = {
  booked: '#f97316',    // orange-500
  blocked: '#ef4444',   // red-500
  available: '#f9fafb', // gray-50
  today: '#4f46e5'      // indigo-600
}

/**
 * GET - تحميل إعدادات الألوان
 */
export async function GET() {
  try {
    // البحث عن إعدادات الألوان في قاعدة البيانات
    const colorSetting = await prisma.setting.findUnique({
      where: {
        settingKey: 'booking_colors'
      }
    })

    if (colorSetting) {
      // تحليل JSON وإرجاع الألوان المحفوظة
      const savedColors = JSON.parse(colorSetting.settingValue)
      
      return NextResponse.json({
        success: true,
        colors: savedColors,
        message: 'تم تحميل إعدادات الألوان بنجاح'
      })
    } else {
      // إرجاع الألوان الافتراضية إذا لم توجد إعدادات محفوظة
      return NextResponse.json({
        success: true,
        colors: DEFAULT_COLORS,
        message: 'تم تحميل الألوان الافتراضية'
      })
    }

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في تحميل إعدادات الألوان',
      colors: DEFAULT_COLORS // إعادة الألوان الافتراضية عند الخطأ
    }, { status: 500 })
  }
}

/**
 * POST - حفظ إعدادات الألوان
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { colors } = body

    // التحقق من صحة البيانات
    if (!colors || typeof colors !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'بيانات الألوان غير صحيحة'
      }, { status: 400 })
    }

    // التحقق من وجود جميع الألوان المطلوبة
    const requiredColors = ['booked', 'blocked', 'available', 'today']
    for (const colorKey of requiredColors) {
      if (!colors[colorKey] || typeof colors[colorKey] !== 'string') {
        return NextResponse.json({
          success: false,
          error: `لون ${colorKey} مطلوب ويجب أن يكون نص`
        }, { status: 400 })
      }

      // التحقق من صيغة HEX
      const hexPattern = /^#[0-9A-Fa-f]{6}$/
      if (!hexPattern.test(colors[colorKey])) {
        return NextResponse.json({
          success: false,
          error: `لون ${colorKey} يجب أن يكون بصيغة HEX صحيحة (مثل #ff0000)`
        }, { status: 400 })
      }
    }

    // حفظ أو تحديث الإعدادات في قاعدة البيانات
    const savedSetting = await prisma.setting.upsert({
      where: {
        settingKey: 'booking_colors'
      },
      update: {
        settingValue: JSON.stringify(colors),
        description: 'ألوان نظام الحجوزات المخصصة',
        category: 'appearance'
      },
      create: {
        settingKey: 'booking_colors',
        settingValue: JSON.stringify(colors),
        description: 'ألوان نظام الحجوزات المخصصة',
        category: 'appearance'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ إعدادات الألوان بنجاح',
      colors: colors,
      savedAt: savedSetting.updatedAt
    })

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في حفظ إعدادات الألوان'
    }, { status: 500 })
  }
}

/**
 * DELETE - حذف إعدادات الألوان (إعادة تعيين للافتراضية)
 */
export async function DELETE() {
  try {
    // حذف الإعدادات المحفوظة
    await prisma.setting.deleteMany({
      where: {
        settingKey: 'booking_colors'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إعادة تعيين الألوان للافتراضية',
      colors: DEFAULT_COLORS
    })

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في إعادة تعيين الألوان'
    }, { status: 500 })
  }
}