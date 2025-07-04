// src/app/book/page.tsx
// Hybrid Approach: البساطة + التنظيم + SaaS Ready

'use client';
import { logError } from '@/lib/logger-client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { BookingStep } from './types/booking-form.types';

// ✅ Hooks للمنطق المنظم
import { usePhoneVerification } from './hooks/usePhoneVerification';
import { useServices } from './hooks/useServices';
import { useBookingSubmit } from './hooks/useBookingSubmit';

// ✅ Components منظمة
import {
  BookingStepIndicator,
  PhoneVerificationStep,
  BookingSelectionStep,
  BookingConfirmationStep,
  ToastNotifications,
  ToastProvider,
  useToast,
  useNetworkToast,
} from './components';

// ✅ Utils منظمة
import { validateBookingForm } from './utils/form-validation';
import { resetFormData, getStepsConfig, calculateProgress } from './utils/booking-helpers';

// ✅ Types منظمة
import { BookingFormData } from './types/booking-form.types';

// المكون الداخلي للصفحة
function BookPageContent() {
  // ✅ STATE البسيط (مثل النسخة القديمة)
  const [currentStep, setCurrentStep] = useState(1);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>(resetFormData());

  // ✅ Toast hooks منظمة
  const { addToast } = useToast();
  useNetworkToast();

  // ✅ Phone verification مع الحل البسيط
  const phoneVerification = usePhoneVerification({
    onVerificationSuccess: (customerData) => {
      // ✅ الحل البسيط: تحديث مباشر وفوري
      setIsPhoneVerified(true);
      setCurrentStep(2); // ← مباشر مثل النسخة القديمة!

      addToast({
        type: 'success',
        title: 'تم التحقق بنجاح! ✅',
        message: `مرحباً ${customerData.customerName}`,
        duration: 3000,
      });
    },
    onError: async (error) => {
      addToast({
        type: 'error',
        title: 'فشل في التحقق من الهاتف',
        message: error,
        action: {
          label: 'إعادة المحاولة',
          onClick: () => phoneVerification.sendOTP(),
        },
      });
    },
  });

  // ✅ Services management منظم
  const servicesHook = useServices({
    autoLoad: true,
    onError: async (error) => {
      await logError('Services error:', error);
      addToast({
        type: 'error',
        title: 'خطأ في تحميل الخدمات',
        message: 'يرجى إعادة تحميل الصفحة',
      });
    },
  });

  // ✅ Booking submission منظم
  const bookingSubmit = useBookingSubmit({
    onSuccess: (response) => {
      addToast({
        type: 'success',
        title: 'تم تأكيد الحجز بنجاح! 🎉',
        message: `${response.data.customerName}, موعدك يوم ${response.data.appointmentDate} الساعة ${response.data.startTime}`,
        duration: 8000,
      });

      // Reset form
      setFormData(resetFormData());
      setIsPhoneVerified(false);
      setCurrentStep(1);
      phoneVerification.reset();
      servicesHook.clearSelection();
    },
    onError: async (error) => {
      addToast({
        type: 'error',
        title: 'فشل في إرسال الحجز',
        message: error,
        action: {
          label: 'إعادة المحاولة',
          onClick: () => bookingSubmit.retrySubmission(),
        },
        duration: 10000,
      });
    },
  });

  // ✅ Step configuration منظم
  const steps = getStepsConfig();
  const progress = calculateProgress(currentStep, steps.length);

  // ✅ Navigation functions بسيطة
  const goToStep = (step: number) => {
    if (step === 1) {
      setCurrentStep(1);
      return true;
    }
    if (step === 2 && isPhoneVerified) {
      setCurrentStep(2);
      return true;
    }
    if (
      step === 3 &&
      isPhoneVerified &&
      formData.selectedDate &&
      formData.selectedTime &&
      servicesHook.selectedServices.length > 0
    ) {
      setCurrentStep(3);
      return true;
    }
    return false;
  };

  const nextStep = () => {
    if (currentStep < 3) {
      return goToStep(currentStep + 1);
    }
    return false;
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      return true;
    }
    return false;
  };

  // ✅ Get current form data منظم
  const getCurrentFormData = (): BookingFormData => ({
    ...formData,
    phoneNumber: phoneVerification.state.phoneNumber,
    customerName: phoneVerification.state.customerName,
    otpCode: phoneVerification.state.otpCode,
    isPhoneVerified: isPhoneVerified, // ← من الـ state البسيط
    isOtpSent: phoneVerification.state.isOtpSent,
    isSubmitting: bookingSubmit.isSubmitting,
    selectedServices: servicesHook.selectedServices,
    currentStep: currentStep, // ← من الـ state البسيط
  });

  // ✅ Handle form field updates
  const updateFormField = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Handle final booking submission
  const handleBookingSubmit = async () => {
    const currentData = getCurrentFormData();
    const validation = validateBookingForm(currentData);

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      addToast({
        type: 'error',
        title: 'خطأ في البيانات',
        message: firstError || 'يرجى مراجعة البيانات',
      });
      return;
    }

    await bookingSubmit.submitBooking(currentData, servicesHook.state.services);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">صالون ريم</span>
            </Link>
            <button className="text-gray-600 hover:text-gray-800 transition-colors">العربية</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">احجزي موعدك الآن</h1>
          <p className="text-lg text-gray-600">اتبعي الخطوات لإكمال حجزك بسهولة</p>
        </div>

        {/* ✅ Step Indicator منظم */}
        <BookingStepIndicator
          steps={steps.map((step) => ({
            ...step,
            completed:
              step.id < currentStep ||
              (step.id === 1 && isPhoneVerified) ||
              (step.id === 2 &&
                formData.selectedDate &&
                formData.selectedTime &&
                servicesHook.selectedServices.length > 0),
            accessible: true,
          }))}
          currentStep={currentStep as BookingStep}
          progress={progress}
          onStepClick={goToStep}
          className="mb-8"
        />

        {/* Main Form Container */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          {/* ✅ Step 1: Phone Verification */}
          {currentStep === 1 && (
            <PhoneVerificationStep
              state={phoneVerification.state}
              onSendOTP={phoneVerification.sendOTP}
              onVerifyOTP={phoneVerification.verifyOTP}
              onPhoneChange={phoneVerification.updatePhoneNumber}
              onNameChange={phoneVerification.updateCustomerName}
              onOTPChange={phoneVerification.updateOTPCode}
              onBack={previousStep}
              errors={{
                phoneNumber: phoneVerification.errors.phoneNumber,
                customerName: phoneVerification.errors.customerName,
                otpCode: phoneVerification.errors.otpCode,
              }}
            />
          )}

          {/* ✅ Step 2: Booking Selection */}
          {currentStep === 2 && (
            <BookingSelectionStep
              selectionState={{
                selectedServices: servicesHook.selectedServices,
                selectedDate: formData.selectedDate,
                selectedTime: formData.selectedTime,
                availableTimeSlots: [],
                blockedDays: [],
                timeSlotsLoading: false,
                timeSlotsError: '',
              }}
              servicesState={servicesHook.state}
              onServiceToggle={servicesHook.toggleService}
              onDateSelect={(date) => updateFormField('selectedDate', date)}
              onTimeSelect={(time) => updateFormField('selectedTime', time)}
              onBack={previousStep}
              onNext={nextStep}
              errors={{}}
            />
          )}

          {/* ✅ Step 3: Confirmation */}
          {currentStep === 3 && (
            <BookingConfirmationStep
              formData={getCurrentFormData()}
              services={servicesHook.state.services}
              onConfirm={handleBookingSubmit}
              onBack={previousStep}
              onEdit={goToStep}
              isSubmitting={bookingSubmit.isSubmitting}
              errors={{ general: bookingSubmit.submitError }}
            />
          )}
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors duration-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastNotifications position="top" />
    </div>
  );
}

// ✅ المكون الرئيسي مع ToastProvider
export default function BookPage() {
  return (
    <ToastProvider>
      <BookPageContent />
    </ToastProvider>
  );
}
