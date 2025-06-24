'use client'
import { useState, useMemo, useCallback } from 'react'
import { Booking, Service } from '../../types/booking.types'
import BookingCard from '../Bookings/BookingCard'
import { fromDatabaseTime, formatIstanbulDate } from '@/lib/timezone'
// ✅ إضافة imports الجديدة
import { parseServices, getServiceNames } from '@/lib/services-parser'
import { useErrorHandler } from '@/lib/error-handler'
import { logWarn } from '@/lib/logger-client'
interface WeekViewProps {
  // البيانات
  selectedDate: string
  bookings: Booking[]
  services: Record<string, Service>
  servicesWithCategories: Record<string, Service & { category: string }>
  adminTimeSlots: string[]
  blockedTimes: any[]

  // دوال الألوان
  getServiceColor: (serviceId: string) => string

  // دوال التفاعل
  onCreateNewBooking: (date: string, time: string) => void
  onEditBooking: (booking: Booking) => void
  onDeleteBooking: (booking: Booking) => void
  onShowPhoneMenu?: (phone: string, customerName: string) => void

  // دوال إدارة الأوقات المقفلة
  onBlockTime?: (date: string, time: string) => void
  onUnblockTime?: (date: string, time: string) => void

  // التنقل والتحول للعرض اليومي - تم نقلهم للهيدر الموحد
  onDateChange: (newDate: string) => void
  onSwitchToDayView: (date: string) => void
}

export default function WeekView({
  selectedDate,
  bookings,
  services,
  servicesWithCategories,
  adminTimeSlots,
  blockedTimes,
  getServiceColor,
  onCreateNewBooking,
  onEditBooking,
  onDeleteBooking,
  onShowPhoneMenu,
  onBlockTime,
  onUnblockTime,
  onDateChange,
  onSwitchToDayView
}: WeekViewProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{date: string, time: string, booking?: Booking} | null>(null)

  // ✅ إضافة معالج الأخطاء
  const { autoFixBooking } = useErrorHandler()

  // ✅ إضافة معالج البيانات (نسخة من DayView)
  const processBookingData = useCallback((booking: any) => {
    const fixedBooking = autoFixBooking(booking)
    const serviceIds = parseServices(fixedBooking.services)
    const serviceNames = getServiceNames(serviceIds, servicesWithCategories)
    
    return {
      ...fixedBooking,
      serviceIds,  // ← هذا المطلوب لإظهار الخدمات!
      serviceNames
    }
  }, [servicesWithCategories])

  // أسماء الأيام المختصرة للموبايل
  const getShortDayName = (date: Date) => {
    const dayNames = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
    return dayNames[date.getDay()]
  }

  // حساب أيام الأسبوع - بدون reverse هنا
  const weekDays = useMemo(() => {
    const startDate = new Date(selectedDate)
    const dayOfWeek = startDate.getDay() // 0 = الأحد
    const weekStart = new Date(startDate)
    weekStart.setDate(startDate.getDate() - dayOfWeek)

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push({
        date: formatIstanbulDate(day, 'date'),
        dayName: getShortDayName(day),
        dayNumber: day.getDate(),
        fullDate: day,
        isToday: formatIstanbulDate(day, 'date') === formatIstanbulDate(new Date(), 'date')
      })
    }
    return days
  }, [selectedDate])

  // تجميع الحجوزات حسب التاريخ والوقت
  const weekBookings = useMemo(() => {
    const bookingsByDateTime: Record<string, Booking> = {}

    bookings.forEach(booking => {
      try {
        const bookingDate = formatIstanbulDate(fromDatabaseTime(booking.date), 'date')
        const bookingTime = formatIstanbulDate(fromDatabaseTime(booking.startTime), 'time')
        const key = `${bookingDate}-${bookingTime}`
        bookingsByDateTime[key] = booking
      } catch (error) {
        logWarn('خطأ في معالجة بيانات الحجز', { error: String(error), metadata: { booking } })
      }
    })

    return bookingsByDateTime
  }, [bookings])

  // التحقق من الأوقات المقفلة
  const isTimeBlocked = (date: string, time: string) => {
    return blockedTimes.some(blocked =>
      blocked.date === date && blocked.startTime === time
    )
  }

  // التعامل مع النقر على الخلايا
  const handleCellClick = (date: string, time: string, booking?: Booking) => {
    setSelectedTimeSlot({ date, time, booking })
  }

  // التعامل مع النقر على رأس اليوم للتحول للعرض اليومي
  const handleDayHeaderClick = (date: string) => {
    onSwitchToDayView(date)
  }

  // إغلاق الكرت المنبثق
  const closeBookingCard = () => {
    setSelectedTimeSlot(null)
  }

  // معالجة أحداث الكرت
  const handleCardCreateNew = (date: string, time: string) => {
    onCreateNewBooking(date, time)
    closeBookingCard()
  }

  const handleCardEdit = (booking: Booking) => {
    onEditBooking(booking)
    closeBookingCard()
  }

  const handleCardDelete = (booking: Booking) => {
    onDeleteBooking(booking)
    closeBookingCard()
  }

  const handleCardBlockTime = (date: string, time: string) => {
    if (onBlockTime) {
      onBlockTime(date, time)
      closeBookingCard()
    }
  }

  const handleCardUnblockTime = (date: string, time: string) => {
    if (onUnblockTime) {
      onUnblockTime(date, time)
      closeBookingCard()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* جدول الأسبوع المحسن للجوال مع RTL - الإصلاح الرئيسي */}
      <div className="overflow-x-auto" dir="rtl">
        <table className="w-full text-xs min-w-full mobile-table-compact lg:text-sm" style={{ tableLayout: 'fixed' }}>
          {/* رأس الجدول - أيام الأسبوع مع RTL محسن */}
          <thead>
            <tr className="bg-gray-50 border-b">
              {/* عمود الوقت - الآن في اليمين بسبب RTL */}
              <th className="w-16 lg:w-20 p-1 text-center text-xs font-medium text-gray-600 border-l bg-gray-100">
                وقت
              </th>
              
              {/* أعمدة الأيام - موزعة بالتساوي مع RTL طبيعي */}
              {weekDays.map((day) => (
                <th
                  key={day.date}
                  className="p-1 text-center border-l cursor-pointer booking-active-today transition-colors"
                  style={{ width: `calc((100% - 80px) / 7)` }}
                  onClick={() => handleDayHeaderClick(day.date)}
                  title={`انقر للتحول للعرض اليومي`}
                >
                  <div className="space-y-0.5">
                    <div className={`text-xs font-bold ${
                      day.isToday ? 'booking-color-today booking-text-today rounded-full px-1 py-0.5' : 'text-gray-700'
                    }`}>
                      {day.dayName}
                    </div>
                    <div className={`text-sm font-bold ${
                      day.isToday
                        ? 'booking-color-today booking-text-today rounded-full w-5 h-5 flex items-center justify-center mx-auto text-xs'
                        : 'text-gray-800'
                    }`}>
                      {day.dayNumber}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* جسم الجدول - الأوقات والحجوزات مع تحسين الارتفاع */}
          <tbody>
            {adminTimeSlots.map((time, timeIndex) => (
              <tr key={time} className={timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                {/* عمود الوقت - الآن في اليمين بسبب RTL */}
                <td className="w-16 lg:w-20 p-1 text-center border-l border-b bg-gray-50">
                  <span className="font-mono text-xs text-gray-600">
                    {time}
                  </span>
                </td>

                {/* خلايا الأيام مع RTL وارتفاع محسن */}
                {weekDays.map((day) => {
                  const booking = weekBookings[`${day.date}-${time}`]
                  const blocked = isTimeBlocked(day.date, time)

                  // تحديد فئات CSS للخلية مع ارتفاع محسن
                  let cellClass = 'p-0.5 border-l border-b cursor-pointer transition-colors smooth-transition'
                  
                  // ارتفاع محسن للجوال والديسكتوب
                  cellClass += ' h-6 lg:h-8'

                  if (booking) {
                    cellClass += ' booking-color-booked booking-active-booked' // محجوز - ألوان مخصصة
                  } else if (blocked) {
                    cellClass += ' booking-color-blocked booking-active-blocked' // مقفل - ألوان مخصصة
                  } else {
                    cellClass += ' booking-color-available booking-active-available' // متاح - ألوان مخصصة
                  }

                  return (
                    <td
                      key={`${day.date}-${time}`}
                      className={cellClass}
                      onClick={() => handleCellClick(day.date, time, booking)}
                      title={booking ? `${booking.customerName} - ${time}` : blocked ? `وقت مقفل - ${time}` : `وقت متاح - ${time}`}
                    >
                      <div className="flex items-center justify-center h-full">
                        {booking && (
                          /* عرض اختصار اسم العميل مضغوط */
                          <span className="booking-text-booked text-xs font-semibold truncate px-0.5 max-w-full">
                            {booking.customerName.split(' ')[0].substring(0, 4)}
                          </span>
                        )}
                        {blocked && !booking && (
                          /* رمز القفل مصغر */
                          <span className="booking-text-blocked text-xs">🔒</span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* تذييل مع الألوان المخصصة - محسن للجوال */}
      <div className="bg-gray-50 px-2 lg:px-4 py-1 lg:py-2 border-t">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-2 lg:space-x-3 rtl:space-x-reverse">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <div className="w-2 h-2 lg:w-3 lg:h-3 booking-color-booked rounded"></div>
              <span>محجوز</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <div className="w-2 h-2 lg:w-3 lg:h-3 booking-color-available booking-border-available border rounded"></div>
              <span>فارغ</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <div className="w-2 h-2 lg:w-3 lg:h-3 booking-color-blocked rounded"></div>
              <span>مُقفل</span>
            </div>
          </div>
          <div className="text-gray-500 hidden lg:block">
            💡 انقر على اسم اليوم للعرض اليومي
          </div>
        </div>
      </div>

      {/* كرت الحجز المنبثق */}
      {selectedTimeSlot && (
        <BookingCard
          booking={selectedTimeSlot.booking ? processBookingData(selectedTimeSlot.booking) : null}
          date={selectedTimeSlot.date}
          time={selectedTimeSlot.time}
          services={services}
          servicesWithCategories={servicesWithCategories}
          getServiceColor={getServiceColor}
          onEdit={handleCardEdit}
          onDelete={handleCardDelete}
          onCreateNew={handleCardCreateNew}
          onShowPhoneMenu={onShowPhoneMenu}
          isTimeBlocked={isTimeBlocked(selectedTimeSlot.date, selectedTimeSlot.time)}
          onBlockTime={handleCardBlockTime}
          onUnblockTime={handleCardUnblockTime}
          isOpen={true}
          onClose={closeBookingCard}
          position="center"
        />
      )}
    </div>
  )
}



