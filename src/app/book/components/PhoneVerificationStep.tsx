// src/app/book/components/PhoneVerificationStep.tsx
// مكون خطوة التحقق من الهاتف

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Phone, User, Shield, Loader2, CheckCircle, XCircle } from 'lucide-react';
// Types
import { PhoneVerificationState } from '../types/booking-form.types';

interface PhoneVerificationStepProps {
  state: PhoneVerificationState;
  onSendOTP: () => Promise<boolean>;
  onVerifyOTP: () => Promise<boolean>;
  onPhoneChange: (phone: string) => void;
  onNameChange: (name: string) => void;
  onOTPChange: (otp: string) => void;
  onBack?: () => void;
  errors: {
    phoneNumber?: string;
    customerName?: string;
    otpCode?: string;
  };
  className?: string;
}

export default function PhoneVerificationStep({
  state,
  onSendOTP,
  onVerifyOTP,
  onPhoneChange,
  onNameChange,
  onOTPChange,
  onBack,
  errors,
  className = '',
}: PhoneVerificationStepProps) {
  const [countdown, setCountdown] = useState(0);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // إدارة عداد إعادة الإرسال
  useEffect(() => {
    if (state.isOtpSent && countdown === 0) {
      setCountdown(60); // 60 ثانية
    }
  }, [state.isOtpSent]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // التركيز على أول حقل OTP
  useEffect(() => {
    if (state.isOtpSent && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [state.isOtpSent]);

  // معالجة إدخال OTP
  const handleOTPChange = (index: number, value: string) => {
    // السماح بالأرقام فقط
    const numericValue = value.replace(/\D/g, '').slice(0, 1);

    // تحديث قيمة OTP
    const otpArray = state.otpCode.split('');
    otpArray[index] = numericValue;
    const newOTP = otpArray.join('');

    onOTPChange(newOTP);

    // الانتقال للحقل التالي
    if (numericValue && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // إذا تم إدخال الكود كاملاً، تحقق تلقائياً
    if (newOTP.length === 4 && !state.isVerifying) {
      setTimeout(() => {
        onVerifyOTP();
      }, 500);
    }
  };

  // معالجة مفتاح Backspace
  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !state.otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // معالجة لصق الكود
  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);

    if (pastedData.length > 0) {
      onOTPChange(pastedData);

      // التركيز على الحقل المناسب
      const focusIndex = Math.min(pastedData.length - 1, 3);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // إعادة إرسال OTP
  const handleResendOTP = async () => {
    setIsResendingOTP(true);
    try {
      await onSendOTP();
      setCountdown(60);
    } finally {
      setIsResendingOTP(false);
    }
  };

  // تنسيق رقم الهاتف أثناء الكتابة
  const formatPhoneNumber = (value: string) => {
    // إزالة كل شيء عدا الأرقام
    const numbers = value.replace(/\D/g, '');

    // إضافة +90 تلقائياً إذا لم تكن موجودة
    if (numbers.length > 0 && !numbers.startsWith('90')) {
      return '+90 ' + numbers.slice(0, 10);
    } else if (numbers.startsWith('90')) {
      const formatted = numbers.slice(2);
      return '+90 ' + formatted.slice(0, 10);
    }

    return '+90 ';
  };

  const handlePhoneInputChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    onPhoneChange(formatted);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* العنوان */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">التحقق من الهاتف</h2>
        <p className="text-gray-600">
          {!state.isOtpSent ? 'أدخلي رقم هاتفك واسمك للمتابعة' : 'أدخلي الكود المرسل إلى هاتفك'}
        </p>
      </div>

      {!state.isOtpSent ? (
        /* مرحلة إدخال البيانات */
        <div className="space-y-4">
          {/* رقم الهاتف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline ml-1" />
              رقم الهاتف
            </label>
            <div className="relative">
              <input
                type="tel"
                value={state.phoneNumber}
                onChange={(e) => handlePhoneInputChange(e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                className={`
                  w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
                  text-left font-mono text-lg
                  ${
                    errors.phoneNumber
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-purple-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-purple-200
                `}
                dir="ltr"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🇹🇷</span>
              </div>
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <XCircle className="w-4 h-4 ml-1" />
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* الاسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline ml-1" />
              الاسم الكامل
            </label>
            <input
              type="text"
              value={state.customerName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="مثال: سارة أحمد"
              className={`
                w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
                ${
                  errors.customerName
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-purple-500'
                }
                focus:outline-none focus:ring-2 focus:ring-purple-200
              `}
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <XCircle className="w-4 h-4 ml-1" />
                {errors.customerName}
              </p>
            )}
          </div>

          {/* زر إرسال الكود */}
          <button
            onClick={onSendOTP}
            disabled={state.isSendingOtp || !state.phoneNumber || !state.customerName}
            className={`
              w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
              ${
                state.isSendingOtp || !state.phoneNumber || !state.customerName
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 active:scale-95'
              }
            `}
          >
            {state.isSendingOtp ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جاري الإرسال...
              </div>
            ) : (
              'إرسال كود التحقق'
            )}
          </button>
        </div>
      ) : (
        /* مرحلة التحقق من OTP */
        <div className="space-y-6">
          {/* معلومات المرسل إليه */}
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-sm text-purple-700 text-center">تم إرسال كود التحقق إلى:</p>
            <p className="text-lg font-semibold text-purple-800 text-center font-mono" dir="ltr">
              {state.phoneNumber}
            </p>
          </div>

          {/* حقول OTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              أدخلي الكود المكون من 4 أرقام
            </label>
            <div className="flex justify-center space-x-3 rtl:space-x-reverse">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={state.otpCode[index] || ''}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onPaste={handleOTPPaste}
                  className={`
                    w-14 h-14 text-center text-2xl font-bold rounded-xl border-2
                    transition-all duration-300
                    ${
                      errors.otpCode
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-purple-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-purple-200
                  `}
                />
              ))}
            </div>
            {errors.otpCode && (
              <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center">
                <XCircle className="w-4 h-4 ml-1" />
                {errors.otpCode}
              </p>
            )}
          </div>

          {/* زر التحقق */}
          <button
            onClick={onVerifyOTP}
            disabled={state.isVerifying || state.otpCode.length !== 4}
            className={`
              w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
              ${
                state.isVerifying || state.otpCode.length !== 4
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : state.isPhoneVerified
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 active:scale-95'
              }
            `}
          >
            {state.isVerifying ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جاري التحقق...
              </div>
            ) : state.isPhoneVerified ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 ml-2" />
                تم التحقق بنجاح
              </div>
            ) : (
              'تحقق من الكود'
            )}
          </button>

          {/* إعادة إرسال الكود */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-gray-500">
                يمكنك إعادة إرسال الكود خلال{' '}
                <span className="font-bold text-purple-600">{countdown}</span> ثانية
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={isResendingOTP}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-300"
              >
                {isResendingOTP ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin ml-1" />
                    جاري الإرسال...
                  </div>
                ) : (
                  'إعادة إرسال الكود'
                )}
              </button>
            )}
          </div>

          {/* تغيير رقم الهاتف */}
          <div className="text-center">
            <button
              onClick={() => {
                onOTPChange('');
                onPhoneChange('');
                onNameChange('');
              }}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-300"
            >
              تغيير رقم الهاتف؟
            </button>
          </div>
        </div>
      )}

      {/* أزرار التنقل */}
      <div className="flex justify-between pt-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-300"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            رجوع
          </button>
        )}

        <div className="flex-1" />

        {state.isPhoneVerified && (
          <div className="flex items-center text-green-600 font-medium">
            <CheckCircle className="w-5 h-5 ml-2" />
            جاهز للمتابعة
          </div>
        )}
      </div>
    </div>
  );
}
