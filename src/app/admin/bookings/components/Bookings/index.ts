// ======================================
// فهرس مكونات الحجوزات
// ======================================

// المكونات الأساسية
export { default as BookingCard } from './BookingCard'

// أنواع البيانات (إعادة تصدير للسهولة)
export type { 
  Booking, 
  Service, 
  EditBookingData,
  BookingStatus,
  BOOKING_CONSTANTS 
} from '../../types/booking.types'

// ====== ملاحظات للتطوير المستقبلي ======
// 
// المكونات المخططة للإضافة:
// - BookingForm.tsx (نموذج إنشاء/تعديل منفصل)
// - BookingFilters.tsx (فلاتر البحث والتصفية)
// - BookingStats.tsx (إحصائيات الحجوزات)
// - BookingExport.tsx (تصدير البيانات)
// 
// مثال الاستخدام المستقبلي:
// export { default as BookingForm } from './BookingForm'
// export { default as BookingFilters } from './BookingFilters'
// export { default as BookingStats } from './BookingStats'
// export { default as BookingExport } from './BookingExport'