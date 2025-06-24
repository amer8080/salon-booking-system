// src/app/book/components/BookingConfirmationStep.tsx
// خطوة التأكيد النهائي للحجز

import React, { useEffect } from 'react'
import { CheckCircle, Edit, ArrowRight, Loader2, Calendar, Clock, User, Phone, Sparkles, Download, MessageCircle, X } from 'lucide-react'
import { BookingConfirmationStepProps } from '../types/booking-form.types'
import { createBookingSummary, formatTimeForDisplay, createWhatsAppURL } from '../utils/booking-helpers'

import { logError } from "@/lib/logger-client";

export default function BookingConfirmationStep({
  formData,
  services,
  onConfirm,
  onBack,
  onEdit,
  isSubmitting,
  errors
}: BookingConfirmationStepProps) {

  const [showDetails, setShowDetails] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const summary = createBookingSummary(formData, services)

  // Auto-expand details on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setShowDetails(true)
    }
  }, [])

  const handleConfirm = async () => {
    if (!agreedToTerms) {
      alert('يرجى الموافقة على الشروط والأحكام')
      return
    }
    
    try {
      await onConfirm()
    } catch (error) {
      logError('Confirmation failed:', error)
    }
  }

  const handleWhatsAppContact = () => {
    const whatsappUrl = createWhatsAppURL(summary.customerInfo.phone, summary.additionalInfo.whatsappMessage || "")
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          تأكيد الحجز
        </h2>
        
        <p className="text-gray-600 text-lg">
          راجعي تفاصيل حجزك قبل التأكيد النهائي
        </p>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">ملخص الحجز</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-purple-600 hover:text-purple-800 font-medium text-sm"
            >
              {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
            </button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">اسم العميلة</p>
                <p className="text-lg font-semibold text-gray-800">
                  {summary.customerInfo.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الهاتف</p>
                <p className="text-lg font-semibold text-gray-800" dir="ltr">
                  {summary.customerInfo.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">تاريخ الموعد</p>
                <p className="text-lg font-semibold text-gray-800">
                  {summary.appointmentInfo.formattedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">وقت الموعد</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatTimeForDisplay(summary.appointmentInfo.time)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <h4 className="text-lg font-semibold text-gray-800">
                الخدمات المختارة
              </h4>
            </div>
            <button
              onClick={() => onEdit(2)}
              className="flex items-center space-x-1 rtl:space-x-reverse text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل</span>
            </button>
          </div>

          <div className="space-y-3">
            {summary.servicesInfo.services.map((service, index) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-sm font-bold text-pink-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{service.nameAr}</p>
                    <p className="text-sm text-gray-600">
                      {service.duration} دقيقة
                      {service.price > 0 && ` • ${service.price} ₺`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Services Summary */}
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">إجمالي الخدمات:</span>
              <span className="font-semibold text-gray-800">
                {summary.servicesInfo.services.length} خدمة
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">المدة الإجمالية:</span>
              <span className="font-semibold text-gray-800">
                {Math.round(summary.servicesInfo.totalDuration / 60)} ساعة تقريباً
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {showDetails && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-4">تفاصيل إضافية</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">المدة المتوقعة للجلسة:</p>
                <p className="font-medium text-gray-800">
                  {summary.servicesInfo.totalDuration} دقيقة
                </p>
              </div>
              <div>
                <p className="text-gray-600">نوع الحجز:</p>
                <p className="font-medium text-gray-800">حجز عبر الموقع</p>
              </div>
              <div>
                <p className="text-gray-600">حالة الموعد:</p>
                <p className="font-medium text-green-600">في انتظار التأكيد</p>
              </div>
              <div>
                <p className="text-gray-600">رقم المرجع:</p>
                <p className="font-medium text-gray-800" dir="ltr">
                  BK-{Date.now().toString().slice(-6)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          الشروط والأحكام
        </h3>
        
        <div className="space-y-3 text-sm text-gray-600 mb-4">
          <div className="flex items-start space-x-2 rtl:space-x-reverse">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>يرجى الحضور قبل 10 دقائق من موعدك المحدد</p>
          </div>
          <div className="flex items-start space-x-2 rtl:space-x-reverse">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>في حالة التأخير أكثر من 15 دقيقة، قد يتم إلغاء الموعد</p>
          </div>
          <div className="flex items-start space-x-2 rtl:space-x-reverse">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>لإلغاء أو تعديل الموعد، يرجى التواصل معنا قبل 4 ساعات على الأقل</p>
          </div>
          <div className="flex items-start space-x-2 rtl:space-x-reverse">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>سيتم إرسال رسالة تأكيد عبر واتساب</p>
          </div>
        </div>

        <label className="flex items-start space-x-3 rtl:space-x-reverse cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            أوافق على الشروط والأحكام المذكورة أعلاه وأؤكد صحة البيانات المدخلة
          </span>
        </label>
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-5 h-5 text-red-600">⚠️</div>
            <p className="text-red-800 font-medium">خطأ في التأكيد</p>
          </div>
          <p className="text-red-700 text-sm mt-1">{errors.general}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
        {/* Back Button */}
        <button
          onClick={() => onBack()}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-800 font-medium py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50"
        >
          <ArrowRight className="w-5 h-5" />
          <span>تعديل البيانات</span>
        </button>

        {/* Alternative Contact */}
        <button
          onClick={handleWhatsAppContact}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 rtl:space-x-reverse bg-green-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
        >
          <MessageCircle className="w-5 h-5" />
          <span>حجز عبر واتساب</span>
        </button>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!agreedToTerms || isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl active:scale-95 min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري التأكيد...</span>
            </>
          ) : (
            <>
              <span>تأكيد الحجز نهائياً</span>
              <CheckCircle className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          بتأكيد الحجز، سيتم إرسال رسالة تأكيد إلى رقم هاتفك المسجل
        </p>
        <p className="text-xs text-gray-400 mt-1">
          لأي استفسارات، تواصل معنا عبر واتساب
        </p>
      </div>
    </div>
  )
}

// Success Modal Component
export function BookingSuccessModal({
  isOpen,
  onClose,
  bookingData,
  onDownloadCalendar,
  onShareWhatsApp
}: {
  isOpen: boolean
  onClose: () => void
  bookingData: any
  onDownloadCalendar?: () => void
  onShareWhatsApp?: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            تم تأكيد حجزك بنجاح! 🎉
          </h2>
          
          <p className="text-gray-600 mb-6">
            رقم الحجز: <span className="font-semibold">{bookingData?.reservationId}</span>
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onDownloadCalendar && (
              <button
                onClick={onDownloadCalendar}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>حفظ في التقويم</span>
              </button>
            )}
            
            {onShareWhatsApp && (
              <button
                onClick={onShareWhatsApp}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مشاركة عبر واتساب</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

