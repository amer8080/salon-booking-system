'use client';
import { logError } from '@/lib/logger-client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  BookingColors,
  WeekSettings,
  BusinessSettings,
  LunchBreakSettings,
  AppSettings,
  EnhancedThemeState,
  DEFAULT_APP_SETTINGS,
  CSS_VARIABLES,
} from '@/types/theme.types';

// إنشاء Enhanced Context
const EnhancedColorThemeContext = createContext<EnhancedThemeState | undefined>(undefined);

// Props للـ Provider
interface EnhancedColorThemeProviderProps {
  children: ReactNode;
}

/**
 * Enhanced Provider للنظام الشامل (Colors + Business)
 */
export function ColorThemeProvider({ children }: EnhancedColorThemeProviderProps) {
  // الحالة الأساسية
  const [colors, setColors] = useState<BookingColors>(DEFAULT_APP_SETTINGS.colors);
  const [weekSettings, setWeekSettings] = useState<WeekSettings>(DEFAULT_APP_SETTINGS.week);
  
  // الحالة الجديدة للإعدادات الشاملة
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(DEFAULT_APP_SETTINGS.business);
  const [lunchBreakSettings, setLunchBreakSettings] = useState<LunchBreakSettings>(DEFAULT_APP_SETTINGS.lunchBreak);
  
  // حالة النظام
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * تطبيق الألوان على CSS Variables
   */
  const applyColorsToDocument = (colorsToApply: BookingColors) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty(CSS_VARIABLES.BOOKED, colorsToApply.booked);
    root.style.setProperty(CSS_VARIABLES.BLOCKED, colorsToApply.blocked);
    root.style.setProperty(CSS_VARIABLES.AVAILABLE, colorsToApply.available);
    root.style.setProperty(CSS_VARIABLES.TODAY, colorsToApply.today);
  };

  /**
   * إبطال cache للـ AppSettings system
   */
  const invalidateAppSettingsCache = () => {
    // إبطال cache النظام القديم للتوافق
    if (typeof window !== 'undefined' && (window as any).clearAppSettingsCache) {
      (window as any).clearAppSettingsCache();
    }
  };

  /**
   * تحميل جميع الإعدادات من API الشامل
   */
  const loadAllSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading comprehensive settings from enhanced API...');

      const response = await fetch('/api/admin/settings/app');
      const data = await response.json();

      if (data.success && data.settings) {
        const settings: AppSettings = data.settings;

        // تحديث جميع الإعدادات
        setColors(settings.colors);
        setWeekSettings(settings.week);
        setBusinessSettings(settings.business);
        setLunchBreakSettings(settings.lunchBreak);

        // تطبيق الألوان فوراً
        applyColorsToDocument(settings.colors);

        // إبطال cache النظام القديم
        invalidateAppSettingsCache();

        console.log('✅ All comprehensive settings loaded successfully:', {
          colors: Object.keys(settings.colors).length,
          business: Object.keys(settings.business).length,
          lunchBreak: Object.keys(settings.lunchBreak).length
        });

      } else {
        console.warn('⚠️ No settings found, using defaults');
        applyColorsToDocument(DEFAULT_APP_SETTINGS.colors);
      }

    } catch (error) {
      await logError('❌ خطأ في تحميل الإعدادات الشاملة:', error);
      setError('فشل في تحميل إعدادات التطبيق');

      // استخدام الافتراضية عند الخطأ
      applyColorsToDocument(DEFAULT_APP_SETTINGS.colors);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * حفظ جميع الإعدادات في API الشامل
   */
  const saveAllSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      console.log('🔄 Saving comprehensive settings:', newSettings);

      const response = await fetch('/api/admin/settings/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'فشل في حفظ الإعدادات');
      }

      // إبطال cache النظام القديم بعد الحفظ
      invalidateAppSettingsCache();

      console.log('✅ Comprehensive settings saved successfully');

    } catch (error) {
      await logError('❌ خطأ في حفظ الإعدادات الشاملة:', error);
      throw error;
    }
  };

  /**
   * تحديث الألوان
   */
  const updateColors = async (newColors: Partial<BookingColors>) => {
    try {
      const updatedColors = { ...colors, ...newColors };
      
      // تطبيق فوري
      setColors(updatedColors);
      applyColorsToDocument(updatedColors);

      // حفظ في الخلفية
      await saveAllSettings({ colors: updatedColors });

    } catch (error) {
      await logError('❌ خطأ في تحديث الألوان:', error);
      setError('فشل في حفظ الألوان الجديدة');
      throw error;
    }
  };

  /**
   * تحديث إعدادات الأسبوع
   */
  const updateWeekSettings = async (newWeekSettings: Partial<WeekSettings>) => {
    try {
      const updatedWeekSettings = { ...weekSettings, ...newWeekSettings };
      
      // تحديث فوري
      setWeekSettings(updatedWeekSettings);

      // حفظ في الخلفية
      await saveAllSettings({ week: updatedWeekSettings });

    } catch (error) {
      await logError('❌ خطأ في تحديث إعدادات الأسبوع:', error);
      setError('فشل في حفظ إعدادات الأسبوع');
      throw error;
    }
  };

  /**
   * تحديث إعدادات العمل - جديد
   */
  const updateBusinessSettings = async (newBusinessSettings: Partial<BusinessSettings>) => {
    try {
      const updatedBusinessSettings = { ...businessSettings, ...newBusinessSettings };
      
      // تحديث فوري
      setBusinessSettings(updatedBusinessSettings);

      // حفظ في الخلفية
      await saveAllSettings({ business: updatedBusinessSettings });

      console.log('✅ Business settings updated:', updatedBusinessSettings);

    } catch (error) {
      await logError('❌ خطأ في تحديث إعدادات العمل:', error);
      setError('فشل في حفظ إعدادات العمل');
      throw error;
    }
  };

  /**
   * تحديث إعدادات استراحة الغداء - جديد
   */
  const updateLunchBreakSettings = async (newLunchBreakSettings: Partial<LunchBreakSettings>) => {
    try {
      const updatedLunchBreakSettings = { ...lunchBreakSettings, ...newLunchBreakSettings };
      
      // تحديث فوري
      setLunchBreakSettings(updatedLunchBreakSettings);

      // حفظ في الخلفية
      await saveAllSettings({ lunchBreak: updatedLunchBreakSettings });

      console.log('✅ Lunch break settings updated:', updatedLunchBreakSettings);

    } catch (error) {
      await logError('❌ خطأ في تحديث إعدادات استراحة الغداء:', error);
      setError('فشل في حفظ إعدادات استراحة الغداء');
      throw error;
    }
  };

  /**
   * إعادة تعيين جميع الإعدادات للافتراضية
   */
  const resetToDefaults = async () => {
    try {
      console.log('🔄 Resetting all settings to defaults...');

      // تطبيق فوري
      setColors(DEFAULT_APP_SETTINGS.colors);
      setWeekSettings(DEFAULT_APP_SETTINGS.week);
      setBusinessSettings(DEFAULT_APP_SETTINGS.business);
      setLunchBreakSettings(DEFAULT_APP_SETTINGS.lunchBreak);
      applyColorsToDocument(DEFAULT_APP_SETTINGS.colors);

      // حذف من الخلفية
      const response = await fetch('/api/admin/settings/app', {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error('فشل في إعادة تعيين الإعدادات');
      }

      // إبطال cache النظام القديم
      invalidateAppSettingsCache();

      console.log('✅ All settings reset to defaults successfully');

    } catch (error) {
      await logError('❌ خطأ في إعادة التعيين:', error);
      setError('فشل في إعادة تعيين الإعدادات');
      throw error;
    }
  };

  /**
   * إعادة تحميل جميع الإعدادات
   */
  const reloadSettings = async () => {
    await loadAllSettings();
  };

  // تحميل الإعدادات عند البدء
  useEffect(() => {
    loadAllSettings();
  }, []);

  // قيمة Context الشاملة
  const contextValue: EnhancedThemeState = {
    // البيانات الأساسية
    colors,
    weekSettings,
    
    // البيانات الجديدة
    businessSettings,
    lunchBreakSettings,
    
    // حالة النظام
    isLoading,
    error,

    // دوال التحديث الأساسية
    updateColors,
    updateWeekSettings,
    
    // دوال التحديث الجديدة
    updateBusinessSettings,
    updateLunchBreakSettings,
    
    // دوال النظام
    resetToDefaults,
    reloadSettings,
  };

  return (
    <EnhancedColorThemeContext.Provider value={contextValue}>
      {children}
    </EnhancedColorThemeContext.Provider>
  );
}

/**
 * Hook لاستخدام Enhanced Context
 */
export function useColorTheme(): EnhancedThemeState {
  const context = useContext(EnhancedColorThemeContext);

  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }

  return context;
}