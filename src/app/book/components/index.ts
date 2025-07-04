// src/app/book/components/index.ts
// تصدير مركزي صحيح - يعيد تصدير الدوال الحقيقية

// ===== COMPONENT EXPORTS =====
export { default as BookingStepIndicator } from './BookingStepIndicator';
export { default as PhoneVerificationStep } from './PhoneVerificationStep';
export { default as BookingSelectionStep } from './BookingSelectionStep';
export { default as BookingConfirmationStep } from './BookingConfirmationStep';
export { default as BookingCalendar } from './BookingCalendar';
export { default as ServicesList } from './ServicesList';
export { default as TimeSlotsPicker } from './TimeSlotsPicker';

// ===== TOAST SYSTEM - إعادة تصدير الدوال الحقيقية =====
export {
  ToastNotifications,
  ToastProvider,
  useToast,
  useNetworkToast,
  showBookingSuccess,
  showBookingError,
  showValidationError,
  showInfoToast,
} from './ToastNotifications';

// ===== SAFE ALIASES =====
export { showBookingError as showError } from './ToastNotifications';
export { showBookingSuccess as showSuccess } from './ToastNotifications';
export { showInfoToast as showToast } from './ToastNotifications';
export { showInfoToast as showInfo } from './ToastNotifications';
export { showValidationError as showWarning } from './ToastNotifications';
export { showInfoToast as showLoadingToast } from './ToastNotifications';
export { showBookingError as showRetryToast } from './ToastNotifications';

// ===== SIMPLE PLACEHOLDERS =====
export const hideToast = () => {};
export const clearAllToasts = () => {};
export { useToast as useToastProvider } from './ToastNotifications';

// ===== COMPONENT ALIASES =====
export { default as OTPDigitInput } from './PhoneVerificationStep';
