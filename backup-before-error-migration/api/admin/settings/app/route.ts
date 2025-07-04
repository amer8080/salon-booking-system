// src/app/api/admin/settings/app/route.ts
// API محسن لدعم جميع الإعدادات (Colors + Business)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  AppSettings,
  DEFAULT_APP_SETTINGS,
  TIMEZONE_OPTIONS,
  SLOT_DURATION_OPTIONS 
} from '@/types/theme.types';

/**
 * GET - تحميل جميع إعدادات التطبيق الشاملة
 */
export async function GET() {
  try {
    console.log('🔄 Loading comprehensive app settings...');

    // البحث عن الإعدادات الموجودة
    const [colorSettings, businessSettings] = await Promise.all([
      // الإعدادات القديمة (Colors + Week)
      prisma.setting.findUnique({
        where: { settingKey: 'app_settings' },
      }),
      // الإعدادات الجديدة (Business Settings)
      prisma.setting.findMany({
        where: {
          settingKey: {
            in: [
              'app_timezone',
              'business_hours_start',
              'business_hours_end', 
              'business_working_days',
              'default_slot_duration',
              'min_booking_gap',
              'lunch_break_enabled',
              'lunch_break_start',
              'lunch_break_end'
            ]
          }
        }
      })
    ]);

    // معالجة إعدادات الألوان والأسبوع
    let colorsAndWeek = DEFAULT_APP_SETTINGS.colors;
    let weekSettings = DEFAULT_APP_SETTINGS.week;
    
    if (colorSettings) {
      try {
        const savedSettings = JSON.parse(colorSettings.settingValue);
        colorsAndWeek = { ...DEFAULT_APP_SETTINGS.colors, ...savedSettings.colors };
        weekSettings = { ...DEFAULT_APP_SETTINGS.week, ...savedSettings.week };
      } catch (error) {
        console.warn('⚠️ Error parsing color settings, using defaults');
      }
    }

    // معالجة إعدادات العمل
    const businessData: Record<string, any> = {};
    businessSettings.forEach(setting => {
      let value: any = setting.settingValue;
      
      // تحويل البيانات لأنواعها الصحيحة
      if (setting.settingKey === 'business_working_days') {
        try {
          value = JSON.parse(value);
        } catch {
          value = DEFAULT_APP_SETTINGS.business.workingDays;
        }
      } else if (setting.settingKey === 'default_slot_duration' || setting.settingKey === 'min_booking_gap') {
        value = parseInt(value) || (setting.settingKey === 'default_slot_duration' ? 30 : 5);
      } else if (setting.settingKey === 'lunch_break_enabled') {
        value = value === 'true';
      }
      
      businessData[setting.settingKey] = value;
    });

    // بناء الإعدادات النهائية
    const finalSettings: AppSettings = {
      colors: colorsAndWeek,
      week: weekSettings,
      business: {
        timezone: businessData.app_timezone || DEFAULT_APP_SETTINGS.business.timezone,
        businessHours: {
          start: businessData.business_hours_start || DEFAULT_APP_SETTINGS.business.businessHours.start,
          end: businessData.business_hours_end || DEFAULT_APP_SETTINGS.business.businessHours.end,
        },
        workingDays: businessData.business_working_days || DEFAULT_APP_SETTINGS.business.workingDays,
        slotDuration: businessData.default_slot_duration || DEFAULT_APP_SETTINGS.business.slotDuration,
        minBookingGap: businessData.min_booking_gap || DEFAULT_APP_SETTINGS.business.minBookingGap,
      },
      lunchBreak: {
        enabled: businessData.lunch_break_enabled ?? DEFAULT_APP_SETTINGS.lunchBreak.enabled,
        start: businessData.lunch_break_start || DEFAULT_APP_SETTINGS.lunchBreak.start,
        end: businessData.lunch_break_end || DEFAULT_APP_SETTINGS.lunchBreak.end,
      }
    };

    console.log('✅ Comprehensive settings loaded successfully');

    return NextResponse.json({
      success: true,
      settings: finalSettings,
      message: 'تم تحميل جميع إعدادات التطبيق بنجاح',
      metadata: {
        colorSettingsFound: !!colorSettings,
        businessSettingsCount: businessSettings.length,
        loadedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('❌ Error loading app settings:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطأ في تحميل إعدادات التطبيق',
        settings: DEFAULT_APP_SETTINGS, // fallback للإعدادات الافتراضية
      },
      { status: 500 }
    );
  }
}

/**
 * POST - حفظ جميع إعدادات التطبيق الشاملة
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Saving comprehensive app settings...');
    
    const body = await request.json();
    const { settings }: { settings: Partial<AppSettings> } = body;

    // التحقق من صحة البيانات
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'بيانات الإعدادات غير صحيحة' },
        { status: 400 }
      );
    }

    // التحقق من صحة الألوان
    if (settings.colors) {
      const requiredColors = ['booked', 'blocked', 'available', 'today'];
      for (const colorKey of requiredColors) {
        if (settings.colors[colorKey as keyof typeof settings.colors]) {
          const color = settings.colors[colorKey as keyof typeof settings.colors];
          const hexPattern = /^#[0-9A-Fa-f]{6}$/;
          if (!hexPattern.test(color!)) {
            return NextResponse.json(
              { success: false, error: `لون ${colorKey} يجب أن يكون بصيغة HEX صحيحة` },
              { status: 400 }
            );
          }
        }
      }
    }

    // التحقق من صحة إعدادات الأسبوع
    if (settings.week?.firstDayOfWeek !== undefined) {
      const validDays = [0, 1, 6];
      if (!validDays.includes(settings.week.firstDayOfWeek)) {
        return NextResponse.json(
          { success: false, error: 'قيمة أول يوم في الأسبوع غير صحيحة' },
          { status: 400 }
        );
      }
    }

    // التحقق من صحة إعدادات العمل
    if (settings.business) {
      // التحقق من المنطقة الزمنية
      if (settings.business.timezone) {
        const validTimezones = TIMEZONE_OPTIONS.map(tz => tz.value);
        if (!validTimezones.includes(settings.business.timezone as any)) {
          return NextResponse.json(
            { success: false, error: 'المنطقة الزمنية غير مدعومة' },
            { status: 400 }
          );
        }
      }

      // التحقق من ساعات العمل
      if (settings.business.businessHours) {
        const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (settings.business.businessHours.start && !timePattern.test(settings.business.businessHours.start)) {
          return NextResponse.json(
            { success: false, error: 'وقت بداية العمل غير صحيح' },
            { status: 400 }
          );
        }
        if (settings.business.businessHours.end && !timePattern.test(settings.business.businessHours.end)) {
          return NextResponse.json(
            { success: false, error: 'وقت انتهاء العمل غير صحيح' },
            { status: 400 }
          );
        }
      }

      // التحقق من مدة المواعيد
      if (settings.business.slotDuration) {
        const validDurations = SLOT_DURATION_OPTIONS.map(opt => opt.value);
        if (!validDurations.includes(settings.business.slotDuration)) {
          return NextResponse.json(
            { success: false, error: 'مدة الموعد غير صحيحة' },
            { status: 400 }
          );
        }
      }
    }

    const updates = [];

    // حفظ إعدادات الألوان والأسبوع (JSON format)
    if (settings.colors || settings.week) {
      const colorWeekSettings = {
        colors: { ...DEFAULT_APP_SETTINGS.colors, ...settings.colors },
        week: { ...DEFAULT_APP_SETTINGS.week, ...settings.week }
      };

      updates.push(
        prisma.setting.upsert({
          where: { settingKey: 'app_settings' },
          update: {
            settingValue: JSON.stringify(colorWeekSettings),
            description: 'إعدادات الألوان والأسبوع',
            category: 'application',
          },
          create: {
            settingKey: 'app_settings',
            settingValue: JSON.stringify(colorWeekSettings),
            description: 'إعدادات الألوان والأسبوع',
            category: 'application',
          },
        })
      );
    }

    // حفظ إعدادات العمل (Individual keys)
    if (settings.business) {
      const business = settings.business;
      
      if (business.timezone) {
        updates.push(
          prisma.setting.upsert({
            where: { settingKey: 'app_timezone' },
            update: { settingValue: business.timezone },
            create: {
              settingKey: 'app_timezone',
              settingValue: business.timezone,
              description: 'المنطقة الزمنية للصالون',
              category: 'system'
            }
          })
        );
      }

      if (business.businessHours?.start) {
        updates.push(
          prisma.setting.upsert({
            where: { settingKey: 'business_hours_start' },
            update: { settingValue: business.businessHours.start },
            create: {
              settingKey: 'business_hours_start',
              settingValue: business.businessHours.start,
              description: 'وقت بداية العمل',
              category: 'schedule'
            }
          })
        );
      }

      if (business.businessHours?.end) {
        updates.push(
          prisma.setting.upsert({
            where: { settingKey: 'business_hours_end' },
            update: { settingValue: business.businessHours.end },
            create: {
              settingKey: 'business_hours_end',
              settingValue: business.businessHours.end,
              description: 'وقت انتهاء العمل',
              category: 'schedule'
            }
          })
        );
      }

      if (business.workingDays) {
        updates.push(
          prisma.setting.upsert({
            where: { settingKey: 'business_working_days' },
            update: { settingValue: JSON.stringify(business.workingDays) },
            create: {
              settingKey: 'business_working_days',
              settingValue: JSON.stringify(business.workingDays),
              description: 'أيام العمل',
              category: 'schedule'
            }
          })
        );
      }

      if (business.slotDuration) {
        updates.push(
          prisma.setting.upsert({
            where: { settingKey: 'default_slot_duration' },
            update: { settingValue: business.slotDuration.toString() },
            create: {
              settingKey: 'default_slot_duration',
              settingValue: business.slotDuration.toString(),
              description: 'مدة الموعد الافتراضي (دقيقة)',
              category: 'booking'
            }
          })
        );
      }

      if (business.minBookingGap !== undefined) {
        updates.push(
          prisma.setting.upsert({
            where: { settingKey: 'min_booking_gap' },
            update: { settingValue: business.minBookingGap.toString() },
            create: {
              settingKey: 'min_booking_gap',
              settingValue: business.minBookingGap.toString(),
              description: 'الحد الأدنى بين المواعيد (دقيقة)',
              category: 'booking'
            }
          })
        );
      }
    }

    // حفظ إعدادات استراحة الغداء
    if (settings.lunchBreak) {
      const lunch = settings.lunchBreak;
      
      if (lunch.enabled !== undefined) {
        updates.push(
          prisma.setting.upsert({
            where: { settingKey: 'lunch_break_enabled' },
            update: { settingValue: lunch.enabled.toString() },
            create: {
              settingKey: 'lunch_break_enabled',
              settingValue: lunch.enabled.toString(),
              description: 'تفعيل استراحة الغداء',
              category: 'schedule'
            }
          })
        );
      }

      if (lunch.start) {
        updates.push(
          prisma.setting.upsert({
            where: { settingKey: 'lunch_break_start' },
            update: { settingValue: lunch.start },
            create: {
              settingKey: 'lunch_break_start',
              settingValue: lunch.start,
              description: 'بداية استراحة الغداء',
              category: 'schedule'
            }
          })
        );
      }

      if (lunch.end) {
        updates.push(
          prisma.setting.upsert({
            where: { settingKey: 'lunch_break_end' },
            update: { settingValue: lunch.end },
            create: {
              settingKey: 'lunch_break_end',
              settingValue: lunch.end,
              description: 'نهاية استراحة الغداء',
              category: 'schedule'
            }
          })
        );
      }
    }

    // تنفيذ جميع التحديثات
    const results = await Promise.all(updates);

    console.log(`✅ Updated ${results.length} settings successfully`);

    return NextResponse.json({
      success: true,
      message: 'تم حفظ جميع إعدادات التطبيق بنجاح',
      updatedCount: results.length,
      savedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error saving comprehensive settings:', error);
    
    return NextResponse.json(
      { success: false, error: 'خطأ في حفظ الإعدادات' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - إعادة تعيين جميع الإعدادات للافتراضية
 */
export async function DELETE() {
  try {
    console.log('🔄 Resetting all settings to defaults...');

    // حذف جميع الإعدادات المخصصة
    await Promise.all([
      prisma.setting.deleteMany({
        where: { settingKey: 'app_settings' }
      }),
      prisma.setting.deleteMany({
        where: {
          settingKey: {
            in: [
              'app_timezone', 'business_hours_start', 'business_hours_end',
              'business_working_days', 'default_slot_duration', 'min_booking_gap',
              'lunch_break_enabled', 'lunch_break_start', 'lunch_break_end'
            ]
          }
        }
      })
    ]);

    console.log('✅ All settings reset to defaults');

    return NextResponse.json({
      success: true,
      message: 'تم إعادة تعيين جميع الإعدادات للافتراضية',
      settings: DEFAULT_APP_SETTINGS,
      resetAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error resetting settings:', error);
    
    return NextResponse.json(
      { success: false, error: 'خطأ في إعادة تعيين الإعدادات' },
      { status: 500 }
    );
  }
}