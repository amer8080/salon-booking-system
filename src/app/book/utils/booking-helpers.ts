import { logWarn } from '@/lib/logger-client';
import type { BookingStep } from '../types/booking-form.types';
// src/app/book/utils/booking-helpers.ts
// مساعدات الحجز - وظائف عامة ومفيدة

import { BookingFormData } from '../types/booking-form.types';
import { Service } from '../types/booking-form.types';
import { formatArabicDate, parseIstanbulDate } from '@/lib/timezone';

// معلومات المتصفح والجهاز (إصلاح SSR)
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  userAgent: string;
  screenSize: {
    width: number;
    height: number;
  };
  platform: string;
}

// الحصول على معلومات الجهاز مع إصلاح SSR
export function getDeviceInfo(): DeviceInfo {
  // القيم الافتراضية للـ SSR
  const defaultInfo: DeviceInfo = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    hasTouch: false,
    userAgent: 'SSR',
    screenSize: { width: 1920, height: 1080 },
    platform: 'unknown',
  };

  // إذا كنا في الخادم، أرجع القيم الافتراضية
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return defaultInfo;
  }

  const userAgent = navigator.userAgent;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  return {
    isMobile:
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
      screenWidth < 768,
    isTablet:
      /iPad|Android.*Tablet|PlayBook|Kindle/i.test(userAgent) ||
      (screenWidth >= 768 && screenWidth < 1024),
    isDesktop: screenWidth >= 1024,
    hasTouch: 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0,
    userAgent,
    screenSize: { width: screenWidth, height: screenHeight },
    platform: navigator.platform || 'unknown',
  };
}

// إعادة تعيين بيانات النموذج
export function resetFormData(): BookingFormData {
  return {
    currentStep: 1,
    phoneNumber: '',
    customerName: '',
    otpCode: '',
    isPhoneVerified: false,
    isOtpSent: false,
    selectedServices: [],
    selectedDate: '',
    selectedTime: '',
    isSubmitting: false,
  };
}

// التحقق من صحة بيانات الخطوة (تم تغيير الاسم لمنع التضارب)
export function isStepDataValid(formData: BookingFormData, currentStep: number): boolean {
  switch (currentStep) {
    case 1:
      // خطوة التحقق من الهاتف
      return (
        formData.isPhoneVerified &&
        formData.phoneNumber.length > 10 &&
        formData.customerName.length > 2
      );

    case 2:
      // خطوة اختيار الموعد والخدمات
      return (
        formData.selectedServices.length > 0 &&
        formData.selectedDate !== '' &&
        formData.selectedTime !== ''
      );

    case 3:
      // خطوة التأكيد - دائماً يمكن الوصول إليها إذا وصلنا هنا
      return true;

    default:
      return false;
  }
}

// حساب إجمالي السعر
export function calculateTotalPrice(services: Service[]): number {
  return services.reduce((total, service) => total + service.price, 0);
}

// حساب إجمالي المدة
export function calculateTotalDuration(services: Service[]): number {
  return services.reduce((total, service) => total + service.duration, 0);
}

// تنسيق السعر للعرض
export function formatPrice(price: number, currency: string = 'TL'): string {
  return `${price.toLocaleString('tr-TR')} ${currency}`;
}

// تنسيق المدة للعرض
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ساعة`;
  }

  return `${hours} ساعة و ${remainingMinutes} دقيقة`;
}

// تنسيق الوقت للعرض
export function formatTimeSlot(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const minute = parseInt(minutes);

    // تحويل إلى 12-hour format
    if (hour === 0) {
      return `12:${minute.toString().padStart(2, '0')} ص`;
    } else if (hour < 12) {
      return `${hour}:${minute.toString().padStart(2, '0')} ص`;
    } else if (hour === 12) {
      return `12:${minute.toString().padStart(2, '0')} م`;
    } else {
      return `${hour - 12}:${minute.toString().padStart(2, '0')} م`;
    }
  } catch {
    return time;
  }
}

// إنشاء رسالة واتساب
export function formatWhatsAppMessage(formData: BookingFormData, services: Service[]): string {
  const selectedServicesData = services.filter((service) =>
    formData.selectedServices.includes(service.id),
  );

  const servicesList = selectedServicesData
    .map((service) => `• ${service.name} (${formatPrice(service.price)})`)
    .join('\n');

  const totalPrice = calculateTotalPrice(selectedServicesData);
  const totalDuration = calculateTotalDuration(selectedServicesData);
  const arabicDate = formatArabicDate(parseIstanbulDate(formData.selectedDate));
  const formattedTime = formatTimeSlot(formData.selectedTime);

  return `
🌸 طلب حجز موعد 🌸

👤 الاسم: ${formData.customerName}
📱 الهاتف: ${formData.phoneNumber}

📅 التاريخ: ${arabicDate}
🕐 الوقت: ${formattedTime}

💄 الخدمات المطلوبة:
${servicesList}

⏱️ المدة الإجمالية: ${formatDuration(totalDuration)}
💰 السعر الإجمالي: ${formatPrice(totalPrice)}


شكراً لكم 🙏
`.trim();
}

// التحقق من توفر الوقت
export function isTimeSlotAvailable(
  date: string,
  time: string,
  blockedTimes: string[],
  bookedTimes: string[],
): boolean {
  const dateTime = `${date}T${time}`;
  return !blockedTimes.includes(dateTime) && !bookedTimes.includes(dateTime);
}

// تحويل التاريخ إلى نص عربي قصير
export function formatDateForDisplay(date: string): string {
  try {
    const parsedDate = parseIstanbulDate(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // إذا كان اليوم
    if (parsedDate.toDateString() === today.toDateString()) {
      return 'اليوم';
    }

    // إذا كان غداً
    if (parsedDate.toDateString() === tomorrow.toDateString()) {
      return 'غداً';
    }

    // استخدم التنسيق العربي الكامل
    return formatArabicDate(parsedDate);
  } catch {
    return date;
  }
}

// إنشاء ملخص الحجز
export interface BookingSummary {
  customerInfo: {
    name: string;
    phone: string;
  };
  appointmentInfo: {
    date: string;
    time: string;
    formattedDate: string;
    formattedTime: string;
  };
  servicesInfo: {
    services: Service[];
    totalPrice: number;
    totalDuration: number;
    formattedPrice: string;
    formattedDuration: string;
  };
  additionalInfo: {
    notes?: string;
    whatsappMessage: string;
  };
}

export function createBookingSummary(
  formData: BookingFormData,
  services: Service[],
): BookingSummary {
  const selectedServicesData = services.filter((service) =>
    formData.selectedServices.includes(service.id),
  );

  const totalPrice = calculateTotalPrice(selectedServicesData);
  const totalDuration = calculateTotalDuration(selectedServicesData);

  return {
    customerInfo: {
      name: formData.customerName,
      phone: formData.phoneNumber,
    },
    appointmentInfo: {
      date: formData.selectedDate,
      time: formData.selectedTime,
      formattedDate: formatDateForDisplay(formData.selectedDate),
      formattedTime: formatTimeSlot(formData.selectedTime),
    },
    servicesInfo: {
      services: selectedServicesData,
      totalPrice,
      totalDuration,
      formattedPrice: formatPrice(totalPrice),
      formattedDuration: formatDuration(totalDuration),
    },
    additionalInfo: {
      whatsappMessage: formatWhatsAppMessage(formData, services),
    },
  };
}

// التحقق من صحة التاريخ والوقت
export function validateDateTime(date: string, time: string): boolean {
  try {
    const selectedDateTime = parseIstanbulDate(`${date}T${time}`);
    const now = new Date();

    // يجب أن يكون الموعد في المستقبل
    return selectedDateTime > now;
  } catch {
    return false;
  }
}

// إنشاء أرقام مرجعية للحجز
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BK${timestamp}${random}`.toUpperCase();
}

// حفظ بيانات الحجز محلياً (للطوارئ)
export function saveBookingDataLocally(formData: BookingFormData): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const dataToSave = {
        ...formData,
        timestamp: Date.now(),
        reference: generateBookingReference(),
      };

      localStorage.setItem('emergency_booking_data', JSON.stringify(dataToSave));
    }
  } catch (error) {
    logWarn('Failed to save booking data locally:', error);
  }
}

// استرجاع بيانات الحجز المحفوظة محلياً
export function getLocallyStoredBookingData(): BookingFormData | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('emergency_booking_data');
      if (stored) {
        const parsed = JSON.parse(stored);

        // تحقق من أن البيانات ليست قديمة جداً (24 ساعة)
        const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;

        if (isRecent) {
          return parsed;
        } else {
          // امسح البيانات القديمة
          localStorage.removeItem('emergency_booking_data');
        }
      }
    }
  } catch (error) {
    logWarn('Failed to retrieve locally stored booking data:', error);
  }

  return null;
}

// مسح البيانات المحفوظة محلياً
export function clearLocallyStoredBookingData(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('emergency_booking_data');
    }
  } catch (error) {
    logWarn('Failed to clear locally stored booking data:', error);
  }
}

// الدوال المفقودة المطلوبة:

// تنسيق الوقت للعرض (alias)
export const formatTimeForDisplay = formatTimeSlot;

// إنشاء رابط واتساب
export function createWhatsAppURL(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// إعدادات الخطوات
import { Phone, Calendar, Check } from 'lucide-react';

export function getStepsConfig() {
  return [
    {
      id: 1 as BookingStep,
      title: 'التحقق من الهاتف',
      description: 'أدخل رقم هاتفك للتحقق',
      icon: Phone,
      accessible: true,
      completed: false,
    },
    {
      id: 2 as BookingStep,
      title: 'اختيار الموعد',
      description: 'اختر الخدمات والموعد المناسب',
      icon: Calendar,
      accessible: true,
      completed: false,
    },
    {
      id: 3 as BookingStep,
      title: 'تأكيد الحجز',
      description: 'راجع التفاصيل وأكد الحجز',
      icon: Check,
      accessible: true,
      completed: false,
    },
  ];
}

// حساب التقدم
export function calculateProgress(currentStep: number, totalSteps: number = 3): number {
  return Math.round((currentStep / totalSteps) * 100);
}

// تجميع الخدمات حسب الفئة
export function groupServicesByCategory(services: Service[]): Record<string, Service[]> {
  return services.reduce(
    (groups, service) => {
      const category = service.category || 'أخرى';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
      return groups;
    },
    {} as Record<string, Service[]>,
  );
}

// إنشاء URL مشاركة للحجز
export function createShareableBookingURL(bookingReference: string): string {
  if (typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    return `${baseUrl}/booking/confirm/${bookingReference}`;
  }
  return `https://yoursite.com/booking/confirm/${bookingReference}`;
}

// التحقق من دعم الميزات المطلوبة
export function checkBrowserSupport(): {
  hasLocalStorage: boolean;
  hasTouch: boolean;
  hasGeolocation: boolean;
  hasNotifications: boolean;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      hasLocalStorage: false,
      hasTouch: false,
      hasGeolocation: false,
      hasNotifications: false,
    };
  }

  return {
    hasLocalStorage: 'localStorage' in window,
    hasTouch: 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0,
    hasGeolocation: 'geolocation' in navigator,
    hasNotifications: 'Notification' in window,
  };
}
