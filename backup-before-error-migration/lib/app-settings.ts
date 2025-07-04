// src/lib/app-settings.ts - استخدام shared Prisma instance
import { prisma } from '@/lib/prisma'; // 🔧 استخدام shared instance

// إعدادات Cache
const CACHE_DURATION = 300000; // 5 دقائق بالميلي ثانية

// 🔧 FIXED: Global Cache Management - خارج الـ class
let globalSettingsCache: AppSettingsData | null = null;
let globalCacheTimestamp = 0;

// أنواع البيانات
interface AppSettingsData {
  app_timezone: string;
  business_hours_start: string;
  business_hours_end: string;
  default_slot_duration: number;
  lunch_break_enabled: boolean;
  lunch_break_start: string;
  lunch_break_end: string;
  business_working_days: number[];
  min_booking_gap: number;
}

export class AppSettings {
  /**
   * تحميل الإعدادات من قاعدة البيانات
   */
  private static async loadSettings(): Promise<AppSettingsData> {
    try {
      console.log('🔄 Loading settings from database...');
      
      const settings = await prisma.setting.findMany({
        where: {
          settingKey: {
            in: [
              'app_timezone',
              'business_hours_start', 
              'business_hours_end',
              'default_slot_duration',
              'lunch_break_enabled',
              'lunch_break_start',
              'lunch_break_end', 
              'business_working_days',
              'min_booking_gap'
            ]
          }
        }
      });

      console.log(`📊 Found ${settings.length} settings in database`);

      // تحويل النتائج إلى object
      const data: Record<string, string> = {};
      settings.forEach(setting => {
        data[setting.settingKey] = setting.settingValue;
        console.log(`📋 ${setting.settingKey}: ${setting.settingValue}`);
      });

      // إرجاع الإعدادات مع القيم الافتراضية
      const result = {
        app_timezone: data.app_timezone || 'Europe/Istanbul',
        business_hours_start: data.business_hours_start || '09:00',
        business_hours_end: data.business_hours_end || '18:00',
        default_slot_duration: parseInt(data.default_slot_duration) || 30,
        lunch_break_enabled: data.lunch_break_enabled === 'true',
        lunch_break_start: data.lunch_break_start || '13:00',
        lunch_break_end: data.lunch_break_end || '14:00',
        business_working_days: data.business_working_days ? 
          JSON.parse(data.business_working_days) : [1, 2, 3, 4, 5, 6],
        min_booking_gap: parseInt(data.min_booking_gap) || 5,
      };

      console.log('✅ Settings processed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      
      // إعدادات افتراضية في حالة الخطأ
      return {
        app_timezone: 'Europe/Istanbul',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        default_slot_duration: 30,
        lunch_break_enabled: false,
        lunch_break_start: '13:00',
        lunch_break_end: '14:00',
        business_working_days: [1, 2, 3, 4, 5, 6],
        min_booking_gap: 5,
      };
    }
  }

  /**
   * 🔧 FIXED: الحصول على الإعدادات مع Global Cache
   */
  private static async getSettings(forceRefresh = false): Promise<AppSettingsData> {
    const now = Date.now();
    
    // التحقق من الحاجة لإعادة تحميل
    const needsRefresh = forceRefresh || 
                        !globalSettingsCache || 
                        (now - globalCacheTimestamp) > CACHE_DURATION;
    
    if (needsRefresh) {
      console.log(`🔄 Cache ${forceRefresh ? 'force refresh' : 'expired'} - loading from database`);
      globalSettingsCache = await this.loadSettings();
      globalCacheTimestamp = now;
      console.log('✅ Global cache updated');
    } else {
      console.log('📋 Using cached settings');
    }
    
    return globalSettingsCache;
  }

  /**
   * الحصول على المنطقة الزمنية
   */
  static async getTimezone(): Promise<string> {
    const settings = await this.getSettings();
    return settings.app_timezone;
  }

  /**
   * الحصول على ساعات العمل
   */
  static async getBusinessHours(): Promise<{start: string, end: string}> {
    const settings = await this.getSettings();
    return {
      start: settings.business_hours_start,
      end: settings.business_hours_end
    };
  }

  /**
   * الحصول على مدة الموعد الافتراضي
   */
  static async getDefaultSlotDuration(): Promise<number> {
    const settings = await this.getSettings();
    return settings.default_slot_duration;
  }

  /**
   * الحصول على أيام العمل
   */
  static async getWorkingDays(): Promise<number[]> {
    const settings = await this.getSettings();
    return settings.business_working_days;
  }

  /**
   * معلومات استراحة الغداء
   */
  static async getLunchBreak(): Promise<{
    enabled: boolean;
    start: string;
    end: string;
  }> {
    const settings = await this.getSettings();
    return {
      enabled: settings.lunch_break_enabled,
      start: settings.lunch_break_start,
      end: settings.lunch_break_end
    };
  }

  /**
   * 🔧 FIXED: تحديث إعداد واحد مع Global Cache Clear
   */
  static async updateSetting(key: keyof AppSettingsData, value: string | number | boolean): Promise<boolean> {
    try {
      // تحويل القيمة لنص
      let stringValue: string;
      if (typeof value === 'boolean') {
        stringValue = value.toString();
      } else if (Array.isArray(value)) {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = value.toString();
      }

      console.log(`🔄 Updating ${key} = ${stringValue}`);

      // تحديث قاعدة البيانات باستخدام shared prisma
      await prisma.setting.upsert({
        where: { settingKey: key },
        update: { settingValue: stringValue },
        create: {
          settingKey: key,
          settingValue: stringValue,
          description: `إعداد ${key}`,
          category: 'system'
        }
      });

      // 🔧 FORCE GLOBAL CACHE CLEAR
      globalSettingsCache = null;
      globalCacheTimestamp = 0;
      console.log('🗑️ Global cache forcefully cleared');
      
      // إعادة تحميل فوري للتأكد
      await this.getSettings(true);
      
      console.log(`✅ Setting updated and cache refreshed: ${key} = ${stringValue}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error updating setting:', error);
      return false;
    }
  }

  /**
   * تحديث عدة إعدادات مرة واحدة
   */
  static async updateMultipleSettings(updates: Partial<AppSettingsData>): Promise<boolean> {
    try {
      for (const [key, value] of Object.entries(updates)) {
        let stringValue: string;

        if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else if (Array.isArray(value)) {
          stringValue = JSON.stringify(value);
        } else {
          stringValue = value.toString();
        }

        await prisma.setting.upsert({
          where: { settingKey: key },
          update: { settingValue: stringValue },
          create: {
            settingKey: key,
            settingValue: stringValue,
            description: `إعداد ${key}`,
            category: 'system'
          }
        });
      }

      // إبطال Cache
      globalSettingsCache = null;
      globalCacheTimestamp = 0;
      
      return true;
    } catch (error) {
      console.error('❌ Error updating multiple settings:', error);
      return false;
    }
  }

  /**
   * 🔧 FIXED: مسح Global Cache
   */
  static clearCache(): void {
    console.log('🧹 Clearing global settings cache...');
    globalSettingsCache = null;
    globalCacheTimestamp = 0;
    console.log('✅ Global cache cleared');
  }

  /**
   * الحصول على جميع الإعدادات مع force refresh
   */
  static async getAllSettings(forceRefresh = false): Promise<AppSettingsData> {
    return this.getSettings(forceRefresh);
  }

  /**
   * التحقق من صحة الإعدادات
   */
  static async validateSettings(): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const settings = await this.getSettings();
      const errors: string[] = [];

      // التحقق من المنطقة الزمنية
      if (!settings.app_timezone) {
        errors.push('المنطقة الزمنية مطلوبة');
      }

      // التحقق من ساعات العمل
      if (!settings.business_hours_start || !settings.business_hours_end) {
        errors.push('ساعات العمل مطلوبة');
      }

      // التحقق من مدة الموعد
      if (settings.default_slot_duration < 15 || settings.default_slot_duration > 120) {
        errors.push('مدة الموعد يجب أن تكون بين 15-120 دقيقة');
      }

      return { valid: errors.length === 0, errors };
    } catch {
      return { valid: false, errors: ['خطأ في التحقق من الإعدادات'] };
    }
  }
}

// تصدير الأنواع للاستخدام في أماكن أخرى
export type { AppSettingsData };