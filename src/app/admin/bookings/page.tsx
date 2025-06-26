'use client'
import { logError } from '@/lib/logger-client';
import EditBookingModal from './components/Modals/EditBookingModal'
import DeleteBookingModal from './components/Modals/DeleteBookingModal'
import { Booking, EditBookingData } from './types/booking.types'
import { useBookings } from './hooks/useBookings'
import { useDayView } from './hooks/useDayView'
import LoadingSpinner from './components/UI/LoadingSpinner'
import NewBookingModal from './components/Modals/NewBookingModal'
import DayView from './components/Views/DayView'
import WeekView from './components/Views/WeekView'
import MonthView from './components/Views/MonthView'
import CombinedHeader, { useViewMode } from './components/UI/CombinedHeader'
import PhoneMenu from './components/UI/PhoneMenu'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatIstanbulDate, fromDatabaseTime } from '@/lib/timezone'
import {
  Calendar,
  ArrowLeft,
  LogOut,
  X
} from 'lucide-react'

export default function AdminBookingsPage() {
  const {
    bookings,
    services,
    servicesWithCategories,
    allServices,
    blockedTimes,
    loading,
    error,
    fetchBookings,
    fetchBlockedTimes
  } = useBookings()

  const servicesMap = useMemo(() => (
    Object.fromEntries(Object.entries(services).map(([id, service]) => [id, service.name]))
  ), [services])

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // ✅ currentDateRange مبسط - سيتم التحكم به عبر useEffect
  const [currentDateRange, setCurrentDateRange] = useState(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return {
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
      view: 'week'
    }
  })

  const [showPhoneMenu, setShowPhoneMenu] = useState<{phone: string, customerName: string} | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null)
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  const { viewMode, setViewMode } = useViewMode('week')
  const router = useRouter()

  // استخدام Hook العرض اليومي
  const { handleDateChange, blockSingleTime, unblockSingleTime } = useDayView({
    blockedTimes,
    fetchBlockedTimes,
    currentDateRange,
    setCurrentDateRange
  })

  // ✅ دالة حساب النطاق حسب العرض - الحل الجذري
  const calculateDateRangeForView = useCallback((viewMode: string, selectedDate: string) => {
    const date = new Date(selectedDate)

    switch (viewMode) {
      case 'day':
        return {
          startDate: selectedDate,
          endDate: selectedDate,
          view: 'day' as const
        }

      case 'week': {
        // حساب بداية الأسبوع (الأحد)
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        startOfWeek.setHours(0, 0, 0, 0)

        // حساب نهاية الأسبوع (السبت)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)

        return {
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: endOfWeek.toISOString().split('T')[0],
          view: 'week' as const
        }
      }

      case 'month': {
        // حساب بداية الشهر
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)

        // حساب نهاية الشهر
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
          view: 'month' as const
        }
      }

      default:
        // افتراضي: أسبوع
        return calculateDateRangeForView('week', selectedDate)
    }
  }, [])

  // ✅ useEffect للربط التلقائي بين viewMode و currentDateRange - الحل الجذري
  useEffect(() => {
    // حساب النطاق الجديد حسب العرض الحالي
    const newRange = calculateDateRangeForView(viewMode, selectedDate)

    // تحديث فقط إذا كان مختلف
    if (
      newRange.startDate !== currentDateRange.startDate ||
      newRange.endDate !== currentDateRange.endDate ||
      newRange.view !== currentDateRange.view
    ) {
      setCurrentDateRange(newRange)
    }
  }, [viewMode, selectedDate, calculateDateRangeForView, currentDateRange])

  // ✅ useEffect للتحميل عند تغيير currentDateRange
  useEffect(() => {
    if (Object.keys(services).length > 0) {
      const { startDate, endDate, view } = currentDateRange
      fetchBookings(startDate, endDate, view)
    }
  }, [currentDateRange, services, fetchBookings])

  // ✅ دالة التنقل المحسنة
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate)

    switch (viewMode) {
      case 'day':
        currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
    }

    const newDate = currentDate.toISOString().split('T')[0]
    setSelectedDate(newDate)

    // ✅ useEffect سيحدث currentDateRange تلقائياً

  }, [selectedDate, viewMode])

  // تكوين الألوان والأوقات
  const categoryColors = {
    hair: 'bg-green-100 text-green-700',
    makeup: 'bg-purple-100 text-purple-700',
    nails: 'bg-blue-100 text-blue-700',
    skincare: 'bg-yellow-100 text-yellow-700',
    default: 'bg-gray-100 text-gray-700'
  }

  const getServiceColor = (serviceId: string) => {
    const service = servicesWithCategories[serviceId]

    if (!service) return categoryColors.default
    return categoryColors[service.category as keyof typeof categoryColors] || categoryColors.default
  }

  const generateAdminTimeSlots = () => {
    const slots = []
    for (let hour = 11; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 19 && minute > 0) break
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
      }
    }
    return slots
  }

  const adminTimeSlots = generateAdminTimeSlots()

  // حساب الإحصائيات حسب العرض الحالي
  const currentStats = useMemo(() => {
    if (viewMode === 'day' && selectedDate) {
      // إحصائيات اليوم المحدد
      const dayBookings = bookings.filter(booking => {
        try {
          const bookingDate = formatIstanbulDate(fromDatabaseTime(booking.date), 'date')
          return bookingDate === selectedDate
        } catch {
          return false
        }
      })

      const dayBlockedTimes = blockedTimes.filter(blocked => blocked.date === selectedDate)

      return {
        booked: dayBookings.length,
        blocked: dayBlockedTimes.length,
        available: adminTimeSlots.length - dayBookings.length - dayBlockedTimes.length
      }
    } else if (viewMode === 'week' && selectedDate) {
      // إحصائيات الأسبوع الحالي
      const startDate = new Date(selectedDate)
      const dayOfWeek = startDate.getDay()
      const weekStart = new Date(startDate)
      weekStart.setDate(startDate.getDate() - dayOfWeek)

      const weekDates = []
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + i)
        weekDates.push(formatIstanbulDate(day, 'date'))
      }

      const weekBookings = bookings.filter(booking => {
        try {
          const bookingDate = formatIstanbulDate(fromDatabaseTime(booking.date), 'date')
          return weekDates.includes(bookingDate)
        } catch {
          return false
        }
      })

      const weekBlockedTimes = blockedTimes.filter(blocked => weekDates.includes(blocked.date))
      const totalSlots = adminTimeSlots.length * 7

      return {
        booked: weekBookings.length,
        blocked: weekBlockedTimes.length,
        available: totalSlots - weekBookings.length - weekBlockedTimes.length
      }
    } else {
      // إحصائيات الشهر الحالي
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const monthStart = `${year}-${(month + 1).toString().padStart(2, '0')}-01`
      const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const monthBookings = bookings.filter(booking => {
        try {
          const bookingDate = formatIstanbulDate(fromDatabaseTime(booking.date), 'date')
          return bookingDate >= monthStart && bookingDate <= monthEnd
        } catch {
          return false
        }
      })

      const monthBlockedTimes = blockedTimes.filter(blocked =>
        blocked.date >= monthStart && blocked.date <= monthEnd
      )

      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const totalSlots = adminTimeSlots.length * daysInMonth

      return {
        booked: monthBookings.length,
        blocked: monthBlockedTimes.length,
        available: totalSlots - monthBookings.length - monthBlockedTimes.length
      }
    }
  }, [viewMode, selectedDate, currentMonth, bookings, blockedTimes, adminTimeSlots])

  // حساب نطاق الأسبوع للعرض
  const currentWeekRange = useMemo(() => {
    if (viewMode === 'week' && selectedDate) {
      const startDate = new Date(selectedDate)
      const dayOfWeek = startDate.getDay()
      const weekStart = new Date(startDate)
      weekStart.setDate(startDate.getDate() - dayOfWeek)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const formatDate = (date: Date) => {
        const day = date.getDate()
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`
      }

      return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
    }
    return undefined
  }, [viewMode, selectedDate])

  // ✅ دالة التنقل المحسنة (مستبدلة)
  const handleViewNavigation = (direction: 'prev' | 'next') => {
    navigateDate(direction)
  }

  // Hooks للمصادقة والبيانات
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
  }, [router])

  // دوال الحجوزات
  const openNewBooking = () => setIsCreatingBooking(true)
  const openEditBooking = (booking: Booking) => setEditingBooking(booking)
  const openDeleteBooking = (booking: Booking) => setDeletingBooking(booking)
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  // ✅ دالة handleSwitchToDayView محسنة - الحل الجذري
  const handleSwitchToDayView = useCallback((date: string) => {
    // تحديث التاريخ المحدد أولاً
    setSelectedDate(date)

    // تغيير العرض إلى اليومي
    setViewMode('day')

    // ✅ useEffect سيتولى تحديث currentDateRange تلقائياً
    // لا نحتاج handleDateChange هنا لأن useEffect سيقوم بالعمل

  }, [setSelectedDate, setViewMode])

  // دوال API للحجوزات (مبسطة)
  const saveNewBooking = async (bookingData: EditBookingData) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: bookingData.customerName,
          phoneNumber: bookingData.customerPhone,
          selectedDate: bookingData.selectedDate,
          selectedTime: bookingData.selectedTime,
          selectedServices: bookingData.selectedServices,
          notes: bookingData.notes,
          createdBy: 'admin'
        }),
      })

      const data = await response.json()
      if (data.success) {
        setIsCreatingBooking(false)
        fetchBookings(currentDateRange.startDate, currentDateRange.endDate, currentDateRange.view)
        alert('تم إنشاء الحجز بنجاح!')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      logError('خطأ في إنشاء الحجز:', error)
      alert('خطأ في الاتصال بالخادم')
      throw error
    }
  }

  const saveBookingChanges = async (bookingId: number, editData: EditBookingData) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: editData.customerName,
          customerPhone: editData.customerPhone,
          selectedDate: editData.selectedDate,
          selectedTime: editData.selectedTime,
          selectedServices: editData.selectedServices,
          notes: editData.notes
        })
      })

      const data = await response.json()
      if (data.success) {
        setEditingBooking(null)
        fetchBookings(currentDateRange.startDate, currentDateRange.endDate, currentDateRange.view)
        alert('تم تحديث الحجز بنجاح!')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      logError('خطأ في حفظ التعديلات:', error)
      alert('خطأ في الاتصال بالخادم')
      throw error
    }
  }

  const deleteBooking = async (bookingId: number, reason: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason })
      })

      const data = await response.json()
      if (data.success) {
        setDeletingBooking(null)
        fetchBookings(currentDateRange.startDate, currentDateRange.endDate, currentDateRange.view)
        alert('تم حذف الحجز بنجاح!')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      logError('خطأ في حذف الحجز:', error)
      alert('خطأ في الاتصال بالخادم')
      throw error
    }
  }

  // ✅ دوال التنقل والتواريخ محسنة
  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate)
    currentDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1))

    const newDate = currentDate.toISOString().split('T')[0]
    setSelectedDate(newDate)
    setCurrentMonth(currentDate)

    // ✅ useEffect سيحدث currentDateRange تلقائياً
  }

  const changeMonth = (monthIndex: number) => {
    const year = currentMonth.getFullYear()
    const newDate = new Date(year, monthIndex, 1)
    const newDateString = newDate.toISOString().split('T')[0]

    setSelectedDate(newDateString)
    setCurrentMonth(newDate)

    // ✅ useEffect سيحدث currentDateRange تلقائياً
  }

  const changeYear = (yearValue: number) => {
    const month = currentMonth.getMonth()
    const newDate = new Date(yearValue, month, 1)
    const newDateString = newDate.toISOString().split('T')[0]

    setSelectedDate(newDateString)
    setCurrentMonth(newDate)

    // ✅ useEffect سيحدث currentDateRange تلقائياً
  }

  // ✅ دالة goToToday محسنة
  const goToToday = () => {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]

    setSelectedDate(todayString)
    setCurrentMonth(today)

    // ✅ useEffect سيحدث currentDateRange تلقائياً حسب viewMode
  }

  if (loading) return <LoadingSpinner />

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
              <h1 className="text-xl font-bold text-gray-800">إدارة الحجوزات</h1>
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>

            <button onClick={handleLogout} className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 hover:text-red-800 transition-colors duration-300">
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* رسائل الخطأ */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* الهيدر المدمج */}
        <CombinedHeader
          currentView={viewMode}
          onViewChange={setViewMode}
          currentMonth={currentMonth}
          onNavigateMonth={navigateMonth}
          onChangeMonth={changeMonth}
          onChangeYear={changeYear}
          onGoToToday={goToToday}
          stats={currentStats}
          onNavigateView={handleViewNavigation}
          selectedDate={selectedDate}
          currentWeekRange={currentWeekRange}
        />

        {/* العروض */}
        <div className="space-y-6">

          {/* العرض الشهري */}
          {viewMode === 'month' && (
            <MonthView
              currentMonth={currentMonth}
              bookings={bookings}
              blockedTimes={blockedTimes}
              onSwitchToDayView={handleSwitchToDayView}
            />
          )}

          {/* العرض اليومي */}
          {viewMode === 'day' && (
            <DayView
              selectedDate={selectedDate || new Date().toISOString().split('T')[0]}
              bookings={bookings}
              services={services}
              servicesWithCategories={servicesWithCategories}
              adminTimeSlots={adminTimeSlots}
              blockedTimes={blockedTimes}
              getServiceColor={getServiceColor}
              onCreateNewBooking={(_date, _time) => {
                openNewBooking()
              }}
              onEditBooking={openEditBooking}
              onDeleteBooking={openDeleteBooking}
              onShowPhoneMenu={(phone: string, customerName: string) =>
                setShowPhoneMenu({phone, customerName})
              }
              onBlockTime={blockSingleTime}
              onUnblockTime={unblockSingleTime}
              onDateChange={(newDate) => handleDateChange(newDate, setSelectedDate)}
            />
          )}

          {/* العرض الأسبوعي */}
          {viewMode === 'week' && (
            <WeekView
              selectedDate={selectedDate || new Date().toISOString().split('T')[0]}
              bookings={bookings}
              services={services}
              servicesWithCategories={servicesWithCategories}
              adminTimeSlots={adminTimeSlots}
              blockedTimes={blockedTimes}
              getServiceColor={getServiceColor}
              onCreateNewBooking={(_date, _time) => {
                openNewBooking()
              }}
              onEditBooking={openEditBooking}
              onDeleteBooking={openDeleteBooking}
              onShowPhoneMenu={(phone: string, customerName: string) =>
                setShowPhoneMenu({phone, customerName})
              }
              onBlockTime={blockSingleTime}
              onUnblockTime={unblockSingleTime}
              onDateChange={(newDate) => handleDateChange(newDate, setSelectedDate)}
              onSwitchToDayView={handleSwitchToDayView}
            />
          )}
        </div>
      </div>

      {/* النوافذ المنبثقة */}
      <NewBookingModal
        isOpen={isCreatingBooking}
        onClose={() => setIsCreatingBooking(false)}
        services={servicesMap}
        allServices={allServices}
        adminTimeSlots={adminTimeSlots}
        onSave={saveNewBooking}
        getServiceColor={getServiceColor}
        selectedDate={selectedDate}
      />

      <EditBookingModal
        isOpen={!!editingBooking}
        onClose={() => setEditingBooking(null)}
        booking={editingBooking}
        services={servicesMap}
        allServices={allServices}
        adminTimeSlots={adminTimeSlots}
        onSave={saveBookingChanges}
        getServiceColor={getServiceColor}
      />

      <DeleteBookingModal
        isOpen={!!deletingBooking}
        onClose={() => setDeletingBooking(null)}
        booking={deletingBooking}
        onDelete={deleteBooking}
        services={servicesMap}
      />

      <PhoneMenu
        isOpen={!!showPhoneMenu}
        phone={showPhoneMenu?.phone || ''}
        customerName={showPhoneMenu?.customerName || ''}
        onClose={() => setShowPhoneMenu(null)}
      />
    </div>
  )
}
