'use client'

import { useCallback } from 'react'
import { Booking, BlockedTime } from '../../types/booking.types'
import { formatIstanbulDate, getDaysInMonth } from '@/lib/timezone'

interface MonthViewProps {
  // بيانات التاريخ
  currentMonth: Date

  // بيانات الحجوزات
  bookings: Booking[]
  blockedTimes: BlockedTime[]

  // التفاعل
  onSwitchToDayView: (date: string) => void

  className?: string
}

export default function MonthView({
  currentMonth,
  bookings,
  blockedTimes,
  onSwitchToDayView,
  className = ""
}: MonthViewProps) {

  // حساب أيام الشهر
  const daysData = getDaysInMonth(currentMonth)

  // أسماء أيام الأسبوع مختصرة مع ترتيب RTL صحيح (من اليمين لليسار)
  // السبت، الجمعة، الخميس، الأربعاء، الثلاثاء، الاثنين، الأحد
  const dayNames = ['س', 'ج', 'خ', 'ر', 'ث', 'ن', 'ح']

  // فحص إذا كان اليوم مقفل
  const isDayBlocked = useCallback((dateString: string) => {
    return blockedTimes.some(blocked =>
      blocked.startTime === null &&
      blocked.endTime === null &&
      blocked.date === dateString
    )
  }, [blockedTimes])

  // الحصول على حجوزات اليوم
  const getBookingsForDate = useCallback((dateString: string) => {
    return bookings.filter(booking => {
      const bookingDate = formatIstanbulDate(new Date(booking.date), 'date')
      return bookingDate === dateString
    })
  }, [bookings])

  // فحص إذا كان اليوم محجوز
  const isDayBooked = useCallback((dateString: string) => {
    const dayBookings = getBookingsForDate(dateString)
    return dayBookings.length > 0
  }, [getBookingsForDate])

  // معالجة النقر على اليوم
  const handleDayClick = useCallback((dayData: {date: string, day: number, isCurrentMonth: boolean}) => {
    if (!dayData.isCurrentMonth) return

    // التحول للعرض اليومي
    onSwitchToDayView(dayData.date)
  }, [onSwitchToDayView])

  return (
    <div className={`bg-white rounded-xl shadow-lg p-3 lg:p-6 ${className}`} dir="rtl">

      {/* أسماء أيام الأسبوع مع RTL */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2 lg:mb-4">
        {dayNames.map((dayName, index) => (
          <div
            key={`${dayName}-${index}`}
            className="h-6 lg:h-8 flex items-center justify-center text-xs lg:text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* شبكة التقويم المضغوطة مع الألوان المخصصة و RTL */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2" dir="rtl">
        {daysData.map((dayData, index) => {
          // التحقق من البيانات
          if (!dayData || !dayData.isCurrentMonth) {
            return (
              <div
                key={`empty-${index}`}
                className="h-10 lg:h-12 flex items-center justify-center"
              >
                {dayData && (
                  <span className="text-xs text-gray-300">{dayData.day}</span>
                )}
              </div>
            )
          }

          const dateString = dayData.date
          const isToday = dayData.isToday
          const isBooked = isDayBooked(dateString)
          const isBlocked = isDayBlocked(dateString)
          const isPast = dayData.isPast

          // تحديد فئات CSS للدائرة باستخدام الألوان المخصصة مع تحسين الجوال
          let circleClasses = 'w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium transition-all duration-200 smooth-transition'
          
          if (isToday) {
            circleClasses += ' booking-color-today booking-text-today' // اليوم الحالي - ألوان مخصصة
          } else if (isBooked) {
            circleClasses += ' booking-color-booked booking-text-booked' // أيام محجوزة - ألوان مخصصة
          } else if (isBlocked) {
            circleClasses += ' booking-color-blocked booking-text-blocked' // أيام مقفلة - ألوان مخصصة
          } else {
            circleClasses += isPast 
              ? ' text-gray-400' 
              : ' text-gray-700 booking-active-available' // أيام عادية مع تفاعل مخصص
          }

          return (
            <button
              key={dateString}
              onClick={() => handleDayClick(dayData)}
              className="h-10 lg:h-12 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 smooth-transition"
              title={`${dayData.day} - ${isToday ? 'اليوم' : isBooked ? 'محجوز' : isBlocked ? 'مقفل' : 'متاح'}`}
            >
              <div className={circleClasses}>
                {dayData.day}
              </div>
            </button>
          )
        })}
      </div>

      {/* ملخص سريع مع الألوان المخصصة - محسن للجوال مع RTL */}
      <div className="mt-3 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-6 text-xs lg:text-sm">

          {/* مؤشر اليوم الحالي */}
          <div className="flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 lg:w-4 lg:h-4 booking-color-today rounded-full"></div>
            <span className="text-gray-600">اليوم الحالي</span>
          </div>

          {/* مؤشر الأيام المحجوزة - ألوان مخصصة */}
          <div className="flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 lg:w-4 lg:h-4 booking-color-booked rounded-full"></div>
            <span className="text-gray-600">محجوزة ({bookings.length})</span>
          </div>

          {/* مؤشر الأيام المقفلة */}
          {blockedTimes.filter(b => b.startTime === null && b.endTime === null).length > 0 && (
            <div className="flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse">
              <div className="w-3 h-3 lg:w-4 lg:h-4 booking-color-blocked rounded-full"></div>
              <span className="text-gray-600">مقفلة ({blockedTimes.filter(b => b.startTime === null && b.endTime === null).length})</span>
            </div>
          )}
        </div>

        {/* نصيحة للمستخدم - مخفية في الجوال لتوفير مساحة مع RTL */}
        <div className="mt-2 lg:mt-3 text-center">
          <p className="text-xs text-gray-500 hidden sm:block">
            💡 انقر على أي يوم للانتقال للعرض اليومي المفصل
          </p>
        </div>
      </div>
    </div>
  )
}