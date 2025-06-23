'use client'
import { parseServices, getServiceNames } from '@/lib/services-parser';
import { useErrorHandler } from '@/lib/error-handler';
import { useState, useRef, useMemo, useCallback } from 'react'
import { Booking, Service } from '../../types/booking.types'
import BookingCard from '../Bookings/BookingCard'
import { fromDatabaseTime, formatIstanbulDate } from '@/lib/timezone'
import React from 'react'

interface TimeSlot {
  time: string
  booking?: Booking
  isBlocked: boolean
  isAvailable: boolean
}

interface DayViewProps {
  // البيانات
  selectedDate: string
  bookings: Booking[]
  services: Record<string, Service>
  servicesWithCategories: Record<string, Service & { category: string }>
  adminTimeSlots: string[]
  blockedTimes: any[]

  // دوال الألوان
  getServiceColor: (serviceId: string) => string

  // دوال التفاعل مع الحجوزات
  onCreateNewBooking: (date: string, time: string) => void
  onEditBooking: (booking: Booking) => void
  onDeleteBooking: (booking: Booking) => void
  onShowPhoneMenu?: (phone: string, customerName: string) => void

  // دوال إدارة الأوقات المقفلة
  onBlockTime?: (date: string, time: string) => void
  onUnblockTime?: (date: string, time: string) => void

  // التنقل بين الأيام - تم نقله للهيدر الموحد
  onDateChange: (newDate: string) => void
}

// 🚀 تحسين المكون بـ React.memo لمنع إعادة العرض غير الضرورية
function DayView({
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
  onDateChange
}: DayViewProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null)
  const [dragOverTime, setDragOverTime] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 🔧 معالج الأخطاء المحسن - بدون logError
  const { autoFixBooking } = useErrorHandler();

  // 🚀 دالة معالجة البيانات المحسنة مع useCallback
  const processBookingData = useCallback((booking: any) => {
    // إصلاح البيانات تلقائياً
    const fixedBooking = autoFixBooking(booking);

    // معالجة الخدمات بأمان
    const serviceIds = parseServices(fixedBooking.services);
    const serviceNames = getServiceNames(serviceIds, servicesWithCategories);

    return {
      ...fixedBooking,
      serviceIds,
      serviceNames
    };
  }, [autoFixBooking, servicesWithCategories]);

  // 🚀 دالة استخراج أول كلمة من الاسم مع useCallback
  const getFirstName = useCallback((fullName: string): string => {
    return fullName ? fullName.split(' ')[0] : 'عميل'
  }, []);

  // 🚀 دالة تنسيق قائمة الخدمات المحسنة مع useCallback
  const formatServicesText = useCallback((serviceIds: string[]): string => {
    if (!serviceIds || serviceIds.length === 0) return 'لا توجد خدمات'

    const serviceNames = serviceIds
      .map(id => servicesWithCategories[id]?.name)
      .filter(Boolean)
      .slice(0, 3) // أول 3 خدمات فقط

    let result = serviceNames.join('، ')

    if (serviceIds.length > 3) {
      result += ` +${serviceIds.length - 3}`
    }

    return result || 'خدمات غير محددة'
  }, [servicesWithCategories]);

  // 🚀 بناء قائمة الأوقات مع useMemo - بدون try/catch (fail-fast)
  const timeSlots: TimeSlot[] = useMemo(() => {
    return adminTimeSlots.map(time => {
      // البحث عن حجز في هذا الوقت - بدون try/catch
      const booking = bookings.find(b => {
        const bookingTime = formatIstanbulDate(fromDatabaseTime(b.startTime), 'time')
        return bookingTime === time
      })

      // 🚀 معالجة الحجز إذا وُجد
      let processedBooking = null;
      if (booking) {
        processedBooking = processBookingData(booking);
      }

      // التحقق من الإقفال
      const isBlocked = blockedTimes.some(blocked =>
        blocked.date === selectedDate &&
        blocked.startTime === time
      )

      return {
        time,
        booking: processedBooking,
        isBlocked,
        isAvailable: !processedBooking && !isBlocked
      }
    })
  }, [adminTimeSlots, bookings, selectedDate, blockedTimes, processBookingData]);

  // 🚀 إحصائيات محسنة مع useMemo
  const dayStats = useMemo(() => {
    const bookedCount = timeSlots.filter(s => s.booking).length;
    const blockedCount = timeSlots.filter(s => s.isBlocked).length;
    const availableCount = timeSlots.filter(s => s.isAvailable).length;

    return { bookedCount, blockedCount, availableCount, total: timeSlots.length };
  }, [timeSlots]);

  // دوال السحب والإفلات مع useCallback
  const handleDragStart = useCallback((booking: Booking) => {
    setDraggedBooking(booking)
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, time: string) => {
    e.preventDefault()
    setDragOverTime(time)
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverTime(null)
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetTime: string) => {
    e.preventDefault()
    setDragOverTime(null)

    if (!draggedBooking) return

    // التحقق من إمكانية النقل
    const targetSlot = timeSlots.find(slot => slot.time === targetTime)
    if (!targetSlot?.isAvailable) {
      alert('لا يمكن نقل الحجز إلى هذا الوقت!')
      return
    }

    // تنفيذ النقل (سيتم تطبيقه لاحقاً)
    setDraggedBooking(null)
  }, [draggedBooking, timeSlots]);

  // دالة النقر على الوقت مع useCallback
  const handleTimeSlotClick = useCallback((slot: TimeSlot) => {
    setSelectedTimeSlot(slot)
  }, []);

  // دالة إغلاق الكرت مع useCallback
  const closeBookingCard = useCallback(() => {
    setSelectedTimeSlot(null)
  }, []);

  // دوال معالجة الكرت مع useCallback
  const handleCardCreateNew = useCallback((date: string, time: string) => {
    onCreateNewBooking(date, time)
    closeBookingCard()
  }, [onCreateNewBooking, closeBookingCard]);

  const handleCardEdit = useCallback((booking: Booking) => {
    onEditBooking(booking)
    closeBookingCard()
  }, [onEditBooking, closeBookingCard]);

  const handleCardDelete = useCallback((booking: Booking) => {
    onDeleteBooking(booking)
    closeBookingCard()
  }, [onDeleteBooking, closeBookingCard]);

  const handleCardBlockTime = useCallback((date: string, time: string) => {
    if (onBlockTime) {
      onBlockTime(date, time)
      closeBookingCard()
    }
  }, [onBlockTime, closeBookingCard]);

  const handleCardUnblockTime = useCallback((date: string, time: string) => {
    if (onUnblockTime) {
      onUnblockTime(date, time)
      closeBookingCard()
    }
  }, [onUnblockTime, closeBookingCard]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden" dir="rtl">
      {/* 📊 إحصائيات محسنة للتطوير فقط */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 bg-blue-50 border-b border-blue-200">
          <div className="text-blue-800 text-sm">
            📊 إحصائيات اليوم: {dayStats.bookedCount} حجز، {dayStats.blockedCount} مقفل، {dayStats.availableCount} متاح من أصل {dayStats.total} فترة
          </div>
        </div>
      )}

      {/* الجدول الزمني المضغوط - بدون هيدر فرعي مع RTL */}
      <div className="p-3">
        <div
          ref={containerRef}
          className="space-y-0.5 max-h-[600px] overflow-y-auto"
        >
          {timeSlots.map((slot, index) => {
            const isEven = index % 2 === 0
            const isDragOver = dragOverTime === slot.time

            return (
              <div
                key={slot.time}
                className={`group relative border rounded transition-all duration-200 cursor-pointer smooth-transition ${
                  isEven ? 'bg-gray-50' : 'bg-white'
                } ${
                  isDragOver ? 'booking-color-today booking-border-today' : 'border-gray-200'
                } booking-active-available`}
                onClick={() => handleTimeSlotClick(slot)}
                onDragOver={(e) => handleDragOver(e, slot.time)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.time)}
              >
                <div className="flex items-center py-1 px-2">
                  {/* عمود الوقت - الآن في اليمين بسبب RTL */}
                  <div className="w-12 flex-shrink-0">
                    <span className="font-mono text-xs font-medium text-gray-600">
                      {slot.time}
                    </span>
                  </div>

                  {/* الخط الفاصل */}
                  <div className="w-px h-4 bg-gray-200 mx-2"></div>

                  {/* محتوى الوقت - سطر واحد مضغوط باستخدام الألوان المخصصة مع RTL */}
                  <div className="flex-1 min-w-0 flex items-center">
                    {slot.booking ? (
                      /* الحجز الموجود - دائرة مخصصة + نص مع RTL */
                      <div
                        draggable
                        onDragStart={() => handleDragStart(slot.booking!)}
                        className="flex items-center space-x-2 rtl:space-x-reverse min-w-0 cursor-move w-full"
                      >
                        <div className="w-3 h-3 booking-color-booked rounded-full flex-shrink-0"></div>
                        <span className="font-semibold text-gray-800 text-sm truncate">
                          {getFirstName(slot.booking.customerName || 'عميل')}
                        </span>
                        <span className="text-gray-400 text-sm">-</span>
                        <span className="text-xs text-gray-600 truncate">
                          {/* 🚀 استخدام البيانات المعالجة المحسنة */}
                          {formatServicesText(slot.booking.serviceIds || [])}
                        </span>
                      </div>
                    ) : slot.isBlocked ? (
                      /* الوقت المقفل - دائرة مخصصة مع RTL */
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-3 h-3 booking-color-blocked rounded-full"></div>
                        <span className="font-medium text-red-700 text-sm">مُقفل</span>
                      </div>
                    ) : (
                      /* الوقت المتاح - دائرة مخصصة منقطة مع RTL */
                      <div className="flex items-center">
                        <div className="w-3 h-3 booking-border-available border border-dashed rounded-full" style={{borderWidth: '1px'}}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* كرت الحجز المنبثق */}
      {selectedTimeSlot && (
        <BookingCard
          booking={selectedTimeSlot.booking}
          date={selectedDate}
          time={selectedTimeSlot.time}
          services={services}
          servicesWithCategories={servicesWithCategories}
          getServiceColor={getServiceColor}
          onEdit={handleCardEdit}
          onDelete={handleCardDelete}
          onCreateNew={handleCardCreateNew}
          onShowPhoneMenu={onShowPhoneMenu}
          isTimeBlocked={selectedTimeSlot.isBlocked}
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

// 🚀 تصدير المكون مع React.memo لتحسين الأداء
export default React.memo(DayView);