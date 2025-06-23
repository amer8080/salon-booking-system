'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, CalendarDays, Clock, ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { DatePicker, ConfigProvider } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ar'
import arEG from 'antd/locale/ar_EG'

type ViewMode = 'month' | 'week' | 'day'

interface Stats {
  booked: number
  available: number
  blocked: number
}

interface CombinedHeaderProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  currentMonth: Date
  onNavigateMonth: (direction: 'prev' | 'next') => void
  onChangeMonth: (monthIndex: number) => void
  onChangeYear: (year: number) => void
  onGoToToday: () => void
  
  // الجديد - الإحصائيات والتنقل السريع
  stats?: Stats
  onNavigateView?: (direction: 'prev' | 'next') => void
  selectedDate?: string
  currentWeekRange?: string
  
  className?: string
}

export default function CombinedHeader({
  currentView,
  onViewChange,
  currentMonth,
  onNavigateMonth,
  onChangeMonth,
  onChangeYear,
  onGoToToday,
  stats,
  onNavigateView,
  selectedDate,
  currentWeekRange,
  className = ""
}: CombinedHeaderProps) {

  const [showMonthPicker, setShowMonthPicker] = useState(false)

  // إصلاح تمييز الشهر الحالي
  useEffect(() => {
    if (showMonthPicker) {
      const timer = setTimeout(() => {
        const currentRealMonth = new Date().getMonth()
        const cells = document.querySelectorAll('.ant-picker-cell')

        cells.forEach((cell, index) => {
          if (index === currentRealMonth) {
            cell.classList.add('force-current-month')
          } else {
            cell.classList.remove('force-current-month')
          }
        })
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [showMonthPicker])

  const views = [
    { key: 'month' as ViewMode, label: 'شهري', icon: Calendar },
    { key: 'week' as ViewMode, label: 'أسبوعي', icon: CalendarDays },
    { key: 'day' as ViewMode, label: 'يومي', icon: Clock }
  ]

  // تنسيق التاريخ حسب العرض
  const getDisplayDate = () => {
    if (currentView === 'day' && selectedDate) {
      const date = new Date(selectedDate)
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    } else if (currentView === 'week' && currentWeekRange) {
      return currentWeekRange
    } else {
      return dayjs(currentMonth).locale('ar').format('MMMM YYYY')
    }
  }

  // اختصار التاريخ للجوال
  const getMobileDisplayDate = () => {
    if (currentView === 'day' && selectedDate) {
      const date = new Date(selectedDate)
      const days = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
      return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`
    } else if (currentView === 'week' && currentWeekRange) {
      // اختصار نطاق الأسبوع
      const parts = currentWeekRange.split(' - ')
      if (parts.length === 2) {
        const start = parts[0].split(' ')[0] // أول رقم
        const end = parts[1].split(' ')[0] // آخر رقم
        return `${start}-${end}`
      }
      return currentWeekRange
    } else {
      return dayjs(currentMonth).locale('ar').format('MMM YYYY')
    }
  }

  const today = new Date()
  const isCurrentPeriod = () => {
    if (currentView === 'day' && selectedDate) {
      return selectedDate === today.toISOString().split('T')[0]
    } else if (currentView === 'month') {
      return today.getFullYear() === currentMonth.getFullYear() && today.getMonth() === currentMonth.getMonth()
    }
    return false
  }

  const handleMonthChange = (date: any) => {
    if (date) {
      onChangeYear(date.year())
      onChangeMonth(date.month())
    }
    setShowMonthPicker(false)
  }

  // دالة التنقل الموحدة
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (currentView === 'month') {
      onNavigateMonth(direction)
    } else if (onNavigateView) {
      onNavigateView(direction)
    }
  }

  return (
    <div className={`bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg border border-purple-200 p-4 mb-6 ${className}`}>
      
      {/* تخطيط متجاوب - صف واحد للديسكتوب، صفين للجوال */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">

        {/* الصف الأول: أزرار التبديل + التنقل + التاريخ */}
        <div className="flex items-center justify-between">
          
          {/* أزرار التبديل */}
          <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-1">
            {views.map((view) => {
              const Icon = view.icon
              const isActive = currentView === view.key

              return (
                <button
                  key={view.key}
                  onClick={() => onViewChange(view.key)}
                  className={`flex items-center space-x-1 rtl:space-x-reverse px-2 lg:px-3 py-2 rounded-lg font-medium text-xs lg:text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-white active:bg-white active:bg-opacity-30'
                  }`}
                >
                  <Icon className={`w-3 h-3 lg:w-4 lg:h-4 ${isActive ? 'text-purple-600' : 'text-white'}`} />
                  <span className="hidden sm:block lg:block">{view.label}</span>
                </button>
              )
            })}
          </div>

          {/* التنقل والتاريخ - مجمعين للجوال */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            
            {/* أزرار التنقل */}
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <button
                onClick={() => handleNavigate('prev')}
                className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white bg-opacity-20 active:bg-opacity-40 text-white transition-colors duration-200"
              >
                <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>

              <button
                onClick={() => handleNavigate('next')}
                className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white bg-opacity-20 active:bg-opacity-40 text-white transition-colors duration-200"
              >
                <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            </div>

            {/* عرض التاريخ */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse relative">
              <button
                onClick={() => currentView === 'month' && setShowMonthPicker(true)}
                className={`flex items-center space-x-1 rtl:space-x-reverse px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg font-bold text-white transition-colors duration-200 ${
                  currentView === 'month' ? 'active:bg-white active:bg-opacity-30' : 'cursor-default'
                }`}
              >
                <Calendar className="w-3 h-3 lg:w-5 lg:h-5 text-white" />
                {/* عرض مختصر للجوال، كامل للديسكتوب */}
                <span className="text-xs lg:text-sm block lg:hidden">{getMobileDisplayDate()}</span>
                <span className="text-sm lg:text-lg hidden lg:block">{getDisplayDate()}</span>
              </button>

              {/* DatePicker للعرض الشهري فقط */}
              {currentView === 'month' && (
                <ConfigProvider locale={arEG} direction="rtl">
                  <DatePicker
                    picker="month"
                    value={dayjs(currentMonth)}
                    onChange={handleMonthChange}
                    open={showMonthPicker}
                    onOpenChange={setShowMonthPicker}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    placeholder="اختر الشهر"
                    format="MMMM YYYY"
                    allowClear={false}
                    showToday={false}
                  />
                </ConfigProvider>
              )}

              {/* شارة الفترة الحالية - مخفية في الجوال لتوفير مساحة */}
              {isCurrentPeriod() && (
                <span className="hidden lg:block px-2 py-1 bg-green-100 bg-opacity-90 text-green-700 rounded-full text-xs font-medium">
                  {currentView === 'day' ? 'اليوم' : 'الشهر الحالي'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* الصف الثاني: الإحصائيات + زر اليوم */}
        <div className="flex items-center justify-between lg:justify-end lg:space-x-4 lg:rtl:space-x-reverse">
          
          {/* الإحصائيات */}
          {stats && (
            <div className="flex items-center space-x-3 lg:space-x-4 rtl:space-x-reverse text-white">
              <div className="text-center">
                <div className="text-lg lg:text-xl font-bold">{stats.booked}</div>
                <div className="text-xs text-purple-200">محجوز</div>
              </div>
              <div className="text-center">
                <div className="text-lg lg:text-xl font-bold">{stats.available}</div>
                <div className="text-xs text-purple-200">متاح</div>
              </div>
              <div className="text-center">
                <div className="text-lg lg:text-xl font-bold">{stats.blocked}</div>
                <div className="text-xs text-purple-200">مُقفل</div>
              </div>
            </div>
          )}

          {/* زر اليوم */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* شارة الفترة الحالية - تظهر في الجوال بجانب زر اليوم */}
            {isCurrentPeriod() && (
              <span className="lg:hidden px-2 py-1 bg-green-100 bg-opacity-90 text-green-700 rounded-full text-xs font-medium">
                {currentView === 'day' ? 'اليوم' : 'الحالي'}
              </span>
            )}
            
            {!isCurrentPeriod() && (
              <button
                onClick={onGoToToday}
                className="flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse bg-white bg-opacity-20 active:bg-opacity-40 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg transition-colors text-white"
              >
                <Home className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm">اليوم</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook مساعد للعروض
export function useViewMode(initialView: ViewMode = 'week') {
  const [viewMode, setViewMode] = React.useState<ViewMode>(initialView)

  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView)
  }

  return {
    viewMode,
    setViewMode: handleViewChange
  }
}