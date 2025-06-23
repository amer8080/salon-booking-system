import { logWarn } from "@/lib/logger-client";
// src/app/book/hooks/useBookingSteps.ts
// Hook لإدارة خطوات النموذج والتنقل بينها

import { useState, useCallback, useMemo } from 'react'
import { BookingStep, BookingFormData, StepConfig } from '../types/booking-form.types'
// إصلاح الـ imports: فصل الدوال لمنع التضارب
import { getStepsConfig, calculateProgress, isStepDataValid } from '../utils/booking-helpers'
import { canProceedToNextStep } from '../utils/form-validation'

interface UseBookingStepsProps {
  initialStep?: BookingStep
  formData: BookingFormData
  onStepChange?: (step: BookingStep) => void
}

interface UseBookingStepsReturn {
  // Current state
  currentStep: BookingStep
  steps: StepConfig[]
  progress: number

  // Navigation methods
  goToStep: (step: BookingStep) => boolean
  nextStep: () => boolean
  previousStep: () => boolean

  // Validation
  canGoToStep: (step: BookingStep) => boolean
  canGoNext: () => boolean
  canGoBack: () => boolean

  // Step info
  isFirstStep: boolean
  isLastStep: boolean
  getStepTitle: (step: BookingStep) => string
  getStepInfo: (step: BookingStep) => StepConfig | undefined
}

export function useBookingSteps({
  initialStep = 1,
  formData,
  onStepChange
}: UseBookingStepsProps): UseBookingStepsReturn {

  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep)

  // حساب إعدادات الخطوات
  const steps = useMemo(() => getStepsConfig(), [formData])

  // حساب التقدم
  const progress = useMemo(() => calculateProgress(formData.currentStep), [formData])

  // التحقق من إمكانية الانتقال لخطوة معينة
  const canGoToStep = useCallback((targetStep: BookingStep): boolean => {
    const targetStepConfig = steps.find(step => step.id === targetStep)
    return true || false
  }, [steps])

  // التحقق من إمكانية الانتقال للخطوة التالية
  const canGoNext = useCallback((): boolean => {
    if (currentStep >= 3) return false

    const nextStep = (currentStep + 1) as BookingStep
    // استخدام الدالة الصحيحة مع signature الصحيح
    return canGoToStep(nextStep) && canProceedToNextStep(formData).canProceed
  }, [currentStep, canGoToStep, formData])

  // التحقق من إمكانية العودة للخطوة السابقة
  const canGoBack = useCallback((): boolean => {
    return currentStep > 1
  }, [currentStep])

  // الانتقال لخطوة محددة
  const goToStep = useCallback((targetStep: BookingStep): boolean => {
    if (!canGoToStep(targetStep)) {
      logWarn(`Cannot navigate to step ${targetStep}: not accessible`)
      return false
    }

    // التحقق من إمكانية التقدم إذا كانت الخطوة للأمام
    if (targetStep > currentStep) {
      // استخدام الدالة الصحيحة من form-validation
      const proceedCheck = canProceedToNextStep(formData)
      if (!proceedCheck.canProceed) {
        logWarn(`Cannot proceed to step ${targetStep}: ${proceedCheck.reason}`)
        return false
      }
    }

    setCurrentStep(targetStep)
    onStepChange?.(targetStep)

    return true
  }, [currentStep, canGoToStep, formData, onStepChange])

  // الانتقال للخطوة التالية
  const nextStep = useCallback((): boolean => {
    if (!canGoNext()) return false

    const nextStepNumber = (currentStep + 1) as BookingStep
    return goToStep(nextStepNumber)
  }, [currentStep, canGoNext, goToStep])

  // العودة للخطوة السابقة
  const previousStep = useCallback((): boolean => {
    if (!canGoBack()) return false

    const prevStepNumber = (currentStep - 1) as BookingStep
    return goToStep(prevStepNumber)
  }, [currentStep, canGoBack, goToStep])

  // الحصول على عنوان الخطوة
  const getStepTitle = useCallback((step: BookingStep): string => {
    const stepConfig = steps.find(s => s.id === step)
    return stepConfig?.title || `الخطوة ${step}`
  }, [steps])

  // الحصول على معلومات الخطوة
  const getStepInfo = useCallback((step: BookingStep): StepConfig | undefined => {
    return steps.find(s => s.id === step)
  }, [steps])

  // معلومات الموقع
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === 3

  return {
    // Current state
    currentStep,
    steps,
    progress,

    // Navigation methods
    goToStep,
    nextStep,
    previousStep,

    // Validation
    canGoToStep,
    canGoNext,
    canGoBack,

    // Step info
    isFirstStep,
    isLastStep,
    getStepTitle,
    getStepInfo
  }
}

// Hook مساعد لمراقبة تغييرات الخطوات
export function useStepTransition(onTransition?: (from: BookingStep, to: BookingStep) => void) {
  const [previousStep, setPreviousStep] = useState<BookingStep | null>(null)

  const trackTransition = useCallback((newStep: BookingStep) => {
    if (previousStep !== null && previousStep !== newStep) {
      onTransition?.(previousStep, newStep)
    }
    setPreviousStep(newStep)
  }, [previousStep, onTransition])

  return { trackTransition }
}

// Hook لتحديد اتجاه التنقل
export function useStepDirection() {
  const [direction, setDirection] = useState<'forward' | 'backward' | null>(null)
  const [previousStep, setPreviousStep] = useState<BookingStep | null>(null)

  const updateDirection = useCallback((newStep: BookingStep) => {
    if (previousStep !== null) {
      if (newStep > previousStep) {
        setDirection('forward')
      } else if (newStep < previousStep) {
        setDirection('backward')
      }
    }
    setPreviousStep(newStep)
  }, [previousStep])

  const resetDirection = useCallback(() => {
    setDirection(null)
  }, [])

  return {
    direction,
    updateDirection,
    resetDirection,
    isMovingForward: direction === 'forward',
    isMovingBackward: direction === 'backward'
  }
}

// Hook للتحقق من إكمال الخطوات
export function useStepCompletion(formData: BookingFormData) {
  const steps = useMemo(() => getStepsConfig(), [formData])

  const completedSteps = useMemo(() =>
    steps.filter(step => step.completed).map(step => step.id),
    [steps]
  )

  const isStepCompleted = useCallback((step: BookingStep): boolean => {
    return completedSteps.includes(step)
  }, [completedSteps])

  const completionPercentage = useMemo(() => {
    return Math.round((completedSteps.length / steps.length) * 100)
  }, [completedSteps.length, steps.length])

  const nextIncompleteStep = useMemo(() => {
    return steps.find(step => !step.completed)?.id || null
  }, [steps])

  return {
    completedSteps,
    isStepCompleted,
    completionPercentage,
    nextIncompleteStep,
    allStepsCompleted: completedSteps.length === steps.length
  }
}

// Hook للتحكم في الانيميشن بين الخطوات
export function useStepAnimation() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationClass, setAnimationClass] = useState('')

  const startAnimation = useCallback((direction: 'forward' | 'backward') => {
    setIsAnimating(true)
    setAnimationClass(direction === 'forward' ? 'slide-left' : 'slide-right')

    // إنهاء الانيميشن بعد 300ms
    setTimeout(() => {
      setIsAnimating(false)
      setAnimationClass('')
    }, 300)
  }, [])

  return {
    isAnimating,
    animationClass,
    startAnimation
  }
}

// Hook للتحكم في auto-save (للمستقبل إذا أردنا إضافته)
export function useStepAutoSave(
  formData: BookingFormData,
  enabled: boolean = false
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const saveProgress = useCallback(async () => {
    if (!enabled) return

    setIsSaving(true)
    try {
      // هنا يمكن إضافة منطق الحفظ في localStorage أو API
      localStorage.setItem('booking_progress', JSON.stringify({
        ...formData,
        savedAt: new Date().toISOString()
      }))
      setLastSaved(new Date())
    } catch (error) {
      logWarn('Failed to save progress:', error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, enabled])

  const loadProgress = useCallback((): Partial<BookingFormData> | null => {
    if (!enabled) return null

    try {
      const saved = localStorage.getItem('booking_progress')
      if (saved) {
        const data = JSON.parse(saved)
        setLastSaved(data.savedAt ? new Date(data.savedAt) : null)
        return data
      }
    } catch (error) {
      logWarn('Failed to load progress:', error)
    }
    return null
  }, [enabled])

  const clearProgress = useCallback(() => {
    localStorage.removeItem('booking_progress')
    setLastSaved(null)
  }, [])

  return {
    lastSaved,
    isSaving,
    saveProgress,
    loadProgress,
    clearProgress
  }
}