// src/hooks/useColorTheme.ts
// Hook مساعد لاستخدام نظام الألوان الموحد

import { useColorTheme as useColorThemeContext } from '@/contexts/ColorThemeContext'
import { BookingColors, WeekSettings } from '@/types/theme.types'

/**
 * Hook رئيسي لاستخدام نظام الألوان
 * يعيد export من Context للتبسيط
 */
export const useColorTheme = useColorThemeContext

/**
 * Hook مبسط للحصول على الألوان فقط
 */
export function useColors(): BookingColors {
  const { colors } = useColorTheme()
  return colors
}

/**
 * Hook مبسط للحصول على إعدادات الأسبوع فقط
 */
export function useWeekSettings(): WeekSettings {
  const { weekSettings } = useColorTheme()
  return weekSettings
}

/**
 * Hook للتحقق من حالة التحميل
 */
export function useThemeLoading(): boolean {
  const { isLoading } = useColorTheme()
  return isLoading
}

/**
 * Hook للحصول على أخطاء النظام
 */
export function useThemeError(): string | null {
  const { error } = useColorTheme()
  return error
}

/**
 * Hook للحصول على دوال التحديث فقط
 */
export function useThemeActions() {
  const { updateColors, updateWeekSettings, resetToDefaults, reloadSettings } = useColorTheme()
  
  return {
    updateColors,
    updateWeekSettings,
    resetToDefaults,
    reloadSettings
  }
}

/**
 * Hook للحصول على لون معين
 */
export function useSpecificColor(colorKey: keyof BookingColors): string {
  const colors = useColors()
  return colors[colorKey]
}

/**
 * Hook للحصول على CSS Variable للون معين
 */
export function useColorVariable(colorKey: keyof BookingColors): string {
  const colors = useColors()
  
  // إرجاع كـ CSS variable أو القيمة المباشرة
  return `var(--booking-color-${colorKey}, ${colors[colorKey]})`
}

/**
 * Hook مساعد لفحص إذا كان النظام جاهز
 */
export function useThemeReady(): boolean {
  const { isLoading, error } = useColorTheme()
  return !isLoading && !error
}

/**
 * Hook لتطبيق الألوان على عنصر معين
 * مفيد للمكونات التي تحتاج تطبيق مباشر
 */
export function useApplyColors() {
  const colors = useColors()
  
  return (element: HTMLElement | null) => {
    if (!element) return
    
    element.style.setProperty('--booking-color-booked', colors.booked)
    element.style.setProperty('--booking-color-blocked', colors.blocked)
    element.style.setProperty('--booking-color-available', colors.available)
    element.style.setProperty('--booking-color-today', colors.today)
  }
}