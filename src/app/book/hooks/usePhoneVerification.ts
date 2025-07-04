﻿import { logError } from '@/lib/logger-client';
// src/app/book/hooks/usePhoneVerification.ts
// Hook لإدارة التحقق من رقم الهاتف و OTP

import { useCallback, useState, useRef, useEffect } from 'react';
import { PhoneVerificationState, FormValidationErrors } from '../types/booking-form.types';
import {
  validateTurkishPhone,
  validateCustomerName,
  validateOTPCode,
  formatPhoneForDisplay,
  normalizePhoneForAPI,
} from '../utils/form-validation';
import { executeWithRetry } from '../utils/error-handling';

interface UsePhoneVerificationProps {
  onVerificationSuccess?: (customerData: any) => void;
  onError?: (error: any) => void;
  autoResendDelay?: number; // seconds
}

interface UsePhoneVerificationReturn {
  // State
  state: PhoneVerificationState;
  errors: Pick<FormValidationErrors, 'phoneNumber' | 'customerName' | 'otpCode'>;

  // Actions
  updatePhoneNumber: (phone: string) => void;
  updateCustomerName: (name: string) => void;
  updateOTPCode: (otp: string) => void;
  sendOTP: () => Promise<boolean>;
  verifyOTP: () => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
  reset: () => void;

  // Validation
  isPhoneValid: boolean;
  isNameValid: boolean;
  isOTPValid: boolean;
  canSendOTP: boolean;
  canVerifyOTP: boolean;

  // Helpers
  formattedPhone: string;
  timeUntilResend: number;
  canResend: boolean;
}

const OTP_EXPIRY_TIME = 300; // 5 minutes in seconds
const RESEND_COOLDOWN = 60; // 1 minute in seconds

export function usePhoneVerification({
  onVerificationSuccess,
  onError,
  autoResendDelay = RESEND_COOLDOWN,
}: UsePhoneVerificationProps = {}): UsePhoneVerificationReturn {
  // State management
  const [state, setState] = useState<PhoneVerificationState>({
    phoneNumber: '',
    customerName: '',
    otpCode: '',
    isOtpSent: false,
    isPhoneVerified: false,
    isVerifying: false,
  });

  const [errors, setErrors] = useState<
    Pick<FormValidationErrors, 'phoneNumber' | 'customerName' | 'otpCode'>
  >({});
  const [lastOTPSent, setLastOTPSent] = useState<Date | null>(null);
  const [timeUntilResend, setTimeUntilResend] = useState(0);

  // Refs for cleanup
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const otpExpiryRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      if (otpExpiryRef.current) clearTimeout(otpExpiryRef.current);
    };
  }, []);

  // Timer for resend cooldown
  useEffect(() => {
    if (lastOTPSent && !state.isPhoneVerified) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - lastOTPSent.getTime()) / 1000);
        const remaining = Math.max(0, autoResendDelay - elapsed);
        setTimeUntilResend(remaining);

        if (remaining === 0 && resendTimerRef.current) {
          clearInterval(resendTimerRef.current);
          resendTimerRef.current = null;
        }
      };

      updateTimer();
      resendTimerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (resendTimerRef.current) {
          clearInterval(resendTimerRef.current);
          resendTimerRef.current = null;
        }
      };
    }
  }, [lastOTPSent, autoResendDelay, state.isPhoneVerified]);

  // Update phone number with validation
  const updatePhoneNumber = useCallback(
    (phone: string) => {
      setState((prev) => ({ ...prev, phoneNumber: phone }));

      // Clear phone error when user starts typing
      if (errors.phoneNumber) {
        setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
      }

      // Real-time validation
      if (phone.length > 5) {
        const validation = validateTurkishPhone(phone);
        if (!validation.isValid) {
          setErrors((prev) => ({ ...prev, phoneNumber: validation.error }));
        }
      }
    },
    [errors.phoneNumber],
  );

  // Update customer name with validation
  const updateCustomerName = useCallback(
    (name: string) => {
      setState((prev) => ({ ...prev, customerName: name }));

      // Clear name error when user starts typing
      if (errors.customerName) {
        setErrors((prev) => ({ ...prev, customerName: undefined }));
      }

      // Real-time validation
      if (name.length > 1) {
        const validation = validateCustomerName(name);
        if (!validation.isValid) {
          setErrors((prev) => ({ ...prev, customerName: validation.error }));
        }
      }
    },
    [errors.customerName],
  );

  // Update OTP code with validation
  const updateOTPCode = useCallback(
    (otp: string) => {
      // Only allow 4 digits
      const cleanOTP = otp.replace(/\D/g, '').slice(0, 4);
      setState((prev) => ({ ...prev, otpCode: cleanOTP }));

      // Clear OTP error when user starts typing
      if (errors.otpCode) {
        setErrors((prev) => ({ ...prev, otpCode: undefined }));
      }

      // Auto-verify when 4 digits are entered
      if (cleanOTP.length === 4 && !state.isVerifying) {
        // Delay to allow user to see the complete code
        setTimeout(() => verifyOTP(), 500);
      }
    },
    [errors.otpCode, state.isVerifying],
  );

  // Validation computed values
  const isPhoneValid = validateTurkishPhone(state.phoneNumber).isValid;
  const isNameValid = validateCustomerName(state.customerName).isValid;
  const isOTPValid = validateOTPCode(state.otpCode).isValid;
  const canSendOTP = isPhoneValid && isNameValid && !state.isOtpSent;
  const canVerifyOTP = isOTPValid && state.isOtpSent && !state.isPhoneVerified;
  const canResend = state.isOtpSent && timeUntilResend === 0 && !state.isPhoneVerified;
  const formattedPhone = formatPhoneForDisplay(state.phoneNumber);

  // Send OTP
  const sendOTP = useCallback(async (): Promise<boolean> => {
    try {
      // Validate before sending
      const phoneValidation = validateTurkishPhone(state.phoneNumber);
      const nameValidation = validateCustomerName(state.customerName);

      if (!phoneValidation.isValid) {
        setErrors((prev) => ({ ...prev, phoneNumber: phoneValidation.error }));
        return false;
      }

      if (!nameValidation.isValid) {
        setErrors((prev) => ({ ...prev, customerName: nameValidation.error }));
        return false;
      }

      setState((prev) => ({ ...prev, isVerifying: true }));

      // For demo purposes, we simulate OTP sending
      // In real implementation, this would call an API
      const result = await executeWithRetry(async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if phone number is blocked (demo check)
        const _normalizedPhone = normalizePhoneForAPI(state.phoneNumber);

        return { success: true, message: 'OTP sent successfully' };
      });

      if (result.success) {
        setState((prev) => ({
          ...prev,
          isOtpSent: true,
          isVerifying: false,
          otpCode: '', // Clear any previous OTP
        }));
        setLastOTPSent(new Date());
        setErrors({}); // Clear all errors

        // Set OTP expiry timer
        otpExpiryRef.current = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            isOtpSent: false,
            otpCode: '',
          }));
          setErrors((prev) => ({
            ...prev,
            otpCode: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد',
          }));
        }, OTP_EXPIRY_TIME * 1000);

        return true;
      }

      return false;
    } catch (error) {
      await logError('Failed to send OTP:', error);
      setState((prev) => ({ ...prev, isVerifying: false }));
      setErrors((prev) => ({
        ...prev,
        phoneNumber: 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى',
      }));
      onError?.(error);
      return false;
    }
  }, [state.phoneNumber, state.customerName, onError]);

  // Verify OTP
  const verifyOTP = useCallback(async (): Promise<boolean> => {
    try {
      const otpValidation = validateOTPCode(state.otpCode);
      if (!otpValidation.isValid) {
        setErrors((prev) => ({ ...prev, otpCode: otpValidation.error }));
        return false;
      }

      setState((prev) => ({ ...prev, isVerifying: true }));

      // For demo purposes, we accept "1234" as valid OTP
      // In real implementation, this would call an API
      const result = await executeWithRetry(async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (state.otpCode === '1234') {
          return {
            success: true,
            customerData: {
              phone: normalizePhoneForAPI(state.phoneNumber),
              name: state.customerName.trim(),
              exists: Math.random() > 0.7, // 30% chance customer exists
            },
          };
        } else {
          throw new Error('رمز التحقق غير صحيح');
        }
      });

      if (result.success) {
        setState((prev) => ({
          ...prev,
          isPhoneVerified: true,
          isVerifying: false,
        }));
        setErrors({});

        // Clear timers
        if (otpExpiryRef.current) {
          clearTimeout(otpExpiryRef.current);
          otpExpiryRef.current = null;
        }
        if (resendTimerRef.current) {
          clearInterval(resendTimerRef.current);
          resendTimerRef.current = null;
        }

        onVerificationSuccess?.(result.customerData);
        return true;
      }

      return false;
    } catch (error) {
      await logError('Failed to verify OTP:', error);
      setState((prev) => ({ ...prev, isVerifying: false }));

      const errorMessage = error instanceof Error ? error.message : 'رمز التحقق غير صحيح';
      setErrors((prev) => ({ ...prev, otpCode: errorMessage }));

      onError?.(error);
      return false;
    }
  }, [state.otpCode, state.phoneNumber, state.customerName, onVerificationSuccess, onError]);

  // Resend OTP
  const resendOTP = useCallback(async (): Promise<boolean> => {
    if (!canResend) return false;

    setState((prev) => ({
      ...prev,
      isOtpSent: false,
      otpCode: '',
    }));
    setErrors((prev) => ({ ...prev, otpCode: undefined }));

    return await sendOTP();
  }, [canResend, sendOTP]);

  // Reset all state
  const reset = useCallback(() => {
    setState({
      phoneNumber: '',
      customerName: '',
      otpCode: '',
      isOtpSent: false,
      isPhoneVerified: false,
      isVerifying: false,
    });
    setErrors({});
    setLastOTPSent(null);
    setTimeUntilResend(0);

    // Clear timers
    if (otpExpiryRef.current) {
      clearTimeout(otpExpiryRef.current);
      otpExpiryRef.current = null;
    }
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
  }, []);

  return {
    // State
    state,
    errors,

    // Actions
    updatePhoneNumber,
    updateCustomerName,
    updateOTPCode,
    sendOTP,
    verifyOTP,
    resendOTP,
    reset,

    // Validation
    isPhoneValid,
    isNameValid,
    isOTPValid,
    canSendOTP,
    canVerifyOTP,

    // Helpers
    formattedPhone,
    timeUntilResend,
    canResend,
  };
}

// Hook مساعد لإدارة التركيز التلقائي على حقول OTP
export function useOTPFocus(otpLength: number = 4) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusNext = useCallback(
    (index: number) => {
      if (index < otpLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otpLength],
  );

  const focusPrevious = useCallback((index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, []);

  const setInputRef = useCallback(
    (index: number) => (ref: HTMLInputElement | null) => {
      inputRefs.current[index] = ref;
    },
    [],
  );

  return {
    inputRefs: inputRefs.current,
    focusNext,
    focusPrevious,
    setInputRef,
  };
}

// Hook لإدارة نمط إدخال OTP (رقم واحد لكل حقل)
export function useOTPInput(length: number = 4, onComplete?: (otp: string) => void) {
  const [values, setValues] = useState<string[]>(new Array(length).fill(''));
  const { inputRefs, focusNext, focusPrevious, setInputRef } = useOTPFocus(length);

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Only allow single digit
      const newValue = value.replace(/\D/g, '').slice(-1);

      const newValues = [...values];
      newValues[index] = newValue;
      setValues(newValues);

      // Move to next input if value is entered
      if (newValue && index < length - 1) {
        focusNext(index);
      }

      // Call onComplete when all fields are filled
      if (newValues.every((v) => v.length === 1)) {
        onComplete?.(newValues.join(''));
      }
    },
    [values, length, focusNext, onComplete],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !values[index] && index > 0) {
        focusPrevious(index);
      }
    },
    [values, focusPrevious],
  );

  const reset = useCallback(() => {
    setValues(new Array(length).fill(''));
    inputRefs[0]?.focus();
  }, [length, inputRefs]);

  const setValue = useCallback(
    (otp: string) => {
      const otpArray = otp.slice(0, length).split('');
      const paddedArray = [...otpArray, ...new Array(length - otpArray.length).fill('')];
      setValues(paddedArray);
    },
    [length],
  );

  return {
    values,
    handleChange,
    handleKeyDown,
    setInputRef,
    reset,
    setValue,
    isComplete: values.every((v) => v.length === 1),
    otpValue: values.join(''),
  };
}
