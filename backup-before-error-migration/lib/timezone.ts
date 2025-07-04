// src/lib/timezone.ts
// مكتبة التوقيت الديناميكية الكاملة - جميع الدوال المطلوبة
import { AppSettings } from './app-settings';

// متغير مؤقت للتوافق مع الكود الحالي
export const ISTANBUL_TIMEZONE = 'Europe/Istanbul';

// 🔧 DYNAMIC: الحصول على المنطقة الزمنية الديناميكية
export async function getAppTimezone(): Promise<string> {
  try {
    return await AppSettings.getTimezone();
  } catch (error) {
    console.error('خطأ في قراءة المنطقة الزمنية:', error);
    return ISTANBUL_TIMEZONE; // fallback للقيمة الافتراضية
  }
}

/**
 * 🔧 UPDATED: إنشاء تاريخ جديد بالمنطقة الزمنية الديناميكية
 */
export async function createAppTimezoneDate(dateInput?: string | number | Date): Promise<Date> {
  const timezone = await getAppTimezone();
  
  if (!dateInput) {
    // التاريخ والوقت الحالي بالمنطقة الزمنية المحددة
    return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  }

  if (typeof dateInput === 'string') {
    // إذا كان النص يحتوي على وقت، نستخدمه مباشرة
    if (dateInput.includes('T') || dateInput.includes(' ')) {
      return new Date(dateInput);
    }
    // إذا كان تاريخ فقط، نضيف الوقت الافتراضي
    return new Date(dateInput + 'T00:00:00');
  }

  return new Date(dateInput);
}

/**
 * 🔧 UPDATED: تحويل تاريخ ووقت للمنطقة الزمنية الديناميكية
 */
export async function toAppTimezoneTime(date: Date): Promise<Date> {
  const timezone = await getAppTimezone();
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * LEGACY: إنشاء تاريخ جديد بتوقيت إسطنبول (للتوافق مع الكود الحالي)
 */
export function createIstanbulDate(dateInput?: string | number | Date): Date {
  if (!dateInput) {
    // التاريخ والوقت الحالي بتوقيت إسطنبول
    return new Date(new Date().toLocaleString('en-US', { timeZone: ISTANBUL_TIMEZONE }));
  }

  if (typeof dateInput === 'string') {
    // إذا كان النص يحتوي على وقت، نستخدمه مباشرة
    if (dateInput.includes('T') || dateInput.includes(' ')) {
      return new Date(dateInput);
    }
    // إذا كان تاريخ فقط، نضيف الوقت الافتراضي
    return new Date(dateInput + 'T00:00:00');
  }

  return new Date(dateInput);
}

/**
 * LEGACY: تحويل تاريخ ووقت لتوقيت إسطنبول (للتوافق مع الكود الحالي)
 */
export function toIstanbulTime(date: Date): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: ISTANBUL_TIMEZONE }));
}

/**
 * 🔧 NEW: الحصول على بداية اليوم بتوقيت إسطنبول
 */
export function getIstanbulStartOfDay(date?: Date): Date {
  const targetDate = date || createIstanbulDate();
  const istanbulDate = toIstanbulTime(targetDate);
  return new Date(istanbulDate.getFullYear(), istanbulDate.getMonth(), istanbulDate.getDate(), 0, 0, 0, 0);
}

/**
 * 🔧 NEW: الحصول على نهاية اليوم بتوقيت إسطنبول
 */
export function getIstanbulEndOfDay(date?: Date): Date {
  const targetDate = date || createIstanbulDate();
  const istanbulDate = toIstanbulTime(targetDate);
  return new Date(istanbulDate.getFullYear(), istanbulDate.getMonth(), istanbulDate.getDate(), 23, 59, 59, 999);
}

/**
 * 🔧 NEW: تحويل وقت من قاعدة البيانات لتوقيت إسطنبول
 */
export function fromDatabaseTime(date: Date): Date {
  // قاعدة البيانات تحفظ بـ UTC، نحتاج تحويل لتوقيت إسطنبول
  return toIstanbulTime(date);
}

/**
 * 🔧 NEW: تحويل وقت إسطنبول لحفظ في قاعدة البيانات
 */
export function toDatabaseTime(date: Date): Date {
  // تحويل من توقيت إسطنبول إلى UTC للحفظ
  const istanbulDate = toIstanbulTime(date);
  const utcDate = new Date(istanbulDate.toISOString());
  return utcDate;
}

/**
 * 🔧 UPDATED: إنشاء تاريخ من سلسلة نصية بالمنطقة الزمنية الديناميكية
 */
export async function parseAppTimezoneDate(dateString: string, timeString?: string): Promise<Date> {
  const timezone = await getAppTimezone();
  
  if (timeString) {
    const dateTimeString = `${dateString}T${timeString}:00`;
    const date = new Date(dateTimeString);
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  }
  
  const date = new Date(dateString + 'T00:00:00');
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * LEGACY: إنشاء تاريخ من سلسلة نصية بتوقيت إسطنبول (للتوافق مع الكود الحالي)
 */
export function parseIstanbulDate(dateString: string, timeString?: string): Date {
  if (timeString) {
    const dateTimeString = `${dateString}T${timeString}:00`;
    const date = new Date(dateTimeString);
    return toIstanbulTime(date);
  }
  
  const date = new Date(dateString + 'T00:00:00');
  return toIstanbulTime(date);
}

/**
 * 🔧 UPDATED: تنسيق التاريخ بالمنطقة الزمنية الديناميكية
 */
export async function formatAppTimezoneDate(
  date?: Date, 
  format: 'date' | 'time' | 'datetime' | 'day' = 'date'
): Promise<string> {
  const timezone = await getAppTimezone();
  const targetDate = date || await createAppTimezoneDate();
  const timezoneDate = new Date(targetDate.toLocaleString('en-US', { timeZone: timezone }));

  const options: Intl.DateTimeFormatOptions = { timeZone: timezone };

  switch (format) {
    case 'date':
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      return timezoneDate.toLocaleDateString('ar-SA', options);
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
      return timezoneDate.toLocaleTimeString('ar-SA', options);
    case 'datetime':
      return timezoneDate.toLocaleString('ar-SA', {
        ...options,
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    case 'day':
      options.weekday = 'long';
      return timezoneDate.toLocaleDateString('ar-SA', options);
    default:
      return timezoneDate.toLocaleDateString('ar-SA', options);
  }
}

/**
 * LEGACY: تنسيق التاريخ بتوقيت إسطنبول (للتوافق مع الكود الحالي)
 */
export function formatIstanbulDate(
  date?: Date, 
  format: 'date' | 'time' | 'datetime' | 'day' = 'date'
): string {
  const targetDate = date || createIstanbulDate();
  const istanbulDate = toIstanbulTime(targetDate);

  const options: Intl.DateTimeFormatOptions = { timeZone: ISTANBUL_TIMEZONE };

  switch (format) {
    case 'date':
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      return istanbulDate.toLocaleDateString('ar-SA', options);
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
      return istanbulDate.toLocaleTimeString('ar-SA', options);
    case 'datetime':
      return istanbulDate.toLocaleString('ar-SA', {
        ...options,
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    case 'day':
      options.weekday = 'long';
      return istanbulDate.toLocaleDateString('ar-SA', options);
    default:
      return istanbulDate.toLocaleDateString('ar-SA', options);
  }
}

/**
 * 🔧 UPDATED: التحقق من كون التاريخ هو اليوم (بالمنطقة الزمنية الديناميكية)
 */
export async function isTodayApp(date: Date): Promise<boolean> {
  const timezone = await getAppTimezone();
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const targetDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  
  return today.toDateString() === targetDate.toDateString();
}

/**
 * LEGACY: التحقق من كون التاريخ هو اليوم (بتوقيت إسطنبول)
 */
export function isToday(date: Date): boolean {
  const today = createIstanbulDate();
  const targetDate = toIstanbulTime(date);
  
  return today.toDateString() === targetDate.toDateString();
}

/**
 * 🔧 UPDATED: مقارنة تاريخين (بالمنطقة الزمنية الديناميكية)
 */
export async function compareDatesApp(date1: Date, date2: Date): Promise<number> {
  const timezone = await getAppTimezone();
  const app1 = new Date(date1.toLocaleString('en-US', { timeZone: timezone }));
  const app2 = new Date(date2.toLocaleString('en-US', { timeZone: timezone }));
  
  return app1.getTime() - app2.getTime();
}

/**
 * LEGACY: مقارنة تاريخين (بتوقيت إسطنبول)
 */
export function compareDates(date1: Date, date2: Date): number {
  const istanbul1 = toIstanbulTime(date1);
  const istanbul2 = toIstanbulTime(date2);
  
  return istanbul1.getTime() - istanbul2.getTime();
}

/**
 * 🔧 UPDATED: الحصول على تاريخ اليوم (بالمنطقة الزمنية الديناميكية)
 */
export async function getTodayApp(): Promise<string> {
  return formatAppTimezoneDate(await createAppTimezoneDate(), 'date');
}

/**
 * LEGACY: الحصول على تاريخ اليوم (بتوقيت إسطنبول)
 */
export function getTodayIstanbul(): string {
  return formatIstanbulDate(createIstanbulDate(), 'date');
}

/**
 * 🔧 UPDATED: إضافة أيام لتاريخ (بالمنطقة الزمنية الديناميكية)
 */
export async function addDaysApp(date: Date, days: number): Promise<Date> {
  const timezone = await getAppTimezone();
  const today = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  today.setDate(today.getDate() + days);
  return new Date(today.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * LEGACY: إضافة أيام لتاريخ (بتوقيت إسطنبول)
 */
export function addDays(date: Date, days: number): Date {
  const today = createIstanbulDate();
  const istanbulDate = toIstanbulTime(date);
  istanbulDate.setDate(istanbulDate.getDate() + days);
  return istanbulDate;
}

/**
 * تنسيق التاريخ بالعربية
 */
export function formatArabicDate(date: Date): string {
  const istanbulDate = toIstanbulTime(date);
  return istanbulDate.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric',
    timeZone: ISTANBUL_TIMEZONE
  });
}

/**
 * 🔧 UPDATED: التحقق من انتهاء صلاحية الوقت (بالمنطقة الزمنية الديناميكية)
 */
export async function isTimeExpiredApp(dateString: string, timeString: string): Promise<boolean> {
  const timezone = await getAppTimezone();
  const appointmentDateTime = new Date(`${dateString}T${timeString}`);
  const currentTime = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  
  return appointmentDateTime < currentTime;
}

/**
 * LEGACY: التحقق من انتهاء صلاحية الوقت (بتوقيت إسطنبول)
 */
export function isTimeExpired(dateString: string, timeString: string): boolean {
  const appointmentDateTime = new Date(`${dateString}T${timeString}`);
  const currentDate = toIstanbulTime(new Date());
  
  return appointmentDateTime < currentDate;
}

/**
 * 🔧 NEW: Helper function للتحويل من Legacy إلى Dynamic
 */
export async function convertToAppTimezone(): Promise<void> {
  console.log('🔄 Converting legacy timezone functions to dynamic system...');
  const currentTimezone = await getAppTimezone();
  console.log(`✅ Current app timezone: ${currentTimezone}`);
}