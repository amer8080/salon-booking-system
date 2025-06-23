// src/app/book/components/BookingSelectionStep.tsx
// نسخ المنطق الممتاز من الملف الطويل + إصلاح infinite loop

'use client'
import { logError, logWarn } from '@/lib/logger-client';

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Sparkles, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { BookingSelectionStepProps } from '../types/booking-form.types'
import { formatArabicDate, parseIstanbulDate, createIstanbulDate, formatIstanbulDate, getTodayIstanbul, isToday } from '@/lib/timezone'

interface Service {
  id: string
  name: string
  nameAr: string
  nameEn: string
  nameTr: string
  category: string
  price: number
  duration: number
  description?: string
}

export default function BookingSelectionStep({
  selectionState,
  servicesState,
  onServiceToggle,
  onDateSelect,
  onTimeSelect,
  onBack,
  onNext,
  errors
}: BookingSelectionStepProps) {

  // ✅ إصلاح infinite loop - إزالة activeTab من dependencies
  const [activeTab, setActiveTab] = useState<'services' | 'date' | 'time'>('services')
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set())

  // ✅ منطق التقويم من الملف الطويل
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false)
  const [timeSlotsError, setTimeSlotsError] = useState('')
  const [blockedDays, setBlockedDays] = useState<string[]>([])

  // ✅ تحميل الأيام المقفلة
  useEffect(() => {
    const fetchBlockedDays = async () => {
      try {
        const response = await fetch('/api/admin/blocked-times')
        const data = await response.json()

        if (data.success) {
          const blockedDaysList = data.blockedTimes
            .filter((blocked: any) => blocked.startTime === null && blocked.endTime === null)
            .map((blocked: any) => blocked.date)
          setBlockedDays(blockedDaysList)
        }
      } catch (error) {
        logError('خطأ في تحميل الأيام المقفلة:', error)
      }
    }

    fetchBlockedDays()
  }, [])

  // ✅ جلب الأوقات المتاحة (من الملف الطويل)
  useEffect(() => {
    if (selectionState.selectedDate) {
      fetchAvailableTimeSlots(selectionState.selectedDate)
    }
  }, [selectionState.selectedDate])

  const fetchAvailableTimeSlots = async (date: string) => {
    try {
      setTimeSlotsLoading(true)
      setTimeSlotsError('')

      const response = await fetch(`/api/bookings/available-times?date=${date}&userType=customer`)
      const data = await response.json()


      if (data.success) {
        setAvailableTimeSlots(data.availableSlots)

        if (selectionState.selectedTime && !data.availableSlots.includes(selectionState.selectedTime)) {
          onTimeSelect('')
        }

        if (data.debug) {
        }

      } else {
        logError('فشل في تحميل الأوقات:', data.error)
        setTimeSlotsError(data.error || 'فشل في تحميل الأوقات')
        setAvailableTimeSlots([])
      }
    } catch (error) {
      logError('خطأ في تحميل الأوقات:', error)
      setTimeSlotsError('خطأ في الاتصال بالخادم')
      setAvailableTimeSlots([])
    } finally {
      setTimeSlotsLoading(false)
    }
  }

  // ✅ تحديث completed tabs (بدون infinite loop)
  useEffect(() => {
    const completed = new Set<string>()

    if (selectionState.selectedServices.length > 0) {
      completed.add('services')
    }

    if (selectionState.selectedDate) {
      completed.add('date')
    }

    if (selectionState.selectedTime) {
      completed.add('time')
    }

    setCompletedTabs(completed)
  }, [selectionState.selectedServices.length, selectionState.selectedDate, selectionState.selectedTime])

  // ✅ منطق التقويم من الملف الطويل
  const generateCalendarMonths = () => {
    const months = []
    const today = createIstanbulDate()

    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
      const monthData = {
        year: currentMonth.getFullYear(),
        month: currentMonth.getMonth(),
        monthName: currentMonth.toLocaleDateString('ar', { month: 'long', year: 'numeric' }),
        days: []
      }

      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
      const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

      // أيام فارغة في بداية الشهر
      for (let i = 0; i < firstDayOfWeek; i++) {
        monthData.days.push(null)
      }

      // أيام الشهر
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        const dateString = formatIstanbulDate(date, 'date')
        const isTodayDate = isToday(date)
        const isPast = date < today && !isTodayDate
        const isBlocked = blockedDays.includes(dateString)

        monthData.days.push({
          day,
          date: dateString,
          isToday: isTodayDate,
          isPast,
          isBlocked,
          dayName: date.toLocaleDateString('ar', { weekday: 'short' })
        })
      }

      months.push(monthData)
    }

    return months
  }

  const calendarMonths = generateCalendarMonths()

  // ✅ معالجات الأحداث
  const handleServiceToggle = (serviceId: string) => {
    // ✅ منطق الاختيار المتعدد من الملف الطويل
    const currentServices = selectionState.selectedServices
    if (currentServices.includes(serviceId)) {
      // إزالة الخدمة
      const newServices = currentServices.filter(id => id !== serviceId)
      // نحتاج تمرير array of IDs بدلاً من ID واحد
      newServices.forEach(id => onServiceToggle(id))
      if (newServices.length === 0) {
        onServiceToggle('') // مسح الكل
      }
    } else {
      // إضافة الخدمة
      onServiceToggle(serviceId)
    }
  }

  const handleDateSelect = (date: string) => {
    onDateSelect(date)
    // الانتقال للوقت تلقائياً
    setActiveTab('time')
  }

  const handleTimeSelect = (time: string) => {
    onTimeSelect(time)
  }

  const canProceed = selectionState.selectedServices.length > 0 &&
                    selectionState.selectedDate &&
                    selectionState.selectedTime

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Calendar className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          اختاري موعدك وخدماتك
        </h2>

        <p className="text-gray-600 text-lg">
          حددي الخدمات المطلوبة والوقت المناسب لك
        </p>
      </div>

      {/* Grid Layout مثل الملف الطويل */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ✅ التقويم والأوقات (من الملف الطويل) */}
        <div className="order-2 lg:order-1">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 ml-2 text-purple-600" />
            اختاري التاريخ والوقت
          </h3>

          {/* ✅ التقويم من الملف الطويل */}
          <div className="mb-6">
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))}
                  disabled={currentMonthIndex === 0}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                <h4 className="text-lg font-bold text-gray-800">
                  {calendarMonths[currentMonthIndex]?.monthName}
                </h4>
                <button
                  onClick={() => setCurrentMonthIndex(Math.min(2, currentMonthIndex + 1))}
                  disabled={currentMonthIndex === 2}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarMonths[currentMonthIndex]?.days.map((dayData, index) => (
                  <div key={index} className="aspect-square">
                    {dayData ? (
                      <button
                        onClick={() => !dayData.isPast && !dayData.isBlocked && handleDateSelect(dayData.date)}
                        disabled={dayData.isPast || dayData.isBlocked}
                        className={`
                          w-full h-full rounded-lg text-sm font-medium transition-all duration-200
                          ${dayData.isPast || dayData.isBlocked
                            ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                            : selectionState.selectedDate === dayData.date
                              ? 'bg-purple-500 text-white'
                              : dayData.isToday
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'text-gray-700 hover:bg-purple-100'
                          }
                        `}
                      >
                        {dayData.day}
                        {dayData.isToday && (
                          <div className="text-xs">اليوم</div>
                        )}
                        {dayData.isBlocked && (
                          <div className="text-xs text-red-500">🔒</div>
                        )}
                      </button>
                    ) : (
                      <div></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ الأوقات المتاحة من الملف الطويل */}
          {selectionState.selectedDate && (
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">
                الأوقات المتاحة
                <span className="text-sm text-gray-500 mr-2">
                  ({availableTimeSlots.length} وقت متاح)
                </span>
              </h4>

              {timeSlotsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">جاري تحميل الأوقات المتاحة...</p>
                </div>
              ) : timeSlotsError ? (
                <div className="text-center py-8 bg-red-50 rounded-xl">
                  <p className="text-red-600">{timeSlotsError}</p>
                  <button
                    onClick={() => fetchAvailableTimeSlots(selectionState.selectedDate)}
                    className="mt-2 text-red-700 hover:text-red-900 font-medium"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`
                        p-3 rounded-lg font-medium transition-all duration-300 text-sm
                        ${selectionState.selectedTime === time
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">لا توجد أوقات متاحة لهذا التاريخ</p>
                  <p className="text-sm text-gray-500">جميع المواعيد محجوزة أو مقفلة</p>
                </div>
              )}
            </div>
          )}

          {/* ملخص الموعد */}
          {selectionState.selectedDate && selectionState.selectedTime && (
            <div className="mt-4 bg-purple-50 rounded-xl p-4">
              <p className="text-purple-800 font-medium text-center">
                📅 موعدك: {formatArabicDate(parseIstanbulDate(selectionState.selectedDate))}
              </p>
              <p className="text-purple-700 text-center mt-1">
                🕒 الساعة: {selectionState.selectedTime}
              </p>
            </div>
          )}
        </div>

        {/* ✅ الخدمات (من الملف الطويل) */}
        <div className="order-1 lg:order-2">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 ml-2 text-purple-600" />
            اختاري خدماتك
          </h3>
          <p className="text-gray-600 mb-4 text-sm">يمكنك اختيار خدمة واحدة أو أكثر</p>

          {servicesState.loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">جاري تحميل الخدمات...</p>
            </div>
          ) : servicesState.error ? (
            <div className="text-center py-8 bg-red-50 rounded-xl">
              <p className="text-red-600">{servicesState.error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-red-700 hover:text-red-900 font-medium"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {servicesState.services.map((service: Service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceToggle(service.id)}
                  className={`
                    border-2 rounded-xl p-4 cursor-pointer transition-all duration-300
                    ${selectionState.selectedServices.includes(service.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg">{service.nameAr}</h4>
                      {/* ✅ إزالة الأسعار كما طلبت */}
                    </div>
                    <div className="text-center ml-4">
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${selectionState.selectedServices.includes(service.id)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                        }
                      `}>
                        {selectionState.selectedServices.includes(service.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectionState.selectedServices.length > 0 && !servicesState.loading && (
            <div className="mt-4 bg-green-50 rounded-xl p-4">
              <div className="text-center">
                <p className="text-green-800 font-medium">
                  ✨ اخترت {selectionState.selectedServices.length} خدمة
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-800 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة</span>
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl active:scale-95"
        >
          <span>متابعة للتأكيد</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}