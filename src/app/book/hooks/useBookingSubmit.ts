// src/app/book/hooks/useBookingSubmit.ts
// Hook لإرسال الحجز مع retry logic ومعالجة أخطاء ذكية

import { useState, useCallback, useEffect } from 'react'
import { BookingFormData } from '../types/booking-form.types'
import { Service } from '../types/booking-form.types'
import { validateBookingForm } from '../utils/form-validation'
import { createRetryWithBackoff, logBookingError } from '../utils/error-handling'
import { formatWhatsAppMessage } from '../utils/booking-helpers'

interface UseBookingSubmitProps {
  onSuccess?: (response: any) => void
  onError?: (error: string) => void
  maxRetries?: number
  retryDelay?: number
  enableWhatsAppFallback?: boolean
}

interface UseBookingSubmitReturn {
  // State
  isSubmitting: boolean
  submitError: string
  retryCount: number
  lastSubmissionData: BookingFormData | null

  // Actions
  submitBooking: (formData: BookingFormData, services: Service[]) => Promise<boolean>
  retrySubmission: () => Promise<boolean>
  cancelSubmission: () => void
  clearError: () => void

  // WhatsApp fallback
  openWhatsApp: (formData: BookingFormData, services: Service[]) => void
  whatsappNumber: string

  // Network status
  isOnline: boolean
  networkQuality: 'fast' | 'slow' | 'offline'
}

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_DELAY = 1000
const WHATSAPP_NUMBER = '905511234567' // رقم واتساب الصالون

export function useBookingSubmit({
  onSuccess,
  onError,
  maxRetries = DEFAULT_MAX_RETRIES,
  retryDelay = DEFAULT_RETRY_DELAY,
  enableWhatsAppFallback = true
}: UseBookingSubmitProps = {}): UseBookingSubmitReturn {

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [lastSubmissionData, setLastSubmissionData] = useState<BookingFormData | null>(null)
  
  // Network status - إصلاح SSR
  const [isOnline, setIsOnline] = useState(true) // افتراضي true للـ SSR
  const [networkQuality, setNetworkQuality] = useState<'fast' | 'slow' | 'offline'>('fast')

  // تحديث network status بعد التحميل
  useEffect(() => {
    if (typeof window === 'undefined') return

    // تحديث القيمة الحقيقية بعد mount
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setNetworkQuality('fast')
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setNetworkQuality('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // مراقبة جودة الشبكة
    if ('connection' in navigator) {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      if (connection) {
        const updateNetworkQuality = () => {
          const { effectiveType, downlink } = connection
          
          if (!navigator.onLine) {
            setNetworkQuality('offline')
          } else if (effectiveType === '4g' && downlink > 1.5) {
            setNetworkQuality('fast')
          } else {
            setNetworkQuality('slow')
          }
        }

        updateNetworkQuality()
        connection.addEventListener('change', updateNetworkQuality)

        return () => {
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
          connection.removeEventListener('change', updateNetworkQuality)
        }
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // إرسال الحجز
  const submitBooking = useCallback(async (
    formData: BookingFormData, 
    services: Service[]
  ): Promise<boolean> => {
    // التحقق من البيانات أولاً
    const validation = validateBookingForm(formData)
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0]
      setSubmitError(firstError || 'يرجى مراجعة البيانات')
      onError?.(firstError || 'بيانات غير صحيحة')
      return false
    }

    // التحقق من الاتصال
    if (!isOnline) {
      setSubmitError('لا يوجد اتصال بالإنترنت')
      onError?.('لا يوجد اتصال بالإنترنت')
      return false
    }

    setIsSubmitting(true)
    setSubmitError('')
    setLastSubmissionData(formData)
    setRetryCount(0)

    try {
      // تحضير البيانات للإرسال

      const bookingData = {
        phoneNumber: formData.phoneNumber,
        customerName: formData.customerName,
        selectedServices: formData.selectedServices,
        selectedDate: formData.selectedDate,    
        selectedTime: formData.selectedTime,
      }

      // إرسال الطلب مع retry logic
      const retrySubmit = createRetryWithBackoff(async () => {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP ${response.status}`)
        }

        return response.json()
      }, maxRetries, retryDelay)

      const result = await retrySubmit((attempt) => {
        setRetryCount(attempt)
      })

      // نجح الإرسال
      setIsSubmitting(false)
      setSubmitError('')
      setLastSubmissionData(null)
      onSuccess?.(result)
      return true

    } catch (error: any) {
      setIsSubmitting(false)
      
      // تحديد نوع الخطأ وتسجيله
      const errorMessage = getErrorMessage(error)
      setSubmitError(errorMessage)
      
      // تسجيل الخطأ للمطورين
      logBookingError(error, {
        formData,
        services: services.filter(service => formData.selectedServices.includes(service.id)),
        networkQuality,
        retryCount
      })

      onError?.(errorMessage)
      return false
    }
  }, [isOnline, maxRetries, retryDelay, networkQuality, onSuccess, onError])

  // إعادة المحاولة
  const retrySubmission = useCallback(async (): Promise<boolean> => {
    if (!lastSubmissionData) {
      setSubmitError('لا توجد بيانات للإعادة')
      return false
    }

    // البحث عن الخدمات المطلوبة
    try {
      const response = await fetch('/api/services')
      const { data: services } = await response.json()
      
      return await submitBooking(lastSubmissionData, services)
    } catch (error) {
      logBookingError("Service data retrieval failed", {
        error: error.message,
        operation: "retrySubmission",
        formData: lastSubmissionData
      })
      setSubmitError('فشل في استرجاع بيانات الخدمات')
      return false
    
    }
  }, [lastSubmissionData, submitBooking])

  // إلغاء الإرسال
  const cancelSubmission = useCallback(() => {
    setIsSubmitting(false)
    setSubmitError('')
    setRetryCount(0)
    setLastSubmissionData(null)
  }, [])

  // مسح الخطأ
  const clearError = useCallback(() => {
    setSubmitError('')
  }, [])

  // فتح واتساب للتواصل المباشر
  const openWhatsApp = useCallback((formData: BookingFormData, services: Service[]) => {
    if (!enableWhatsAppFallback) return

    const selectedServicesData = services.filter(service => 
      formData.selectedServices.includes(service.id)
    )

    const message = formatWhatsAppMessage(formData, selectedServicesData)
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    
    // إصلاح window.open للـ SSR
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank')
    }
  }, [enableWhatsAppFallback])

  return {
    // State
    isSubmitting,
    submitError,
    retryCount,
    lastSubmissionData,

    // Actions
    submitBooking,
    retrySubmission,
    cancelSubmission,
    clearError,

    // WhatsApp fallback
    openWhatsApp,
    whatsappNumber: WHATSAPP_NUMBER,

    // Network status
    isOnline,
    networkQuality
  }
}

// تحديد رسالة الخطأ المناسبة
function getErrorMessage(error: any): string {
  if (!navigator.onLine) {
    return 'لا يوجد اتصال بالإنترنت. تحقق من الاتصال وحاول مرة أخرى'
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'مشكلة في الاتصال. تحقق من الإنترنت وحاول مرة أخرى'
  }

  if (error.message?.includes('400')) {
    return 'بيانات غير صحيحة. يرجى مراجعة المعلومات المدخلة'
  }

  if (error.message?.includes('409')) {
    return 'هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر'
  }

  if (error.message?.includes('500')) {
    return 'خطأ في النظام. يرجى المحاولة لاحقاً أو التواصل معنا'
  }

  return error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'
}

// Hook لمراقبة حالة الشبكة
export function useNetworkMonitor() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow'>('fast')

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // مراقبة سرعة الاتصال
    if ('connection' in navigator) {
      const connection = (navigator as any).connection

      if (connection) {
        const updateSpeed = () => {
          const { effectiveType, downlink } = connection
          setConnectionSpeed(
            effectiveType === '4g' && downlink > 1.5 ? 'fast' : 'slow'
          )
        }

        updateSpeed()
        connection.addEventListener('change', updateSpeed)

        return () => {
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
          connection.removeEventListener('change', updateSpeed)
        }
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, connectionSpeed }
}

