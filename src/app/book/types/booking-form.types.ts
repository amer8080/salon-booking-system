// src/app/book/types/booking-form.types.ts
// تعريفات الأنواع الأساسية لنموذج الحجز

export interface Service {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  nameTr: string;
  category: string;
  price: number;
  duration: number;
  description?: string;
}

export interface BookingFormData {
  // بيانات العميل
  phoneNumber: string;
  customerName: string;
  otpCode: string;

  // بيانات الحجز
  selectedServices: string[];
  selectedDate: string;
  selectedTime: string;

  // حالة النموذج
  currentStep: number;
  isPhoneVerified: boolean;
  isOtpSent: boolean;
  isSubmitting: boolean;
}

// 🔧 إصلاح 1: إضافة isSendingOtp المفقود
export interface PhoneVerificationState {
  phoneNumber: string;
  customerName: string;
  otpCode: string;
  isOtpSent: boolean;
  isPhoneVerified: boolean;
  isVerifying: boolean;
  isSendingOtp?: boolean; // ← إضافة المفقود
}

export interface BookingSelectionState {
  selectedServices: string[];
  selectedDate: string;
  selectedTime: string;
  availableTimeSlots: string[];
  blockedDays: string[];
  timeSlotsLoading: boolean;
  timeSlotsError: string;
}

// 🔧 إصلاح 2: إضافة loading و error المفقودة
export interface ServicesState {
  services: Service[];
  servicesLoading: boolean;
  servicesError: string;
  loading?: boolean; // ← إضافة المفقود
  error?: string; // ← إضافة المفقود
}

export interface BookingStepsState {
  currentStep: number;
  completedSteps: number[];
  canProceedToNext: boolean;
  canGoBack: boolean;
}

export type BookingStep = 1 | 2 | 3;

// 🔧 إصلاح 3: جعل accessible optional
export interface StepConfig {
  id: BookingStep;
  title: string;
  icon: any; // Lucide icon component
  completed: boolean;
  accessible?: boolean; // ← تغيير من required إلى optional
}

// 🔧 إصلاح 4: تحسين FormValidationErrors لدعم undefined
export interface FormValidationErrors {
  phoneNumber?: string | undefined;
  customerName?: string | undefined;
  otpCode?: string | undefined;
  selectedServices?: string | undefined;
  selectedDate?: string | undefined;
  selectedTime?: string | undefined;
  general?: string | undefined;
}

export interface BookingFormProps {
  initialData?: Partial<BookingFormData>;
  onStepChange?: (step: number) => void;
  onBookingComplete?: (bookingData: BookingFormData) => void;
  onError?: (error: string) => void;
}

// Union types for better type safety
export type BookingStatus =
  | 'draft'
  | 'phone-verification'
  | 'selecting'
  | 'confirming'
  | 'submitting'
  | 'completed'
  | 'failed';
export type ValidationResult = { isValid: boolean; errors: FormValidationErrors };
export type StepNavigationDirection = 'next' | 'previous' | 'jump';

// 🔧 إصلاح 5: تحسين Props interfaces للمكونات
export interface PhoneVerificationStepProps {
  state: PhoneVerificationState;
  onSendOTP: () => Promise<boolean>; // ← إصلاح return type
  onVerifyOTP: () => Promise<boolean>; // ← إصلاح return type
  onPhoneChange: (phone: string) => void;
  onNameChange: (name: string) => void;
  onOTPChange: (otp: string) => void;
  onBack: () => void;
  errors: {
    phoneNumber?: string | undefined;
    customerName?: string | undefined;
    otpCode?: string | undefined;
  };
}

export interface BookingSelectionStepProps {
  selectionState: BookingSelectionState;
  servicesState: ServicesState;
  onServiceToggle: (serviceId: string) => void;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
  onNext: () => void;
  errors: FormValidationErrors;
}

export interface BookingConfirmationStepProps {
  formData: BookingFormData;
  services: Service[];
  onConfirm: () => void;
  onBack: () => void;
  onEdit: (step: BookingStep) => void;
  isSubmitting: boolean;
  errors: FormValidationErrors;
}
