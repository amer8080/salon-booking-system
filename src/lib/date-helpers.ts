// src/lib/date-helpers.ts
// دوال مساعدة لحساب نطاقات التواريخ للأداء المحسن

import { formatIstanbulDate, parseIstanbulDate } from './timezone'

/**
 * حساب بداية ونهاية الأسبوع الحالي
 */
export function getCurrentWeekRange(): { startDate: string, endDate: string } {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay()) // الأحد
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // السبت
  endOfWeek.setHours(23, 59, 59, 999)
  
  return {
    startDate: formatIstanbulDate(startOfWeek, 'date'),
    endDate: formatIstanbulDate(endOfWeek, 'date')
  }
}

/**
 * حساب بداية ونهاية الشهر الحالي
 */
export function getCurrentMonthRange(): { startDate: string, endDate: string } {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return {
    startDate: formatIstanbulDate(startOfMonth, 'date'),
    endDate: formatIstanbulDate(endOfMonth, 'date')
  }
}

/**
 * حساب بداية ونهاية اليوم الحالي
 */
export function getCurrentDayRange(): { startDate: string, endDate: string } {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  
  return {
    startDate: formatIstanbulDate(startOfDay, 'date'),
    endDate: formatIstanbulDate(endOfDay, 'date')
  }
}

/**
 * حساب نطاق الأسبوع لتاريخ محدد
 */
export function getWeekRangeForDate(date: Date): { startDate: string, endDate: string } {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay()) // الأحد
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // السبت
  endOfWeek.setHours(23, 59, 59, 999)
  
  return {
    startDate: formatIstanbulDate(startOfWeek, 'date'),
    endDate: formatIstanbulDate(endOfWeek, 'date')
  }
}

/**
 * حساب نطاق الشهر لتاريخ محدد
 */
export function getMonthRangeForDate(date: Date): { startDate: string, endDate: string } {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  
  return {
    startDate: formatIstanbulDate(startOfMonth, 'date'),
    endDate: formatIstanbulDate(endOfMonth, 'date')
  }
}

/**
 * التنقل للأسبوع السابق
 */
export function getPreviousWeekRange(currentStartDate: string): { startDate: string, endDate: string } {
  const current = parseIstanbulDate(currentStartDate)
  const previousWeek = new Date(current)
  previousWeek.setDate(current.getDate() - 7)
  
  return getWeekRangeForDate(previousWeek)
}

/**
 * التنقل للأسبوع التالي
 */
export function getNextWeekRange(currentStartDate: string): { startDate: string, endDate: string } {
  const current = parseIstanbulDate(currentStartDate)
  const nextWeek = new Date(current)
  nextWeek.setDate(current.getDate() + 7)
  
  return getWeekRangeForDate(nextWeek)
}

/**
 * التنقل للشهر السابق
 */
export function getPreviousMonthRange(currentStartDate: string): { startDate: string, endDate: string } {
  const current = parseIstanbulDate(currentStartDate)
  const previousMonth = new Date(current.getFullYear(), current.getMonth() - 1, 1)
  
  return getMonthRangeForDate(previousMonth)
}

/**
 * التنقل للشهر التالي
 */
export function getNextMonthRange(currentStartDate: string): { startDate: string, endDate: string } {
  const current = parseIstanbulDate(currentStartDate)
  const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  
  return getMonthRangeForDate(nextMonth)
}

/**
 * بناء URL للـ API مع معاملات التاريخ
 */
export function buildBookingsApiUrl(startDate: string, endDate: string, view: 'week' | 'month' | 'day'): string {
  const params = new URLSearchParams({
    startDate,
    endDate,
    view
  })
  
  return `/api/admin/bookings?${params.toString()}`
}