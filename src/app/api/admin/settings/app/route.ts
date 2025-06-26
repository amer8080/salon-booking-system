import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// الإعدادات الافتراضية الشاملة
const DEFAULT_APP_SETTINGS = {
  colors: {
    booked: '#f97316',    // orange-500
    blocked: '#ef4444',   // red-500
    available: '#f9fafb', // gray-50
    today: '#4f46e5'      // indigo-600
  },
  week: {
    firstDayOfWeek: 0     // الأحد (افتراضي)
  }
}

/**
 * GET - تحميل جميع إعدادات التطبيق
 */
export async function GET() {
  try {
    // البحث عن إعدادات التطبيق في قاعدة البيانات
    const appSetting = await prisma.setting.findUnique({
      where: {
        settingKey: 'app_settings'
      }
    })

    if (appSetting) {
      // تحليل JSON وإرجاع الإعدادات المحفوظة
      const savedSettings = JSON.parse(appSetting.settingValue)
      
      // دمج مع الإعدادات الافتراضية للحفاظ على التوافقية
      const mergedSettings = {
        colors: { ...DEFAULT_APP_SETTINGS.colors, ...savedSettings.colors },
        week: { ...DEFAULT_APP_SETTINGS.week, ...savedSettings.week }
      }
      
      return NextResponse.json({
        success: true,
        settings: mergedSettings,
        message: 'تم تحميل إعدادات التطبيق بنجاح'
      })
    } else {
      // إرجاع الإعدادات الافتراضية إذا لم توجد إعدادات محفوظة
      return NextResponse.json({
        success: true,
        settings: DEFAULT_APP_SETTINGS,
        message: 'تم تحميل الإعدادات الافتراضية'
      })
    }

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في تحميل إعدادات التطبيق',
      settings: DEFAULT_APP_SETTINGS // إعادة الإعدادات الافتراضية عند الخطأ
    }, { status: 500 })
  }
}

/**
 * POST - حفظ إعدادات التطبيق
 */
export async function POST(_request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    // التحقق من صحة البيانات
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'بيانات الإعدادات غير صحيحة'
      }, { status: 400 })
    }

    // التحقق من صحة الألوان
    if (settings.colors) {
      const requiredColors = ['booked', 'blocked', 'available', 'today']
      for (const colorKey of requiredColors) {
        if (settings.colors[colorKey] && typeof settings.colors[colorKey] === 'string') {
          // التحقق من صيغة HEX
          const hexPattern = /^#[0-9A-Fa-f]{6}$/
          if (!hexPattern.test(settings.colors[colorKey])) {
            return NextResponse.json({
              success: false,
              error: `لون ${colorKey} يجب أن يكون بصيغة HEX صحيحة (مثل #ff0000)`
            }, { status: 400 })
          }
        }
      }
    }

    // التحقق من صحة إعدادات الأسبوع
    if (settings.week && settings.week.firstDayOfWeek !== undefined) {
      const validDays = [0, 1, 6] // الأحد، الإثنين، السبت
      if (!validDays.includes(settings.week.firstDayOfWeek)) {
        return NextResponse.json({
          success: false,
          error: 'قيمة أول يوم في الأسبوع غير صحيحة (يجب أن تكون 0، 1، أو 6)'
        }, { status: 400 })
      }
    }

    // دمج مع الإعدادات الافتراضية
    const finalSettings = {
      colors: { ...DEFAULT_APP_SETTINGS.colors, ...settings.colors },
      week: { ...DEFAULT_APP_SETTINGS.week, ...settings.week }
    }

    // حفظ أو تحديث الإعدادات في قاعدة البيانات
    const savedSetting = await prisma.setting.upsert({
      where: {
        settingKey: 'app_settings'
      },
      update: {
        settingValue: JSON.stringify(finalSettings),
        description: 'إعدادات التطبيق الشاملة (الألوان والأسبوع)',
        category: 'application'
      },
      create: {
        settingKey: 'app_settings',
        settingValue: JSON.stringify(finalSettings),
        description: 'إعدادات التطبيق الشاملة (الألوان والأسبوع)',
        category: 'application'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ إعدادات التطبيق بنجاح',
      settings: finalSettings,
      savedAt: savedSetting.updatedAt
    })

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في حفظ إعدادات التطبيق'
    }, { status: 500 })
  }
}

/**
 * DELETE - حذف إعدادات التطبيق (إعادة تعيين للافتراضية)
 */
export async function DELETE() {
  try {
    // حذف الإعدادات المحفوظة
    await prisma.setting.deleteMany({
      where: {
        settingKey: 'app_settings'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إعادة تعيين الإعدادات للافتراضية',
      settings: DEFAULT_APP_SETTINGS
    })

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في إعادة تعيين الإعدادات'
    }, { status: 500 })
  }
}

/**
 * دالة مساعدة للحصول على إعدادات أول يوم في الأسبوع فقط
 */
export async function getFirstDayOfWeek(): Promise<number> {
  try {
    const appSetting = await prisma.setting.findUnique({
      where: { settingKey: 'app_settings' }
    })

    if (appSetting) {
      const settings = JSON.parse(appSetting.settingValue)
      return settings.week?.firstDayOfWeek ?? DEFAULT_APP_SETTINGS.week.firstDayOfWeek
    }

    return DEFAULT_APP_SETTINGS.week.firstDayOfWeek
  } catch (error) {
    return DEFAULT_APP_SETTINGS.week.firstDayOfWeek
  }
}

