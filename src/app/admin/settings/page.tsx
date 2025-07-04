'use client';
import { logError } from '@/lib/logger-client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Palette,
  RotateCcw,
  Save,
  LogOut,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Clock,
  Settings,
} from 'lucide-react';

// استخدام Enhanced Theme System
import { useColorTheme } from '@/hooks/useColorTheme';
import { 
  BookingColors, 
  WeekSettings, 
  BusinessSettings,
  LunchBreakSettings,
} from '@/types/theme.types';

// Import Components
import ColorsTab from './components/ColorsTab';
import BusinessTab from './components/BusinessTab';
import AdvancedTab from './components/AdvancedTab';
import WeekTab from './components/WeekTab';

export default function EnhancedAdminSettingsPage() {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');

  // استخدام Enhanced Theme Context
  const { 
    colors, 
    weekSettings, 
    businessSettings, 
    lunchBreakSettings,
    isLoading, 
    error,
    updateColors,
    updateWeekSettings,
    updateBusinessSettings,
    updateLunchBreakSettings,
    resetToDefaults 
  } = useColorTheme();

  // State مؤقت للتعديلات
  const [tempColors, setTempColors] = useState<BookingColors>(colors);
  const [tempWeekSettings, setTempWeekSettings] = useState<WeekSettings>(weekSettings);
  const [tempBusinessSettings, setTempBusinessSettings] = useState<BusinessSettings>(businessSettings);
  const [tempLunchBreakSettings, setTempLunchBreakSettings] = useState<LunchBreakSettings>(lunchBreakSettings);

  // تحديث State المؤقت عند تغيير Context
  useEffect(() => {
    setTempColors(colors);
    setTempWeekSettings(weekSettings);
    setTempBusinessSettings(businessSettings);
    setTempLunchBreakSettings(lunchBreakSettings);
  }, [colors, weekSettings, businessSettings, lunchBreakSettings]);

  // التحقق من صحة الدخول
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  // فحص التغييرات
  const hasChanges = 
    JSON.stringify(tempColors) !== JSON.stringify(colors) ||
    JSON.stringify(tempWeekSettings) !== JSON.stringify(weekSettings) ||
    JSON.stringify(tempBusinessSettings) !== JSON.stringify(businessSettings) ||
    JSON.stringify(tempLunchBreakSettings) !== JSON.stringify(lunchBreakSettings);

  // دوال المعالجة
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // حفظ التغييرات
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      if (JSON.stringify(tempColors) !== JSON.stringify(colors)) {
        await updateColors(tempColors);
      }

      if (JSON.stringify(tempWeekSettings) !== JSON.stringify(weekSettings)) {
        await updateWeekSettings(tempWeekSettings);
      }

      if (JSON.stringify(tempBusinessSettings) !== JSON.stringify(businessSettings)) {
        await updateBusinessSettings(tempBusinessSettings);
      }

      if (JSON.stringify(tempLunchBreakSettings) !== JSON.stringify(lunchBreakSettings)) {
        await updateLunchBreakSettings(tempLunchBreakSettings);
      }

      showMessage('success', 'تم حفظ جميع التغييرات بنجاح!');
    } catch (error) {
      logError('خطأ في الحفظ:', error);
      showMessage('error', 'حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  // إلغاء التغييرات
  const handleCancelChanges = () => {
    setTempColors(colors);
    setTempWeekSettings(weekSettings);
    setTempBusinessSettings(businessSettings);
    setTempLunchBreakSettings(lunchBreakSettings);
    showMessage('success', 'تم إلغاء التغييرات');
  };

  // إعادة تعيين افتراضية
  const handleResetToDefaults = async () => {
    try {
      setIsSaving(true);
      await resetToDefaults();
      showMessage('success', 'تم إعادة تعيين جميع الإعدادات للافتراضية');
    } catch (error) {
      logError('خطأ في الإعادة:', error);
      showMessage('error', 'حدث خطأ أثناء إعادة التعيين');
    } finally {
      setIsSaving(false);
    }
  };

  // التبويبات
  const tabs = [
    { id: 'colors', label: 'الألوان', icon: Palette, description: 'تخصيص ألوان الحجوزات' },
    { id: 'business', label: 'إعدادات العمل', icon: Clock, description: 'ساعات العمل والمواعيد' },
    { id: 'advanced', label: 'الإعدادات المتقدمة', icon: Settings, description: 'استراحة الغداء والإعدادات الأخرى' },
    { id: 'week', label: 'إعدادات الأسبوع', icon: Calendar, description: 'تخصيص عرض الأسبوع' }
  ];

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600">جاري تحميل إعدادات النظام...</p>
        </div>
      </div>
    );
  }

  // شاشة الخطأ
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center text-purple-600 hover:text-purple-800">
              <ArrowLeft className="w-5 h-5 ml-2" />
              العودة للوحة التحكم
            </Link>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <h1 className="text-xl font-bold text-gray-800">إعدادات النظام الشاملة</h1>
              <Settings className="w-6 h-6 text-purple-600" />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 hover:text-red-800 transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* رسالة النجاح/الخطأ */}
        {message && (
          <div
            className={`mb-6 rounded-xl p-4 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
              )}
              <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* التبويبات */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 rtl:space-x-reverse px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 rtl:space-x-reverse ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* محتوى التبويبات */}
          <div className="p-8">
            {activeTab === 'colors' && (
              <ColorsTab 
                tempColors={tempColors}
                setTempColors={setTempColors}
              />
            )}

            {activeTab === 'business' && (
              <BusinessTab 
                tempBusinessSettings={tempBusinessSettings}
                setTempBusinessSettings={setTempBusinessSettings}
              />
            )}

            {activeTab === 'advanced' && (
              <AdvancedTab 
                tempLunchBreakSettings={tempLunchBreakSettings}
                setTempLunchBreakSettings={setTempLunchBreakSettings}
              />
            )}

            {activeTab === 'week' && (
              <WeekTab 
                tempWeekSettings={tempWeekSettings}
                setTempWeekSettings={setTempWeekSettings}
              />
            )}
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-3">
              <button
                onClick={handleSaveChanges}
                disabled={isSaving || !hasChanges}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}</span>
              </button>

              <button
                onClick={handleCancelChanges}
                disabled={!hasChanges}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                <X className="w-5 h-5" />
                <span>إلغاء التغييرات</span>
              </button>
            </div>

            <button
              onClick={handleResetToDefaults}
              disabled={isSaving}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors duration-300"
            >
              <RotateCcw className="w-5 h-5" />
              <span>إعادة تعيين افتراضية</span>
            </button>
          </div>

          {hasChanges && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-500 ml-2" />
                <p className="text-yellow-700 text-sm">
                  يوجد تغييرات غير محفوظة. اضغط "حفظ جميع التغييرات" لتطبيقها على النظام.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* معلومات النظام */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات النظام</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">المنطقة الزمنية الحالية:</span>
              <p className="text-gray-800">{businessSettings.timezone}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">ساعات العمل:</span>
              <p className="text-gray-800">
                {businessSettings.businessHours.start} - {businessSettings.businessHours.end}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">مدة الموعد:</span>
              <p className="text-gray-800">{businessSettings.slotDuration} دقيقة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}