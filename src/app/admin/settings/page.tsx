'use client'
import { logError } from '@/lib/logger-client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ColorPicker } from 'antd'
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
  Loader2
} from 'lucide-react'

// استخدام Theme System الجديد
import { useColorTheme, useThemeActions } from '@/hooks/useColorTheme'
import { BookingColors, WeekSettings, COLOR_LABELS } from '@/types/theme.types'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // استخدام Theme Context بدلاً من State المحلي
  const { colors, weekSettings, isLoading, error } = useColorTheme()
  const { updateColors, updateWeekSettings, resetToDefaults } = useThemeActions()

  // State مؤقت للتعديلات (قبل الحفظ)
  const [tempColors, setTempColors] = useState<BookingColors>(colors)
  const [tempWeekSettings, setTempWeekSettings] = useState<WeekSettings>(weekSettings)

  // تحديث State المؤقت عند تغيير Context
  useEffect(() => {
    setTempColors(colors)
    setTempWeekSettings(weekSettings)
  }, [colors, weekSettings])

  // التحقق من صحة الدخول
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
  }, [router])

  // فحص إذا كانت هناك تغييرات
  const hasChanges = JSON.stringify(tempColors) !== JSON.stringify(colors) || 
                     JSON.stringify(tempWeekSettings) !== JSON.stringify(weekSettings)

  // دوال المعالجة
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // تطبيق الألوان مؤقتاً (معاينة فورية)
  const handleColorPreview = (colorKey: keyof BookingColors, value: string) => {
    const newTempColors = { ...tempColors, [colorKey]: value }
    setTempColors(newTempColors)
    
    // تطبيق مؤقت للمعاينة
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty(`--booking-color-${colorKey}`, value)
    }
  }

  // حفظ التغييرات
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      
      // حفظ الألوان إذا تغيرت
      if (JSON.stringify(tempColors) !== JSON.stringify(colors)) {
        await updateColors(tempColors)
      }
      
      // حفظ إعدادات الأسبوع إذا تغيرت
      if (JSON.stringify(tempWeekSettings) !== JSON.stringify(weekSettings)) {
        await updateWeekSettings(tempWeekSettings)
      }
      
      showMessage('success', 'تم حفظ جميع التغييرات بنجاح!')
      
    } catch (error) {
      logError('خطأ في الحفظ:', error)
      showMessage('error', 'حدث خطأ أثناء حفظ التغييرات')
    } finally {
      setIsSaving(false)
    }
  }

  // إلغاء التغييرات
  const handleCancelChanges = () => {
    setTempColors(colors)
    setTempWeekSettings(weekSettings)
    
    // إعادة تطبيق الألوان الأصلية
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--booking-color-booked', colors.booked)
      root.style.setProperty('--booking-color-blocked', colors.blocked)
      root.style.setProperty('--booking-color-available', colors.available)
      root.style.setProperty('--booking-color-today', colors.today)
    }
    
    showMessage('success', 'تم إلغاء التغييرات')
  }

  // إعادة تعيين افتراضية
  const handleResetToDefaults = async () => {
    try {
      setIsSaving(true)
      await resetToDefaults()
      showMessage('success', 'تم إعادة تعيين جميع الإعدادات للافتراضية')
    } catch (error) {
      logError('خطأ في الإعادة:', error)
      showMessage('error', 'حدث خطأ أثناء إعادة التعيين')
    } finally {
      setIsSaving(false)
    }
  }

  // معالجة تغيير إعدادات الأسبوع
  const handleWeekSettingChange = (key: keyof WeekSettings, value: any) => {
    setTempWeekSettings({ ...tempWeekSettings, [key]: value })
  }

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600">جاري تحميل إعدادات الألوان...</p>
        </div>
      </div>
    )
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
    )
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
              <h1 className="text-xl font-bold text-gray-800">إعدادات النظام</h1>
              <Palette className="w-6 h-6 text-purple-600" />
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* رسالة النجاح/الخطأ */}
        {message && (
          <div className={`mb-6 rounded-xl p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
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

        {/* صندوق تخصيص الألوان */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center mb-6">
            <Palette className="w-8 h-8 text-purple-600 ml-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">تخصيص ألوان الحجوزات</h2>
              <p className="text-gray-600 mt-1">اختر الألوان المناسبة لحالات الحجوزات المختلفة</p>
            </div>
          </div>

          {/* شبكة منتقيات الألوان */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {(Object.keys(tempColors) as Array<keyof BookingColors>).map((colorKey) => (
              <div key={colorKey} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {COLOR_LABELS[colorKey]}
                </label>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <ColorPicker
                    value={tempColors[colorKey]}
                    onChange={(color) => handleColorPreview(colorKey, color.toHexString())}
                    showText
                    size="large"
                  />
                  <div
                    className="w-16 h-12 rounded-lg border-2 border-gray-200 color-preview"
                    style={{ backgroundColor: tempColors[colorKey] }}
                    title="معاينة اللون"
                  />
                  <span className="text-sm text-gray-600 font-mono">{tempColors[colorKey]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* معاينة الألوان */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">معاينة الألوان</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.keys(tempColors) as Array<keyof BookingColors>).map((colorKey) => (
                <div key={colorKey} className="text-center">
                  <div
                    className="w-full h-20 rounded-lg mb-2 border-2 border-gray-200 flex items-center justify-center text-white font-semibold booking-interactive"
                    style={{ backgroundColor: tempColors[colorKey] }}
                  >
                    {COLOR_LABELS[colorKey].split(' ')[0]}
                  </div>
                  <span className="text-sm text-gray-600">{COLOR_LABELS[colorKey]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* صندوق إعدادات الأسبوع */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Calendar className="w-8 h-8 text-blue-600 ml-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">إعدادات الأسبوع</h2>
              <p className="text-gray-600 mt-1">اختر اليوم الأول في الأسبوع لعرض التقويم</p>
            </div>
          </div>

          {/* اختيار أول يوم في الأسبوع */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-700">
              أول يوم في الأسبوع
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 0, label: 'الأحد', emoji: '🌅', desc: 'النظام الأمريكي/العربي' },
                { value: 1, label: 'الإثنين', emoji: '🌍', desc: 'النظام الأوروبي/الدولي' },
                { value: 6, label: 'السبت', emoji: '🕌', desc: 'النظام الإسلامي التقليدي' }
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleWeekSettingChange('firstDayOfWeek', option.value)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 booking-interactive ${
                    tempWeekSettings.firstDayOfWeek === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{option.emoji}</div>
                    <h3 className="font-semibold text-gray-800">{option.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
            <div className="flex gap-3">
              <button
                onClick={handleSaveChanges}
                disabled={isSaving || !hasChanges}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
              </button>

              <button
                onClick={handleCancelChanges}
                disabled={!hasChanges}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                <X className="w-5 h-5" />
                <span>إلغاء</span>
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
                  يوجد تغييرات غير محفوظة. اضغط "حفظ التغييرات" لتطبيقها على النظام.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* روابط سريعة */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">روابط سريعة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/bookings"
              className="flex items-center space-x-2 rtl:space-x-reverse text-purple-600 hover:text-purple-800 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span>إدارة الحجوزات</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}