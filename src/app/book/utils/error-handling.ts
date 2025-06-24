import { logError } from "@/lib/logger-client";
// src/app/book/utils/error-handling.ts
// نظام معالجة الأخطاء الذكي مع retry logic

import React from 'react'
import { BookingFormData } from '../types/booking-form.types'
import { Service } from '../types/booking-form.types'

// أنواع الأخطاء المختلفة
export enum ErrorType {
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  SERVER_ERROR = 'server_error',
  TIMEOUT_ERROR = 'timeout_error',
  BOOKING_CONFLICT = 'booking_conflict',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN_ERROR = 'unknown_error'
}

// واجهة معلومات الخطأ
export interface ErrorInfo {
  type: ErrorType
  message: string
  arabicMessage: string
  canRetry: boolean
  retryAfter?: number
  suggestedAction?: string
  technicalDetails?: any
}

// واجهة سياق الخطأ
export interface ErrorContext {
  formData?: BookingFormData
  services?: Service[]
  networkQuality?: 'fast' | 'slow' | 'offline'
  retryCount?: number
  timestamp?: number
  userAgent?: string
  url?: string
  stackTrace?: string
}

// معالج الأخطاء الرئيسي
export function handleBookingError(error: any, _context?: ErrorContext): ErrorInfo {
  const errorInfo = analyzeError(error)

  // تسجيل الخطأ للمطورين
  logBookingError(error, _context)

  return errorInfo
}

// تحليل نوع الخطأ
function analyzeError(error: any): ErrorInfo {
  // Network errors - إصلاح navigator للـ SSR
  const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false

  if (isOffline || error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Network connection failed',
      arabicMessage: 'لا يوجد اتصال بالإنترنت. تحقق من الاتصال وحاول مرة أخرى',
      canRetry: true,
      suggestedAction: 'تحقق من اتصال الإنترنت'
    }
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return {
      type: ErrorType.TIMEOUT_ERROR,
      message: 'Request timeout',
      arabicMessage: 'انتهت مهلة الاتصال. حاول مرة أخرى',
      canRetry: true,
      retryAfter: 3000,
      suggestedAction: 'انتظر قليلاً ثم حاول مرة أخرى'
    }
  }

  // HTTP status codes
  const statusCode = error.status || (error.message?.match(/\d{3}/) ? parseInt(error.message.match(/\d{3}/)[0]) : null)

  if (statusCode) {
    switch (statusCode) {
      case 400:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: 'Invalid request data',
          arabicMessage: 'بيانات غير صحيحة. يرجى مراجعة المعلومات المدخلة',
          canRetry: false,
          suggestedAction: 'راجع البيانات المدخلة'
        }

      case 409:
        return {
          type: ErrorType.BOOKING_CONFLICT,
          message: 'Booking conflict',
          arabicMessage: 'هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر',
          canRetry: false,
          suggestedAction: 'اختر موعد آخر'
        }

      case 429:
        return {
          type: ErrorType.RATE_LIMIT,
          message: 'Too many requests',
          arabicMessage: 'عدد كبير من المحاولات. انتظر قليلاً ثم حاول مرة أخرى',
          canRetry: true,
          retryAfter: 60000,
          suggestedAction: 'انتظر دقيقة واحدة'
        }

      case 500:
      case 502:
      case 503:
        return {
          type: ErrorType.SERVER_ERROR,
          message: 'Server error',
          arabicMessage: 'خطأ في النظام. يرجى المحاولة لاحقاً أو التواصل معنا',
          canRetry: true,
          retryAfter: 5000,
          suggestedAction: 'حاول مرة أخرى أو تواصل معنا'
        }

      default:
        return {
          type: ErrorType.UNKNOWN_ERROR,
          message: `HTTP ${statusCode}`,
          arabicMessage: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى',
          canRetry: true,
          suggestedAction: 'حاول مرة أخرى'
        }
    }
  }

  // JavaScript errors
  if (error instanceof TypeError) {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: 'Data validation error',
      arabicMessage: 'خطأ في البيانات. يرجى التحقق من المعلومات',
      canRetry: false,
      suggestedAction: 'تحقق من البيانات المدخلة'
    }
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: error.message || 'Unknown error',
    arabicMessage: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى',
    canRetry: true,
    suggestedAction: 'حاول مرة أخرى'
  }
}

// تسجيل الأخطاء
export function logBookingError(error: any, _context?: ErrorContext) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    _context: {
      ..._context,
      // إصلاح userAgent للـ SSR
      userAgent: (typeof window !== 'undefined' && _context?.userAgent) ||
                 (typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR'),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : { width: 0, height: 0 }
    }
  }

  // تسجيل في console للتطوير
  if (process.env.NODE_ENV === 'development') {
    logError('Error:', error)
  }

  // إرسال إلى logging service في الإنتاج
  if (process.env.NODE_ENV === 'production') {
    // يمكن إضافة خدمة logging هنا مثل Sentry أو LogRocket
    try {
      // Example: window.gtag?.('event', 'exception', { description: error.message })
    } catch (loggingError) {
      logWarn('Failed to log error to external service:', loggingError)
    }
  }
}

// إنشاء retry function مع backoff
export function createRetryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  backoffMultiplier: number = 2
): (onRetry?: (attempt: number) => void) => Promise<T> {
  return async (onRetry?: (attempt: number) => void): Promise<T> => {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error

        // إذا كانت المحاولة الأخيرة، ارفع الخطأ
        if (attempt > maxRetries) {
          throw error
        }

        // تحقق من إمكانية إعادة المحاولة
        const errorInfo = analyzeError(error)
        if (!errorInfo.canRetry) {
          throw error
        }

        // تحديد المهلة الزمنية
        const delay = errorInfo.retryAfter || (baseDelay * Math.pow(backoffMultiplier, attempt - 1))

        // إشعار المستدعي بالمحاولة
        onRetry?.(attempt)

        // انتظار قبل إعادة المحاولة
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }
}

// ✅ إضافة executeWithRetry المفقود - دالة بسيطة
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // إذا كانت المحاولة الأخيرة، ارفع الخطأ
      if (attempt > maxRetries) {
        throw error
      }

      // تحقق من إمكانية إعادة المحاولة
      const errorInfo = analyzeError(error)
      if (!errorInfo.canRetry) {
        throw error
      }

      // انتظار قبل إعادة المحاولة
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// ✅ إضافة createErrorToast المفقود - دالة بسيطة
export function createErrorToast(error: any, _context?: ErrorContext): {
  type: 'error'
  message: string
  duration: number
} {
  const errorInfo = analyzeError(error)
  
  return {
    type: 'error',
    message: errorInfo.arabicMessage,
    duration: 5000
  }
}

// ✅ إضافة handleServicesError المفقود - دالة بسيطة
export function handleServicesError(error: any): ErrorInfo {
  const errorInfo = analyzeError(error)
  
  // تسجيل خطأ الخدمات
  logBookingError(error, {
    timestamp: Date.now(),
    networkQuality: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'fast'
  })

  return errorInfo
}

// إنشاء timeout wrapper
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  timeoutMessage: string = 'Request timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutMessage))
      }, timeoutMs)
    })
  ])
}

// معلومات Error Boundary (للاستخدام في مكونات tsx منفصلة)
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: (error: Error) => any
  onError?: (error: Error, errorInfo: any) => void
}

// دالة مساعدة لإنشاء Error Boundary
export function createErrorBoundaryConfig(
  onError?: (error: Error, errorInfo: any) => void
) {
  return {
    getDerivedStateFromError: (error: Error): ErrorBoundaryState => {
      return { hasError: true, error }
    },

    componentDidCatch: (error: Error, errorInfo: any) => {
      logBookingError(error, {
        stackTrace: errorInfo.componentStack,
        timestamp: Date.now()
      })

      onError?.(error, errorInfo)
    }
  }
}

// Hook لمعالجة الأخطاء في المكونات
export function useErrorHandler() {
  const handleError = (error: any, _context?: Partial<ErrorContext>) => {
    const errorInfo = handleBookingError(error, {
      timestamp: Date.now(),
      ..._context
    })

    return errorInfo
  }

  return { handleError }
}

// تحديد أولوية الأخطاء
export function categorizeErrorSeverity(errorType: ErrorType): 'low' | 'medium' | 'high' | 'critical' {
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
    case ErrorType.TIMEOUT_ERROR:
      return 'medium'

    case ErrorType.VALIDATION_ERROR:
      return 'low'

    case ErrorType.BOOKING_CONFLICT:
      return 'high'

    case ErrorType.SERVER_ERROR:
    case ErrorType.RATE_LIMIT:
      return 'high'

    case ErrorType.UNKNOWN_ERROR:
      return 'critical'

    default:
      return 'medium'
  }
}

// إنشاء رسالة خطأ للمستخدم
export function createUserFriendlyErrorMessage(error: any, _context?: ErrorContext): string {
  const errorInfo = analyzeError(error)

  // إضافة معلومات السياق إذا كانت مفيدة
  let message = errorInfo.arabicMessage

  if (_context?.retryCount && _context.retryCount > 0) {
    message += ` (المحاولة ${_context.retryCount})`
  }

  if (errorInfo.suggestedAction) {
    message += `\n💡 ${errorInfo.suggestedAction}`
  }

  return message
}
