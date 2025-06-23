// src/app/admin/bookings/types/booking.types.ts
// جميع أنواع البيانات والواجهات المستخدمة في نظام الحجوزات

/**
 * واجهة بيانات الحجز
 */
export interface Booking {
  id: number
  customerName: string
  customerPhone: string
  date: string
  startTime: string
  endTime: string
  serviceIds: string[] // 🔧 مُصلح: كان services
  status: 'confirmed' | 'cancelled' | 'completed'
  totalPrice: number
  createdAt: string
  notes?: string // 🔧 إضافة notes
}

/**
 * واجهة بيانات الخدمة
 */
export interface Service {
  id: string
  name: string // 🔧 مبسط: كان nameAr, nameEn, nameTr
  nameAr?: string
  nameEn?: string
  nameTr?: string
  category: string
  price: number
  duration: number
  isActive: boolean
}

/**
 * واجهة بيانات تعديل/إنشاء الحجز
 */
export interface EditBookingData {
  customerName: string
  customerPhone: string
  selectedDate: string
  selectedTime: string
  selectedServices: string[]
  notes?: string
}

/**
 * واجهة بيانات الأوقات المقفلة
 */
export interface BlockedTime {
  id: number
  date: string
  startTime: string | null
  endTime: string | null
  isRecurring: boolean
  recurringType: string | null
  reason: string | null
  createdBy: string
  createdAt: string
}

/**
 * نوع نطاق التاريخ للتصفية
 */
export interface DateRange {
  startDate: string
  endDate: string
  view: ViewType
}

/**
 * أنواع العرض المتاحة
 */
export type ViewType = 'month' | 'week' | 'day'

/**
 * حالات الحجز المتاحة
 */
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'

/**
 * فئات الخدمات وألوانها
 */
export type ServiceCategory = 'hair' | 'makeup' | 'nails' | 'skincare' | 'default'

/**
 * ألوان فئات الخدمات
 */
export interface CategoryColors {
  hair: string
  makeup: string
  nails: string
  skincare: string
  default: string
}

/**
 * نوع إجراء الإقفال/الفتح
 */
export interface BlockingAction {
  type: 'lock' | 'unlock' | 'mixed'
  text: string
  icon: any // نوع أيقونة Lucide React
}

/**
 * خصائص مكون اليوم في التقويم
 */
export interface CalendarDayProps {
  day: Date | null
  dayString: string
  dayBookings: Booking[]
  isToday: boolean
  isSelected: boolean
  isPast: boolean
  dayBlocked: boolean
  isSelectedForBlock: boolean
  isSelectingDaysForBlock: boolean
  onDayClick: (dayString: string) => void
  onSelectDate: (date: Date) => void
}

/**
 * خصائص مكون الحجز
 */
export interface BookingCardProps {
  booking: Booking
  timeString: string
  selectedDate: string
  services: { [key: string]: string }
  showPhoneMenu: string | null
  onEditBooking: (booking: Booking) => void
  onDeleteBooking: (booking: Booking) => void
  onShowPhoneMenu: (phone: string | null) => void
  onCopyPhone: (phone: string) => void
  onOpenWhatsApp: (phone: string, name: string) => void
  onMakeCall: (phone: string) => void
  onUnblockTime: (date: string, time: string) => void
  getServiceColor: (serviceId: string) => string
  isTimeBlocked: (date: string, time: string) => boolean
}

/**
 * خصائص modal تعديل الحجز
 */
export interface EditBookingModalProps {
  editingBooking: Booking | null
  editData: EditBookingData
  allServices: Service[]
  adminTimeSlots: string[]
  onClose: () => void
  onSave: () => void
  onUpdateEditData: (data: EditBookingData) => void
  onToggleService: (serviceId: string) => void
  getServiceColor: (serviceId: string) => string
  formatArabicDateDisplay: (dateString: string) => string
}

/**
 * خصائص modal حذف الحجز
 */
export interface DeleteBookingModalProps {
  deletingBooking: Booking | null
  deleteReason: string
  onClose: () => void
  onDelete: () => void
  onReasonChange: (reason: string) => void
  formatArabicDateDisplay: (dateString: string) => string
  formatIstanbulDate: (date: Date, format: string) => string
  fromDatabaseTime: (time: string) => Date
}

/**
 * خصائص modal إنشاء حجز جديد
 */
export interface NewBookingModalProps {
  isCreatingBooking: boolean
  newBookingData: EditBookingData
  allServices: Service[]
  adminTimeSlots: string[]
  onClose: () => void
  onSave: () => void
  onUpdateNewBookingData: (data: EditBookingData) => void
  onToggleService: (serviceId: string) => void
  getServiceColor: (serviceId: string) => string
  formatArabicDateDisplay: (dateString: string) => string
}

/**
 * خصائص نظام الإقفال
 */
export interface BlockingSystemProps {
  selectedDate: string
  selectedDayBookings: Booking[]
  blockedTimes: BlockedTime[]
  adminTimeSlots: string[]
  isSelectingTimesForBlock: boolean
  selectedTimesToBlock: string[]
  onToggleTimeSelection: (time: string) => void
  onProcessSelectedTimes: () => void
  onCancelTimeSelection: () => void
  isTimeBlocked: (date: string, time: string) => boolean
  getSelectedTimesAction: () => BlockingAction
}

/**
 * خصائص قائمة الهاتف
 */
export interface PhoneMenuProps {
  phone: string
  customerName: string
  isVisible: boolean
  onMakeCall: () => void
  onOpenWhatsApp: () => void
  onCopyPhone: () => void
  onClose: () => void
}

/**
 * ثوابت النظام
 */
export const BOOKING_CONSTANTS = {
  ADMIN_START_HOUR: 11,
  ADMIN_END_HOUR: 19,
  TIME_SLOT_DURATION: 30, // minutes
  AVAILABLE_YEARS: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
  MONTH_NAMES: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ],
  DAY_NAMES: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  CATEGORY_COLORS: {
    hair: 'bg-green-100 text-green-700',
    makeup: 'bg-purple-100 text-purple-700',
    nails: 'bg-blue-100 text-blue-700',
    skincare: 'bg-yellow-100 text-yellow-700',
    default: 'bg-gray-100 text-gray-700'
  } as CategoryColors
} as const

/**
 * نوع ثوابت النظام
 */
export type BookingConstants = typeof BOOKING_CONSTANTS