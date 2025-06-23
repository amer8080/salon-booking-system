'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  Check, 
  Sparkles, 
  Calendar,
  Clock,
  User,
  Phone,
  Edit
} from 'lucide-react'
import { Booking, Service, EditBookingData } from '../../types/booking.types'
import { fromDatabaseTime, formatIstanbulDate, formatArabicDate } from '@/lib/timezone'

interface EditBookingModalProps {
  // Props للـ modal
  isOpen: boolean
  onClose: () => void
  
  // Props للحجز
  booking: Booking | null
  
  // Props للبيانات المطلوبة
  services: { [key: string]: string }
  allServices: Service[]
  adminTimeSlots: string[]
  
  // Props للوظائف
  onSave: (bookingId: number, editData: EditBookingData) => Promise<void>
  
  // Props للتصميم
  getServiceColor: (serviceId: string) => string
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  allServices,
  adminTimeSlots,
  onSave,
  getServiceColor
}) => {
  // ✅ State محلي للـ modal
  const [editData, setEditData] = useState<EditBookingData>({
    customerName: '',
    customerPhone: '',
    selectedDate: '',
    selectedTime: '',
    selectedServices: [],
    notes: ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // ✅ تحديث البيانات عند فتح الـ modal
  useEffect(() => {
    if (booking && isOpen) {
      const bookingDateTime = fromDatabaseTime(booking.date)
      const startDateTime = fromDatabaseTime(booking.startTime)
      
      const dateString = formatIstanbulDate(bookingDateTime, 'date')
      const timeString = formatIstanbulDate(startDateTime, 'time')
      
      setEditData({
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        selectedDate: dateString,
        selectedTime: timeString,
        selectedServices: booking.serviceIds,
        notes: ''
      })
      
      setValidationErrors([])
    }
  }, [booking, isOpen])

  // ✅ تنظيف البيانات عند الإغلاق
  const handleClose = () => {
    setEditData({
      customerName: '',
      customerPhone: '',
      selectedDate: '',
      selectedTime: '',
      selectedServices: [],
      notes: ''
    })
    setValidationErrors([])
    setIsSaving(false)
    onClose()
  }

  // ✅ تبديل اختيار الخدمة
  const toggleService = (serviceId: string) => {
    setEditData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }))
    
    // إزالة خطأ الخدمات إذا تم اختيار خدمة
    if (validationErrors.includes('services')) {
      setValidationErrors(prev => prev.filter(error => error !== 'services'))
    }
  }

  // ✅ التحقق من صحة البيانات
  const validateData = (): boolean => {
    const errors: string[] = []
    
    if (!editData.customerName.trim()) {
      errors.push('name')
    }
    
    if (!editData.customerPhone.trim()) {
      errors.push('phone')
    }
    
    if (!editData.selectedDate) {
      errors.push('date')
    }
    
    if (!editData.selectedTime) {
      errors.push('time')
    }
    
    if (editData.selectedServices.length === 0) {
      errors.push('services')
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  // ✅ حفظ التعديلات
  const handleSave = async () => {
    if (!booking) return
    
    // التحقق من صحة البيانات
    if (!validateData()) {
      return
    }
    
    try {
      setIsSaving(true)
      await onSave(booking.id, editData)
      handleClose()
    } catch (error) {
      // يمكن إضافة معالجة أخطاء أكثر تفصيلاً هنا
    } finally {
      setIsSaving(false)
    }
  }

  // ✅ تنسيق عرض التاريخ
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return ''
    try {
      const dateObj = new Date(dateString + 'T00:00:00')
      return formatArabicDate(dateObj)
    } catch {
      return dateString
    }
  }

  // ✅ لا نعرض شيئاً إذا لم يكن الـ modal مفتوح
  if (!isOpen || !booking) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 🎨 Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2 rtl:space-x-reverse">
            <Edit className="w-5 h-5 text-purple-600" />
            <span>تعديل الحجز</span>
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 active:text-gray-700 transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 📝 نموذج التعديل */}
        <div className="space-y-6">
          {/* 👤 معلومات العميلة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم العميلة *
              </label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={editData.customerName}
                  onChange={(e) => {
                    setEditData({ ...editData, customerName: e.target.value })
                    if (validationErrors.includes('name')) {
                      setValidationErrors(prev => prev.filter(error => error !== 'name'))
                    }
                  }}
                  className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    validationErrors.includes('name') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="أدخل اسم العميلة"
                  disabled={isSaving}
                />
              </div>
              {validationErrors.includes('name') && (
                <p className="text-red-500 text-xs mt-1">اسم العميلة مطلوب</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف *
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={editData.customerPhone}
                  onChange={(e) => {
                    setEditData({ ...editData, customerPhone: e.target.value })
                    if (validationErrors.includes('phone')) {
                      setValidationErrors(prev => prev.filter(error => error !== 'phone'))
                    }
                  }}
                  className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    validationErrors.includes('phone') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="+90 5XX XXX XX XX"
                  dir="ltr"
                  disabled={isSaving}
                />
              </div>
              {validationErrors.includes('phone') && (
                <p className="text-red-500 text-xs mt-1">رقم الهاتف مطلوب</p>
              )}
            </div>
          </div>

          {/* 📅 تعديل التاريخ والوقت */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-3 flex items-center space-x-2 rtl:space-x-reverse">
              <Calendar className="w-4 h-4" />
              <span>تعديل التاريخ والوقت</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التاريخ * - {formatDateDisplay(editData.selectedDate)}
                </label>
                <input
                  type="date"
                  value={editData.selectedDate}
                  onChange={(e) => {
                    setEditData({ ...editData, selectedDate: e.target.value })
                    if (validationErrors.includes('date')) {
                      setValidationErrors(prev => prev.filter(error => error !== 'date'))
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    validationErrors.includes('date') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  disabled={isSaving}
                />
                {validationErrors.includes('date') && (
                  <p className="text-red-500 text-xs mt-1">التاريخ مطلوب</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوقت *
                </label>
                <div className="relative">
                  <Clock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={editData.selectedTime}
                    onChange={(e) => {
                      setEditData({ ...editData, selectedTime: e.target.value })
                      if (validationErrors.includes('time')) {
                        setValidationErrors(prev => prev.filter(error => error !== 'time'))
                      }
                    }}
                    className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      validationErrors.includes('time') 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="">اختر الوقت</option>
                    {adminTimeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.includes('time') && (
                  <p className="text-red-500 text-xs mt-1">الوقت مطلوب</p>
                )}
              </div>
            </div>

            <div className="mt-3 text-xs text-purple-600 bg-purple-100 p-2 rounded">
              💡 يمكنك تغيير التاريخ والوقت لنقل الحجز، أو تركهما كما هما للتعديل العادي
            </div>
          </div>

          {/* 🛍️ الخدمات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              الخدمات المطلوبة * ({editData.selectedServices.length} خدمة مختارة)
            </label>

            <div className={`bg-gray-50 p-4 rounded-lg border max-h-60 overflow-y-auto transition-colors ${
              validationErrors.includes('services') 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allServices.map((service) => (
                  <div
                    key={service.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      editData.selectedServices.includes(service.id)
                        ? 'border-purple-300 bg-purple-50 shadow-sm'
                        : 'border-gray-200 bg-white active:border-purple-200 active:shadow-sm'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isSaving && toggleService(service.id)}
                  >
                    <div className="flex items-center w-full">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                        editData.selectedServices.includes(service.id)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {editData.selectedServices.includes(service.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {service.nameAr}
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.category} • {service.duration} دقيقة
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {editData.selectedServices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>لم يتم اختيار أي خدمة</p>
                  <p className="text-sm">انقر على الخدمات لاختيارها</p>
                </div>
              )}
            </div>

            {validationErrors.includes('services') && (
              <p className="text-red-500 text-xs mt-1">يجب اختيار خدمة واحدة على الأقل</p>
            )}

            {/* 🏷️ عرض الخدمات المختارة */}
            {editData.selectedServices.length > 0 && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm font-medium text-purple-800 mb-2 flex items-center space-x-2 rtl:space-x-reverse">
                  <Sparkles className="w-4 h-4" />
                  <span>الخدمات المختارة:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editData.selectedServices.map((serviceId, serviceIndex) => {
                    const service = allServices.find(s => s.id === serviceId)
                    const serviceColor = getServiceColor(serviceId)

                    return (
                      <span
                        key={`selected-service-${serviceId}-${serviceIndex}`}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${serviceColor} transition-all`}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {service?.nameAr || `خدمة ${serviceId}`}
                        <button
                          onClick={() => !isSaving && toggleService(serviceId)}
                          className="ml-1 active:opacity-70 transition-opacity"
                          disabled={isSaving}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 📝 ملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات إضافية
            </label>
            <textarea
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              rows={3}
              placeholder="ملاحظات إضافية عن الحجز..."
              disabled={isSaving}
            />
          </div>
        </div>

        {/* 🎯 أزرار العمل */}
        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6 pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg active:bg--gray-50 transition-colors"
            disabled={isSaving}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-purple-600 text-white rounded-lg active:bg--purple-700 flex items-center space-x-2 rtl:space-x-reverse transition-all ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSaving || editData.selectedServices.length === 0}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>

        {/* ⚠️ عرض أخطاء التحقق */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium mb-1">يرجى إكمال البيانات المطلوبة:</p>
            <ul className="text-red-600 text-xs space-y-1">
              {validationErrors.includes('name') && <li>• اسم العميلة</li>}
              {validationErrors.includes('phone') && <li>• رقم الهاتف</li>}
              {validationErrors.includes('date') && <li>• التاريخ</li>}
              {validationErrors.includes('time') && <li>• الوقت</li>}
              {validationErrors.includes('services') && <li>• اختيار خدمة واحدة على الأقل</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditBookingModal
