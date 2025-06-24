'use client'

import { useState } from 'react'
import { 
  X, 
  Trash2, 
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Phone
} from 'lucide-react'
import { Booking } from '../../types/booking.types'
import { fromDatabaseTime, formatIstanbulDate, formatArabicDate } from '@/lib/timezone'

interface DeleteBookingModalProps {
  // Props للـ modal
  isOpen: boolean
  onClose: () => void
  
  // Props للحجز
  booking: Booking | null
  
  // Props للوظائف
  onDelete: (bookingId: number, reason: string) => Promise<void>
  
  // Props للبيانات
  services: { [key: string]: string }
}

const DeleteBookingModal: React.FC<DeleteBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onDelete,
  services
}) => {
  // ✅ State محلي للـ modal
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [validationError, setValidationError] = useState('')

  // ✅ تنظيف البيانات عند الإغلاق
  const handleClose = () => {
    setDeleteReason('')
    setValidationError('')
    setIsDeleting(false)
    onClose()
  }

  // ✅ التحقق من صحة البيانات
  const validateReason = (): boolean => {
    if (!deleteReason.trim()) {
      setValidationError('سبب الحذف مطلوب')
      return false
    }
    
    if (deleteReason.trim().length < 10) {
      setValidationError('يرجى كتابة سبب مفصل (10 أحرف على الأقل)')
      return false
    }
    
    setValidationError('')
    return true
  }

  // ✅ تنفيذ الحذف
  const handleDelete = async () => {
    if (!booking) return
    
    // التحقق من صحة البيانات
    if (!validateReason()) {
      return
    }
    
    try {
      setIsDeleting(true)
      await onDelete(booking.id, deleteReason.trim())
      handleClose()
    } catch {
      setValidationError('فشل في حذف الحجز. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsDeleting(false)
    }
  }

  // ✅ تنسيق عرض التاريخ
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return ''
    try {
      const dateObj = fromDatabaseTime(dateString)
      return formatArabicDate(dateObj)
    } catch {
      return dateString
    }
  }

  // ✅ تنسيق عرض الوقت
  const formatTimeDisplay = (timeString: string) => {
    if (!timeString) return ''
    try {
      const timeObj = fromDatabaseTime(timeString)
      return formatIstanbulDate(timeObj, 'time')
    } catch {
      return timeString
    }
  }

  // ✅ لا نعرض شيئاً إذا لم يكن الـ modal مفتوح
  if (!isOpen || !booking) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        {/* 🎨 Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-red-600 flex items-center space-x-2 rtl:space-x-reverse">
            <AlertTriangle className="w-5 h-5" />
            <span>تأكيد حذف الحجز</span>
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 active:text-gray-700 transition-colors"
            disabled={isDeleting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ⚠️ تحذير وتفاصيل الحجز */}
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium mb-2">
                  سيتم حذف هذا الحجز نهائياً ولا يمكن التراجع عن هذا الإجراء
                </p>
                <div className="text-red-700 text-sm space-y-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <User className="w-4 h-4" />
                    <span className="font-medium">العميلة:</span>
                    <span>{booking.customerName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">الهاتف:</span>
                    <span dir="ltr">{booking.customerPhone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">التاريخ:</span>
                    <span>{formatDateDisplay(booking.date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">الوقت:</span>
                    <span>{formatTimeDisplay(booking.startTime)}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <span className="font-medium">الخدمات:</span>
                    <div className="flex flex-wrap gap-1">
                      {booking.serviceIds.map((serviceId, index) => (
                        <span
                          key={`delete-service-${serviceId}-${index}`}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                        >
                          {services[serviceId] || `خدمة ${serviceId}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📝 سبب الحذف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سبب الحذف *
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => {
                setDeleteReason(e.target.value)
                // إزالة رسالة الخطأ عند البدء في الكتابة
                if (validationError && e.target.value.trim()) {
                  setValidationError('')
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none ${
                validationError 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              rows={3}
              placeholder="يرجى توضيح سبب حذف الحجز بالتفصيل..."
              disabled={isDeleting}
              maxLength={500}
            />
            
            {/* عداد الأحرف */}
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-500">
                {deleteReason.length}/500 حرف
              </div>
              {deleteReason.trim().length > 0 && deleteReason.trim().length < 10 && (
                <div className="text-xs text-orange-600">
                  {10 - deleteReason.trim().length} أحرف إضافية مطلوبة
                </div>
              )}
            </div>
            
            {/* رسالة الخطأ */}
            {validationError && (
              <p className="text-red-500 text-xs mt-1 flex items-center space-x-1 rtl:space-x-reverse">
                <AlertTriangle className="w-3 h-3" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          {/* 📋 أمثلة أسباب الحذف */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">أمثلة لأسباب صحيحة:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• طلب العميلة إلغاء الموعد</li>
              <li>• ظروف طارئة منعت حضور العميلة</li>
              <li>• تعديل خطأ في النظام</li>
              <li>• موعد مكرر بالخطأ</li>
            </ul>
          </div>
        </div>

        {/* 🎯 أزرار العمل */}
        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6 pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg active:bg--gray-50 transition-colors"
            disabled={isDeleting}
          >
            إلغاء
          </button>
          <button
            onClick={handleDelete}
            className={`px-4 py-2 bg-red-600 text-white rounded-lg active:bg--red-700 flex items-center space-x-2 rtl:space-x-reverse transition-all ${
              isDeleting || !deleteReason.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isDeleting || !deleteReason.trim()}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>حذف نهائياً</span>
              </>
            )}
          </button>
        </div>

        {/* 💡 ملاحظة أمان */}
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-xs text-center">
            💡 تأكد من صحة قرار الحذف - لا يمكن التراجع عن هذا الإجراء
          </p>
        </div>
      </div>
    </div>
  )
}

export default DeleteBookingModal



