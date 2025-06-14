// src/lib/timezone.ts
// مكتبة التوقيت المساعدة لتوقيت إسطنبول (GMT+3)

export const ISTANBUL_TIMEZONE = 'Europe/Istanbul'

/**
 * إنشاء تاريخ جديد بتوقيت إسطنبول
 */
export function createIstanbulDate(dateInput?: string | number | Date): Date {
  if (!dateInput) {
    // التاريخ والوقت الحالي بتوقيت إسطنبول
    return new Date(new Date().toLocaleString("en-US", { timeZone: ISTANBUL_TIMEZONE }))
  }
  
  if (typeof dateInput === 'string') {
    // إذا كان النص يحتوي على وقت، نستخدمه مباشرة
    if (dateInput.includes('T') || dateInput.includes(' ')) {
      return new Date(dateInput)
    }
    // إذا كان تاريخ فقط، نضيف الوقت الافتراضي
    return new Date(dateInput + 'T00:00:00')
  }
  
  return new Date(dateInput)
}

/**
 * تحويل تاريخ ووقت لتوقيت إسطنبول
 */
export function toIstanbulTime(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: ISTANBUL_TIMEZONE }))
}

/**
 * إنشاء تاريخ من سلسلة نصية بتوقيت إسطنبول
 */
export function parseIstanbulDate(dateString: string, timeString?: string): Date {
  if (timeString) {
    // دمج التاريخ والوقت
    const [year, month, day] = dateString.split('-').map(Number)
    const [hours, minutes] = timeString.split(':').map(Number)
    
    // إنشاء التاريخ بالتوقيت المحلي مباشرة (بدون تحويل UTC)
    return new Date(year, month - 1, day, hours, minutes, 0, 0)
  }
  
  // تاريخ فقط
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * تنسيق التاريخ بتوقيت إسطنبول
 */
export function formatIstanbulDate(date: Date, format: 'date' | 'time' | 'datetime' = 'date'): string {
  const istanbulDate = toIstanbulTime(date)
  
  switch (format) {
    case 'date':
      return istanbulDate.toLocaleDateString('en-CA') // YYYY-MM-DD
    case 'time':
      return istanbulDate.toLocaleTimeString('en-GB', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }) // HH:MM
    case 'datetime':
      return istanbulDate.toLocaleString('sv-SE').replace(' ', 'T') // YYYY-MM-DDTHH:MM:SS
    default:
      return istanbulDate.toISOString()
  }
}

/**
 * الحصول على بداية اليوم بتوقيت إسطنبول
 */
export function getIstanbulStartOfDay(date?: Date): Date {
  const targetDate = date || createIstanbulDate()
  const istanbulDate = toIstanbulTime(targetDate)
  return new Date(istanbulDate.getFullYear(), istanbulDate.getMonth(), istanbulDate.getDate(), 0, 0, 0, 0)
}

/**
 * الحصول على نهاية اليوم بتوقيت إسطنبول
 */
export function getIstanbulEndOfDay(date?: Date): Date {
  const targetDate = date || createIstanbulDate()
  const istanbulDate = toIstanbulTime(targetDate)
  return new Date(istanbulDate.getFullYear(), istanbulDate.getMonth(), istanbulDate.getDate(), 23, 59, 59, 999)
}

/**
 * تحويل التوقيت من قاعدة البيانات للعرض
 */
export function fromDatabaseTime(dbDateTime: string | Date): Date {
  const date = typeof dbDateTime === 'string' ? new Date(dbDateTime) : dbDateTime
  // نعتبر أن الوقت في قاعدة البيانات هو بتوقيت إسطنبول
  return date
}

/**
 * تحويل التوقيت للحفظ في قاعدة البيانات
 */
export function toDatabaseTime(localDateTime: Date): Date {
  // نحفظ التوقيت كما هو (بتوقيت إسطنبول)
  return localDateTime
}

/**
 * مقارنة تاريخين بتوقيت إسطنبول (بدون الوقت)
 */
export function isSameDayIstanbul(date1: Date, date2: Date): boolean {
  const istanbul1 = toIstanbulTime(date1)
  const istanbul2 = toIstanbulTime(date2)
  
  return istanbul1.getFullYear() === istanbul2.getFullYear() &&
         istanbul1.getMonth() === istanbul2.getMonth() &&
         istanbul1.getDate() === istanbul2.getDate()
}

/**
 * الحصول على التاريخ الحالي بصيغة YYYY-MM-DD بتوقيت إسطنبول
 */
export function getTodayIstanbul(): string {
  return formatIstanbulDate(createIstanbulDate(), 'date')
}

/**
 * التحقق من كون التاريخ اليوم بتوقيت إسطنبول
 */
export function isToday(date: Date): boolean {
  const today = createIstanbulDate()
  return isSameDayIstanbul(date, today)
}

/**
 * إضافة/طرح أيام من تاريخ بتوقيت إسطنبول
 */
export function addDaysIstanbul(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * الحصول على اسم اليوم بالعربية
 */
export function getArabicDayName(date: Date): string {
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const istanbulDate = toIstanbulTime(date)
  return dayNames[istanbulDate.getDay()]
}

/**
 * الحصول على اسم الشهر بالعربية
 */
export function getArabicMonthName(date: Date): string {
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]
  const istanbulDate = toIstanbulTime(date)
  return monthNames[istanbulDate.getMonth()]
}

/**
 * تنسيق التاريخ بالعربية بتوقيت إسطنبول
 */
export function formatArabicDate(date: Date): string {
  const istanbulDate = toIstanbulTime(date)
  const dayName = getArabicDayName(istanbulDate)
  const monthName = getArabicMonthName(istanbulDate)
  const day = istanbulDate.getDate()
  const year = istanbulDate.getFullYear()
  
  return `${dayName}، ${day} ${monthName} ${year}`
}