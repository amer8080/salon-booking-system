// src/app/book/utils/calendar-generator.ts
// مولد التقويم المحسن مع دعم التفاعل والجوال

import { 
  createIstanbulDate, 
  formatIstanbulDate, 
   
   
  isToday,
  getArabicDayName,
  getArabicMonthName,
  toIstanbulTime
} from '@/lib/timezone'
import { CalendarMonth, CalendarDay, CalendarGenerationOptions, WorkingHours } from '../types/calendar.types'

// إعدادات افتراضية للتقويم
const DEFAULT_OPTIONS: CalendarGenerationOptions = {
  monthsCount: 3,
  startFromToday: true,
  includeBlockedDays: true,
  workingHours: {
    start: '11:30',
    end: '18:30',
    slotDuration: 30
  },
  timezone: 'Europe/Istanbul'
}

/**
 * إنشاء أشهر التقويم المحسن للجوال
 */
export function generateCalendarMonths(
  blockedDays: string[] = [],
  options: Partial<CalendarGenerationOptions> = {}
): CalendarMonth[] {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const months: CalendarMonth[] = []
  const today = createIstanbulDate()
  
  for (let monthOffset = 0; monthOffset < config.monthsCount; monthOffset++) {
    const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
    const monthData = generateMonthData(currentMonth, blockedDays, config)
    months.push(monthData)
  }
  
  return months
}

/**
 * إنشاء بيانات شهر واحد
 */
function generateMonthData(
  date: Date, 
  blockedDays: string[], 
  config: CalendarGenerationOptions
): CalendarMonth {
  const year = date.getFullYear()
  const month = date.getMonth()
  const monthName = `${getArabicMonthName(date)} ${year}`
  const monthNameShort = getArabicMonthName(date)
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const today = createIstanbulDate()
  
  const days: (CalendarDay | null)[] = []
  let availableDaysCount = 0
  
  // أيام فارغة في بداية الشهر
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  
  // أيام الشهر الفعلية
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDay = new Date(year, month, day)
    const dayData = generateDayData(currentDay, blockedDays, today)
    days.push(dayData)
    
    if (!dayData.isPast && !dayData.isBlocked) {
      availableDaysCount++
    }
  }
  
  return {
    year,
    month,
    monthName,
    monthNameShort,
    days,
    totalDays: daysInMonth,
    availableDaysCount
  }
}

/**
 * إنشاء بيانات يوم واحد
 */
function generateDayData(
  date: Date, 
  blockedDays: string[], 
  today: Date
): CalendarDay {
  const dateString = formatIstanbulDate(date, 'date')
  const isTodayDate = isToday(date)
  const isPastDate = date < today && !isTodayDate
  const isBlockedDate = blockedDays.includes(dateString)
  
  return {
    day: date.getDate(),
    date: dateString,
    isToday: isTodayDate,
    isPast: isPastDate,
    isBlocked: isBlockedDate,
    isSelected: false,
    dayName: getArabicDayName(date),
    hasAvailableSlots: !isPastDate && !isBlockedDate,
    availableSlotsCount: undefined, // سيتم تحديثه من API
    firstAvailableTime: undefined // سيتم تحديثه من API
  }
}

/**
 * تحديث بيانات الأيام مع معلومات الأوقات المتاحة
 */
export function updateMonthsWithAvailableSlots(
  months: CalendarMonth[],
  availabilityData: Record<string, { count: number; firstTime: string | null }>
): CalendarMonth[] {
  return months.map(month => ({
    ...month,
    days: month.days.map(day => {
      if (!day) return null
      
      const availability = availabilityData[day.date]
      return {
        ...day,
        availableSlotsCount: availability?.count || 0,
        firstAvailableTime: availability?.firstTime || null,
        hasAvailableSlots: (availability?.count || 0) > 0
      }
    })
  }))
}

/**
 * تحديث اليوم المختار في التقويم
 */
export function updateSelectedDate(
  months: CalendarMonth[], 
  selectedDate: string
): CalendarMonth[] {
  return months.map(month => ({
    ...month,
    days: month.days.map(day => {
      if (!day) return null
      return {
        ...day,
        isSelected: day.date === selectedDate
      }
    })
  }))
}

/**
 * البحث عن يوم معين في الأشهر
 */
export function findDayInMonths(
  months: CalendarMonth[], 
  dateString: string
): { monthIndex: number; dayIndex: number; day: CalendarDay } | null {
  for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
    const month = months[monthIndex]
    for (let dayIndex = 0; dayIndex < month.days.length; dayIndex++) {
      const day = month.days[dayIndex]
      if (day && day.date === dateString) {
        return { monthIndex, dayIndex, day }
      }
    }
  }
  return null
}

/**
 * الحصول على الأيام المتاحة في شهر معين
 */
export function getAvailableDaysInMonth(month: CalendarMonth): CalendarDay[] {
  return month.days.filter((day): day is CalendarDay => 
    day !== null && !day.isPast && !day.isBlocked
  )
}

/**
 * الحصول على أول يوم متاح
 */
export function getFirstAvailableDay(months: CalendarMonth[]): CalendarDay | null {
  for (const month of months) {
    const availableDays = getAvailableDaysInMonth(month)
    if (availableDays.length > 0) {
      return availableDays[0]
    }
  }
  return null
}

/**
 * الحصول على آخر يوم متاح
 */
export function getLastAvailableDay(months: CalendarMonth[]): CalendarDay | null {
  for (let i = months.length - 1; i >= 0; i--) {
    const availableDays = getAvailableDaysInMonth(months[i])
    if (availableDays.length > 0) {
      return availableDays[availableDays.length - 1]
    }
  }
  return null
}

/**
 * التحقق من إمكانية الانتقال للشهر التالي/السابق
 */
export function canNavigateMonth(
  currentIndex: number, 
  totalMonths: number, 
  direction: 'next' | 'prev'
): boolean {
  if (direction === 'next') {
    return currentIndex < totalMonths - 1
  } else {
    return currentIndex > 0
  }
}

/**
 * الحصول على إحصائيات الشهر
 */
export function getMonthStats(month: CalendarMonth) {
  const validDays = month.days.filter((day): day is CalendarDay => day !== null)
  const availableDays = validDays.filter(day => !day.isPast && !day.isBlocked)
  const blockedDays = validDays.filter(day => day.isBlocked)
  const pastDays = validDays.filter(day => day.isPast)
  
  return {
    totalDays: validDays.length,
    availableDays: availableDays.length,
    blockedDays: blockedDays.length,
    pastDays: pastDays.length,
    availabilityPercentage: Math.round((availableDays.length / validDays.length) * 100)
  }
}

/**
 * تحويل رقم الشهر لاسم عربي
 */
export function getMonthDisplayName(month: number, year: number): string {
  const date = new Date(year, month, 1)
  return `${getArabicMonthName(date)} ${year}`
}

/**
 * الحصول على أسماء أيام الأسبوع بالعربية
 */
export function getWeekDayNames(short: boolean = false): string[] {
  if (short) {
    return ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
  } else {
    return ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  }
}

/**
 * تحديد ما إذا كان اليوم قابل للاختيار
 */
export function isDaySelectable(day: CalendarDay | null): boolean {
  return day !== null && !day.isPast && !day.isBlocked
}

/**
 * تطبيق فلاتر على الأشهر
 */
export function applyCalendarFilters(
  months: CalendarMonth[],
  filters: {
    showOnlyAvailable?: boolean
    hideBlockedDays?: boolean
    hidePastDays?: boolean
  }
): CalendarMonth[] {
  return months.map(month => ({
    ...month,
    days: month.days.map(day => {
      if (!day) return null
      
      // تطبيق الفلاتر
      if (filters.showOnlyAvailable && (!day.hasAvailableSlots || day.isPast || day.isBlocked)) {
        return { ...day, isBlocked: true } // إخفاء بجعله محظور
      }
      
      if (filters.hideBlockedDays && day.isBlocked) {
        return null // إخفاء كامل
      }
      
      if (filters.hidePastDays && day.isPast) {
        return null // إخفاء كامل
      }
      
      return day
    })
  }))
}