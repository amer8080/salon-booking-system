// src/app/book/components/BookingStepIndicator.tsx
// مؤشر الخطوات المرئي والتفاعلي

import React from 'react'
import { StepConfig, BookingStep } from '../types/booking-form.types'

interface BookingStepIndicatorProps {
  steps: StepConfig[]
  currentStep: BookingStep
  progress: number
  onStepClick?: (step: BookingStep) => void
  className?: string
}

export default function BookingStepIndicator({
  steps,
  currentStep,
  progress,
  onStepClick,
  className = ''
}: BookingStepIndicatorProps) {

  const handleStepClick = (step: StepConfig) => {
    if (step.accessible && onStepClick) {
      onStepClick(step.id)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar Background */}
      <div className="relative mb-8">
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
        <div 
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 -z-10 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>

        {/* Steps Container */}
        <div className="flex items-center justify-between relative">
          {steps.map((step, _index) => {
            const isActive = currentStep >= step.id
            const isCurrent = currentStep === step.id
            const isCompleted = step.completed
            const isAccessible = step.accessible
            const IconComponent = step.icon

            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center relative group"
              >
                {/* Step Circle */}
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={!isAccessible}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white scale-110 shadow-lg' 
                      : isActive 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white scale-105 shadow-md'
                        : isAccessible
                          ? 'bg-white border-gray-300 text-gray-400 hover:border-purple-300 hover:text-purple-500'
                          : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                    }
                    ${isCurrent ? 'ring-4 ring-purple-200 ring-opacity-50' : ''}
                    ${isAccessible && !isCompleted ? 'hover:scale-105' : ''}
                  `}
                  aria-label={`${step.title} - ${isCompleted ? 'مكتمل' : isActive ? 'نشط' : 'غير متاح'}`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <IconComponent className="w-6 h-6" />
                  )}
                </button>

                {/* Step Label */}
                <span 
                  className={`
                    mt-3 text-sm text-center font-medium transition-colors duration-300 max-w-24
                    ${isActive 
                      ? 'text-gray-800' 
                      : isAccessible 
                        ? 'text-gray-600 group-hover:text-gray-800' 
                        : 'text-gray-400'
                    }
                  `}
                >
                  {step.title}
                </span>

                {/* Active Step Indicator */}
                {isCurrent && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  </div>
                )}

                {/* Accessibility indicator for screen readers */}
                <span className="sr-only">
                  {isCompleted ? 'مكتمل' : isActive ? 'الخطوة الحالية' : isAccessible ? 'متاح' : 'غير متاح'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile Progress Text */}
      <div className="text-center md:hidden">
        <p className="text-sm text-gray-600">
          الخطوة {currentStep} من {steps.length}: {steps.find(s => s.id === currentStep)?.title}
        </p>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Progress Percentage (Desktop) */}
      <div className="text-center hidden md:block">
        <p className="text-xs text-gray-500">
          {progress}% مكتمل
        </p>
      </div>
    </div>
  )
}

// Compact version for mobile
export function CompactStepIndicator({
  steps,
  currentStep,
  progress,
  className = ''
}: Omit<BookingStepIndicatorProps, 'onStepClick'>) {
  const currentStepData = steps.find(s => s.id === currentStep)
  const IconComponent = currentStepData?.icon

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center">
            {IconComponent && <IconComponent className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {currentStepData?.title}
            </p>
            <p className="text-xs text-gray-500">
              الخطوة {currentStep} من {steps.length}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-purple-600">
            {progress}%
          </p>
        </div>
      </div>
      
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

// Animated step transition component
export function StepTransition({
  children,
  currentStep,
  direction = 'forward'
}: {
  children: React.ReactNode
  currentStep: BookingStep
  direction?: 'forward' | 'backward'
}) {
  return (
    <div 
      key={currentStep}
      className={`
        transition-all duration-300 ease-in-out
        ${direction === 'forward' 
          ? 'animate-slide-in-right' 
          : 'animate-slide-in-left'
        }
      `}
    >
      {children}
    </div>
  )
}

// Step summary component for confirmation
export function StepSummary({
  steps,
  currentStep,
  className = ''
}: {
  steps: StepConfig[]
  currentStep: BookingStep
  className?: string
}) {
  const completedSteps = steps.filter(step => step.completed)
  
  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-800 mb-3">ملخص التقدم</h3>
      <div className="space-y-2">
        {steps.map((step) => {
          const IconComponent = step.icon
          return (
            <div 
              key={step.id}
              className={`flex items-center space-x-2 rtl:space-x-reverse text-sm ${
                step.completed 
                  ? 'text-green-600' 
                  : currentStep === step.id 
                    ? 'text-purple-600 font-medium' 
                    : 'text-gray-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-100' 
                  : currentStep === step.id 
                    ? 'bg-purple-100' 
                    : 'bg-gray-100'
              }`}>
                {step.completed ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <IconComponent className="w-3 h-3" />
                )}
              </div>
              <span>{step.title}</span>
            </div>
          )
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {completedSteps.length} من {steps.length} خطوات مكتملة
        </p>
      </div>
    </div>
  )
}