// src/app/api/test-settings/route.ts
// API محسن لاختبار نظام AppSettings - تحسينات بسيطة للملف الحالي

import { NextRequest, NextResponse } from 'next/server';
import { AppSettings } from '@/lib/app-settings';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔥 Testing AppSettings...');

    // اختبار قراءة جميع الإعدادات
    const [
      timezone,
      businessHours,
      slotDuration,
      workingDays,
      lunchBreak,
      allSettings
    ] = await Promise.all([
      AppSettings.getTimezone(),
      AppSettings.getBusinessHours(),
      AppSettings.getDefaultSlotDuration(),
      AppSettings.getWorkingDays(),
      AppSettings.getLunchBreak(),
      AppSettings.getAllSettings()
    ]);

    console.log('✅ AppSettings loaded successfully');
    console.log('📅 Timezone:', timezone);
    console.log('⏰ Business Hours:', businessHours);
    console.log('🕐 Slot Duration:', slotDuration);

    // إجراء اختبار validation
    const validation = await AppSettings.validateSettings();

    const testResults = {
      success: true,
      message: 'AppSettings يعمل بنجاح!',
      settings: {
        timezone,
        businessHours,
        slotDuration,
        workingDays,
        lunchBreak,
      },
      validation,
      allSettings,
      tests: {
        timezoneTest: {
          expected: 'Europe/Istanbul',
          actual: timezone,
          passed: timezone === 'Europe/Istanbul'
        },
        businessHoursTest: {
          expected: { start: '09:00', end: '18:00' },
          actual: businessHours,
          passed: businessHours.start === '09:00' && businessHours.end === '18:00'
        },
        slotDurationTest: {
          expected: 30,
          actual: slotDuration,
          passed: slotDuration === 30
        }
      },
      performance: {
        loadTime: new Date().toISOString(),
        cacheStatus: 'Loaded from database'
      }
    };

    return NextResponse.json(testResults);

  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error('❌ AppSettings Test Failed:', error.message);

    return NextResponse.json({
      success: false,
      error: 'فشل في اختبار AppSettings',
      details: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        type: error.constructor.name
      },
      troubleshooting: {
        possibleCauses: [
          'مشكلة في اتصال قاعدة البيانات',
          'مشكلة في Prisma Client',
          'إعدادات مفقودة في جدول settings',
          'مشكلة في server-side environment'
        ],
        suggestions: [
          'تحقق من اتصال قاعدة البيانات',
          'شغل: npx prisma generate',
          'تأكد من وجود الإعدادات في جدول settings'
        ]
      }
    }, { status: 500 });
  } else {
    console.error('❌ AppSettings Test Failed (unexpected):', error);

    return NextResponse.json({
      success: false,
      error: 'فشل في اختبار AppSettings',
      details: {
        message: String(error),
        stack: undefined,
        type: typeof error
      },
      troubleshooting: {
        possibleCauses: [
          'مشكلة في اتصال قاعدة البيانات',
          'مشكلة في Prisma Client',
          'إعدادات مفقودة في جدول settings',
          'مشكلة في server-side environment'
        ],
        suggestions: [
          'تحقق من اتصال قاعدة البيانات',
          'شغل: npx prisma generate',
          'تأكد من وجود الإعدادات في جدول settings'
        ]
      }
    }, { status: 500 });
  }
}

}

// تحديث محسن للإعدادات مع error handling أفضل
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settingKey, settingValue } = body;

    if (!settingKey || settingValue === undefined || settingValue === null) {
      return NextResponse.json({
        success: false,
        error: 'settingKey و settingValue مطلوبان'
      }, { status: 400 });
    }

    console.log(`🔄 Attempting to update setting: ${settingKey} = ${settingValue}`);

    try {
      // تحديث مباشر باستخدام Prisma بدلاً من AppSettings
      const updatedSetting = await prisma.setting.upsert({
        where: { settingKey: settingKey },
        update: { 
          settingValue: String(settingValue),
          updatedAt: new Date()
        },
        create: {
          settingKey: settingKey,
          settingValue: String(settingValue),
          description: `إعداد ${settingKey}`,
          category: 'system'
        }
      });

      console.log('✅ Database update successful:', updatedSetting);

      // 🔧 ENHANCED: إبطال cache بقوة أكبر
      AppSettings.clearCache();
      console.log('🗑️ Cache cleared');

      // 🔧 ENHANCED: إجبار إعادة تحميل cache
      await AppSettings.getAllSettings(); // هذا سيجبر إعادة تحميل cache
      console.log('🔄 Cache forcefully reloaded');

      // التحقق من التحديث بقراءة القيمة الجديدة
      let verificationResult = null;
      try {
        switch (settingKey) {
          case 'app_timezone':
            verificationResult = await AppSettings.getTimezone();
            break;
          case 'business_hours_start':
          case 'business_hours_end':
            verificationResult = await AppSettings.getBusinessHours();
            break;
          case 'default_slot_duration':
            verificationResult = await AppSettings.getDefaultSlotDuration();
            break;
          default:
            verificationResult = await AppSettings.getAllSettings();
            break;
        }
        console.log('✅ Verification successful:', verificationResult);
      } catch (verificationError) {
        console.warn('⚠️ Verification failed but update succeeded:', verificationError);
      }

      return NextResponse.json({
        success: true,
        message: 'تم تحديث الإعداد بنجاح',
        updated: {
          key: settingKey,
          newValue: settingValue,
          verified: verificationResult,
          timestamp: new Date().toISOString()
        },
        databaseResult: updatedSetting,
        cacheCleared: true,
        cacheReloaded: true, // 🔧 NEW: تأكيد إعادة تحميل cache
        instructions: 'يمكنك الآن اختبار available-times API لرؤية التأثير'
      });

    } catch (prismaError: any) {
      console.error('❌ Prisma update failed:', prismaError);
      
      return NextResponse.json({
        success: false,
        error: 'فشل في تحديث قاعدة البيانات',
        details: {
          message: prismaError.message,
          code: prismaError.code,
          type: 'DatabaseError'
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Setting Update Test Failed:', error);

    return NextResponse.json({
      success: false,
      error: 'فشل في اختبار تحديث الإعداد',
      details: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        type: error.constructor.name
      },
      troubleshooting: {
        possibleCauses: [
          'مشكلة في بيانات الـ request',
          'مشكلة في Prisma client',
          'مشكلة في database permissions',
          'مشكلة في AppSettings cache'
        ],
        suggestions: [
          'تحقق من أن settingKey و settingValue صحيحان',
          'تأكد من أن قاعدة البيانات متاحة',
          'جرب إعادة تشغيل dev server'
        ]
      }
    }, { status: 500 });
  }
}