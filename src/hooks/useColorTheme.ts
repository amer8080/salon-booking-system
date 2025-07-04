// src/hooks/useColorTheme.ts
// Hook محسن للنظام الشامل (Colors + Business)

import { useColorTheme as useColorThemeContext } from '@/contexts/ColorThemeContext';
import { 
  BookingColors, 
  WeekSettings, 
  BusinessSettings,
  LunchBreakSettings,
  EnhancedThemeState 
} from '@/types/theme.types';

/**
 * Hook رئيسي للنظام الشامل المحسن
 */
export const useColorTheme = useColorThemeContext;

/**
 * Hook مبسط للحصول على الألوان فقط
 */
export function useColors(): BookingColors {
  const { colors } = useColorTheme();
  return colors;
}

/**
 * Hook مبسط للحصول على إعدادات الأسبوع فقط
 */
export function useWeekSettings(): WeekSettings {
  const { weekSettings } = useColorTheme();
  return weekSettings;
}

/**
 * Hook مبسط للحصول على إعدادات العمل - جديد
 */
export function useBusinessSettings(): BusinessSettings {
  const { businessSettings } = useColorTheme();
  return businessSettings;
}

/**
 * Hook مبسط للحصول على إعدادات استراحة الغداء - جديد
 */
export function useLunchBreakSettings(): LunchBreakSettings {
  const { lunchBreakSettings } = useColorTheme();
  return lunchBreakSettings;
}

/**
 * Hook للتحقق من حالة التحميل
 */
export function useThemeLoading(): boolean {
  const { isLoading } = useColorTheme();
  return isLoading;
}

/**
 * Hook للحصول على أخطاء النظام
 */
export function useThemeError(): string | null {
  const { error } = useColorTheme();
  return error;
}

/**
 * Hook للحصول على دوال التحديث الأساسية
 */
export function useThemeActions() {
  const { 
    updateColors, 
    updateWeekSettings, 
    updateBusinessSettings,
    updateLunchBreakSettings,
    resetToDefaults, 
    reloadSettings 
  } = useColorTheme();

  return {
    updateColors,
    updateWeekSettings,
    updateBusinessSettings,    // جديد
    updateLunchBreakSettings,  // جديد
    resetToDefaults,
    reloadSettings,
  };
}

/**
 * Hook للحصول على لون معين
 */
export function useSpecificColor(colorKey: keyof BookingColors): string {
  const colors = useColors();
  return colors[colorKey];
}

/**
 * Hook للحصول على CSS Variable للون معين
 */
export function useColorVariable(colorKey: keyof BookingColors): string {
  const colors = useColors();
  return `var(--booking-color-${colorKey}, ${colors[colorKey]})`;
}

/**
 * Hook مساعد لفحص إذا كان النظام جاهز
 */
export function useThemeReady(): boolean {
  const { isLoading, error } = useColorTheme();
  return !isLoading && !error;
}

/**
 * Hook لتطبيق الألوان على عنصر معين
 */
export function useApplyColors() {
  const colors = useColors();

  return (element: HTMLElement | null) => {
    if (!element) return;

    element.style.setProperty('--booking-color-booked', colors.booked);
    element.style.setProperty('--booking-color-blocked', colors.blocked);
    element.style.setProperty('--booking-color-available', colors.available);
    element.style.setProperty('--booking-color-today', colors.today);
  };
}

/**
 * Hook للحصول على معلومات شاملة عن النظام - جديد
 */
export function useSystemInfo() {
  const { businessSettings, lunchBreakSettings } = useColorTheme();
  
  return {
    timezone: businessSettings.timezone,
    workingHours: `${businessSettings.businessHours.start} - ${businessSettings.businessHours.end}`,
    slotDuration: `${businessSettings.slotDuration} دقيقة`,
    workingDaysCount: businessSettings.workingDays.length,
    lunchBreakEnabled: lunchBreakSettings.enabled,
    lunchBreakTime: lunchBreakSettings.enabled 
      ? `${lunchBreakSettings.start} - ${lunchBreakSettings.end}`
      : 'معطل'
  };
}

/**
 * Hook للتوافق مع النظام السابق
 */
export function useEnhancedTheme(): EnhancedThemeState {
  return useColorTheme();
}

// Export default للتوافق
export default useColorTheme;