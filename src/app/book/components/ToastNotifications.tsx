// src/app/book/components/ToastNotifications.tsx
// نظام Toast Messages احترافي مع دعم الجوال

'use client'

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info, WifiOff } from 'lucide-react'

// Types
interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'network'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  allowDismiss?: boolean
  persistent?: boolean
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

// Context
const ToastContext = createContext<ToastContextValue | null>(null)

// Hook لاستخدام Toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      id,
      duration: 5000,
      allowDismiss: true,
      persistent: false,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration (unless persistent)
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
    </ToastContext.Provider>
  )
}

// Toast Container Component
interface ToastNotificationsProps {
  position?: 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxToasts?: number
  className?: string
}

export function ToastNotifications({
  position = 'top',
  maxToasts = 5,
  className = ''
}: ToastNotificationsProps) {
  const { toasts, removeToast } = useToast()

  // Limit number of visible toasts
  const visibleToasts = toasts.slice(-maxToasts)

  // Position classes
  const positionClasses = {
    'top': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  if (visibleToasts.length === 0) return null

  return (
    <div
      className={`fixed z-50 pointer-events-none ${positionClasses[position]} ${className}`}
      dir="rtl"
    >
      <div className="flex flex-col space-y-2 w-full max-w-sm">
        {visibleToasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
            index={index}
            isLastInStack={index === visibleToasts.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

// Individual Toast Component
interface ToastItemProps {
  toast: Toast
  onClose: () => void
  index: number
  isLastInStack: boolean
}

function ToastItem({ toast, onClose, index, isLastInStack }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Animation entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }, [onClose])

  // Auto-close on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isLastInStack) {
        handleClose()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose, isLastInStack])

  // Toast type configurations
  const toastConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    },
    network: {
      icon: WifiOff,
      bgColor: 'bg-gray-600',
      textColor: 'text-white',
      iconColor: 'text-white'
    }
  }

  const config = toastConfig[toast.type]
  const Icon = config.icon

  return (
    <div
      className={`
        pointer-events-auto transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-2 opacity-0 scale-95'
        }
        ${index > 0 ? `translate-y-${index * 2}` : ''}
      `}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`
          ${config.bgColor} ${config.textColor}
          rounded-lg shadow-lg p-4 max-w-sm w-full
          border border-white/10 backdrop-blur-sm
        `}
      >
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-sm opacity-90 mt-1">
                {toast.message}
              </p>
            )}

            {/* Action Button */}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm underline hover:no-underline transition-all duration-200"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Close Button */}
          {toast.allowDismiss && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
              aria-label="إغلاق الرسالة"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Utility hooks and functions
export function useNetworkToast() {
  const { addToast, removeToast } = useToast()
  const [networkToastId, setNetworkToastId] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true) // افتراضي true للـ SSR

  useEffect(() => {
    if (typeof window === 'undefined') return

    // تحديث القيمة الحقيقية بعد mount
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      
      // Remove offline toast
      if (networkToastId) {
        removeToast(networkToastId)
        setNetworkToastId(null)
      }

      // Show connection restored toast
      addToast({
        type: 'success',
        title: 'تم استعادة الاتصال',
        message: 'يمكنك الآن المتابعة',
        duration: 3000
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      
      // Show offline toast
      const toastId = addToast({
        type: 'network',
        title: 'لا يوجد اتصال بالإنترنت',
        message: 'تحقق من الاتصال للمتابعة',
        persistent: true,
        allowDismiss: false
      })
      
      setNetworkToastId(toastId)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [addToast, removeToast, networkToastId])

  return { isOnline }
}

// Quick toast functions
export function showBookingSuccess(customerName: string, date: string, time: string) {
  const { addToast } = useToast()
  
  addToast({
    type: 'success',
    title: 'تم تأكيد الحجز بنجاح! 🎉',
    message: `${customerName}, موعدك يوم ${date} الساعة ${time}`,
    duration: 8000
  })
}

export function showBookingError(
  message: string, 
  retryAction?: () => void,
  whatsappAction?: () => void
) {
  const { addToast } = useToast()
  
  if (retryAction) {
    addToast({
      type: 'error',
      title: 'فشل في الحجز',
      message,
      action: {
        label: 'إعادة المحاولة',
        onClick: retryAction
      },
      duration: 10000
    })
  } else if (whatsappAction) {
    addToast({
      type: 'error',
      title: 'فشل في الحجز',
      message: `${message}. يمكنك التواصل معنا مباشرة`,
      action: {
        label: 'واتساب 💬',
        onClick: whatsappAction
      },
      duration: 15000
    })
  } else {
    addToast({
      type: 'error',
      title: 'خطأ',
      message,
      duration: 6000
    })
  }
}

export function showValidationError(field: string, message: string) {
  const { addToast } = useToast()
  
  addToast({
    type: 'warning',
    title: `خطأ في ${field}`,
    message,
    duration: 4000
  })
}

export function showInfoToast(title: string, message?: string) {
  const { addToast } = useToast()
  
  addToast({
    type: 'info',
    title,
    message,
    duration: 5000
  })
}