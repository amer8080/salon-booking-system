// src/types/theme.types.ts
// أنواع البيانات للنظام الموحد - دمج Colors + Business Settings

/**
 * ألوان الحجوزات الأساسية
 */
export interface BookingColors {
  booked: string; // لون الحجوزات المؤكدة
  blocked: string; // لون الأوقات المقفلة
  available: string; // لون الأوقات المتاحة
  today: string; // لون اليوم الحالي
}

/**
 * إعدادات الأسبوع
 */
export interface WeekSettings {
  firstDayOfWeek: 0 | 1 | 6; // 0=الأحد، 1=الإثنين، 6=السبت
}

/**
 * إعدادات العمل الأساسية - جديد
 */
export interface BusinessSettings {
  // التوقيت
  timezone: string; // المنطقة الزمنية
  
  // ساعات العمل
  businessHours: {
    start: string; // وقت بداية العمل (HH:mm)
    end: string;   // وقت انتهاء العمل (HH:mm)
  };
  
  // أيام العمل
  workingDays: number[]; // [0,1,2,3,4,5,6] - 0=الأحد
  
  // إعدادات المواعيد
  slotDuration: number; // مدة الموعد (دقيقة)
  minBookingGap: number; // الحد الأدنى بين المواعيد (دقيقة)
}

/**
 * إعدادات استراحة الغداء - متقدم
 */
export interface LunchBreakSettings {
  enabled: boolean;
  start: string; // وقت بداية الاستراحة (HH:mm)
  end: string;   // وقت انتهاء الاستراحة (HH:mm)
}

/**
 * جميع إعدادات التطبيق الشاملة - محدث
 */
export interface AppSettings {
  colors: BookingColors;
  week: WeekSettings;
  business: BusinessSettings;        // جديد
  lunchBreak: LunchBreakSettings;   // جديد
}

/**
 * حالة Context الشاملة - محدث
 */
export interface EnhancedThemeState {
  // البيانات الأساسية
  colors: BookingColors;
  weekSettings: WeekSettings;
  businessSettings: BusinessSettings;      // جديد
  lunchBreakSettings: LunchBreakSettings;  // جديد
  
  // حالة النظام
  isLoading: boolean;
  error: string | null;

  // دوال التحديث الأساسية
  updateColors: (colors: Partial<BookingColors>) => Promise<void>;
  updateWeekSettings: (settings: Partial<WeekSettings>) => Promise<void>;
  
  // دوال التحديث الجديدة
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => Promise<void>;
  updateLunchBreakSettings: (settings: Partial<LunchBreakSettings>) => Promise<void>;
  
  // دوال النظام
  resetToDefaults: () => Promise<void>;
  reloadSettings: () => Promise<void>;
}

/**
 * الألوان الافتراضية
 */
export const DEFAULT_COLORS: BookingColors = {
  booked: '#f97316', // orange-500
  blocked: '#ef4444', // red-500
  available: '#f9fafb', // gray-50
  today: '#4f46e5', // indigo-600
};

/**
 * إعدادات الأسبوع الافتراضية
 */
export const DEFAULT_WEEK_SETTINGS: WeekSettings = {
  firstDayOfWeek: 0, // الأحد
};

/**
 * إعدادات العمل الافتراضية - جديد
 */
export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  timezone: 'Europe/Istanbul',
  businessHours: {
    start: '09:00',
    end: '18:00',
  },
  workingDays: [1, 2, 3, 4, 5, 6], // الإثنين - السبت
  slotDuration: 30,
  minBookingGap: 5,
};

/**
 * إعدادات استراحة الغداء الافتراضية - جديد
 */
export const DEFAULT_LUNCH_BREAK_SETTINGS: LunchBreakSettings = {
  enabled: false,
  start: '13:00',
  end: '14:00',
};

/**
 * جميع الإعدادات الافتراضية الشاملة - محدث
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  colors: DEFAULT_COLORS,
  week: DEFAULT_WEEK_SETTINGS,
  business: DEFAULT_BUSINESS_SETTINGS,        // جديد
  lunchBreak: DEFAULT_LUNCH_BREAK_SETTINGS,   // جديد
};

/**
 * مفاتيح CSS Variables
 */
export const CSS_VARIABLES = {
  BOOKED: '--booking-color-booked',
  BLOCKED: '--booking-color-blocked',
  AVAILABLE: '--booking-color-available',
  TODAY: '--booking-color-today',
} as const;

/**
 * أسماء الألوان للعرض
 */
export const COLOR_LABELS = {
  booked: 'الحجوزات المؤكدة',
  blocked: 'الأوقات المقفلة',
  available: 'الأوقات المتاحة',
  today: 'اليوم الحالي',
} as const;

/**
 * أسماء إعدادات العمل للعرض - جديد
 */
export const BUSINESS_LABELS = {
  timezone: 'المنطقة الزمنية',
  businessHours: 'ساعات العمل',
  workingDays: 'أيام العمل',
  slotDuration: 'مدة الموعد',
  minBookingGap: 'الفترة بين المواعيد',
} as const;

/**
 * أسماء أيام الأسبوع للعرض - جديد
 */
export const DAY_LABELS = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
} as const;

/**
 * خيارات المناطق الزمنية المدعومة - جديد
 */
export const TIMEZONE_OPTIONS = [
  { value: 'Europe/Istanbul', label: 'إسطنبول (UTC+3)' },
  { value: 'Europe/London', label: 'لندن (UTC+0)' },
  { value: 'Europe/Paris', label: 'باريس (UTC+1)' },
  { value: 'Asia/Dubai', label: 'دبي (UTC+4)' },
  { value: 'Asia/Riyadh', label: 'الرياض (UTC+3)' },
  { value: 'Africa/Cairo', label: 'القاهرة (UTC+2)' },
] as const;

/**
 * خيارات مدة المواعيد - جديد
 */
export const SLOT_DURATION_OPTIONS = [
  { value: 15, label: '15 دقيقة' },
  { value: 30, label: '30 دقيقة' },
  { value: 45, label: '45 دقيقة' },
  { value: 60, label: '60 دقيقة' },
] as const;

/**
 * نوع البيانات للتوافق مع النظام السابق
 */
export type ColorThemeState = EnhancedThemeState;