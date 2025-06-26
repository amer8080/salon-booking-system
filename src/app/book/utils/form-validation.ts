// src/app/book/utils/form-validation.ts
// نظام validation محسن ومتقدم للنموذج

import { logWarn } from '@/lib/logger-client'
import { FormValidationErrors, ValidationResult, BookingFormData } from '../types/booking-form.types'
import { getTodayIstanbul, parseIstanbulDate, createIstanbulDate } from '@/lib/timezone'

/**
 * تحقق من صحة رقم الهاتف التركي
 */
export function validateTurkishPhone(phone: string): { isValid: boolean; error?: string } {
  // إزالة المسافات والرموز
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // التحقق من الطول الأساسي
  if (!cleanPhone || cleanPhone.length < 10) {
    return { isValid: false, error: 'رقم الهاتف قصير جداً' }
  }
  
  if (cleanPhone.length > 15) {
    return { isValid: false, error: 'رقم الهاتف طويل جداً' }
  }
  
  // التحقق من الأرقام فقط (بعد إزالة + في البداية)
  const phoneDigits = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone
  if (!/^\d+$/.test(phoneDigits)) {
    return { isValid: false, error: 'يجب أن يحتوي رقم الهاتف على أرقام فقط' }
  }
  
  // أنماط الأرقام التركية المقبولة
  const turkishPatterns = [
    /^(\+90|90)?5\d{9}$/,  // +90 5XX XXX XX XX
    /^(\+90|90)?0?5\d{9}$/, // مع 0 اختياري
    /^5\d{9}$/,            // 5XX XXX XX XX
    /^0?5\d{9}$/           // 05XX XXX XX XX
  ]
  
  const isValidPattern = turkishPatterns.some(pattern => pattern.test(cleanPhone))
  
  if (!isValidPattern) {
    return { 
      isValid: false, 
      error: 'صيغة رقم الهاتف غير صحيحة. يجب أن يبدأ بـ 5 ويكون 10 أرقام (+90 5XX XXX XX XX)' 
    }
  }
  
  // التحقق من الأرقام المحظورة (أرقام وهمية معروفة)
  const blockedNumbers = [
    '5000000000',
    '5111111111',
    '5222222222',
    '5333333333',
    '5444444444',
    '5555555555',
    '5666666666',
    '5777777777',
    '5888888888',
    '5999999999',
    '5123456789',
    '5987654321'
  ]
  
  const normalizedPhone = cleanPhone.replace(/^(\+90|90|0)/, '')
  if (blockedNumbers.includes(normalizedPhone)) {
    return { isValid: false, error: 'هذا الرقم غير صحيح. يرجى إدخال رقم هاتف حقيقي' }
  }
  
  return { isValid: true }
}

/**
 * تحقق من صحة الاسم
 */
export function validateCustomerName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'الاسم مطلوب' }
  }
  
  const trimmedName = name.trim()
  
  // الحد الأدنى والأقصى للأحرف
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'الاسم قصير جداً (حد أدنى حرفين)' }
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'الاسم طويل جداً (حد أقصى 50 حرف)' }
  }
  
  // منع الأرقام
  if (/\d/.test(trimmedName)) {
    return { isValid: false, error: 'الاسم لا يجب أن يحتوي على أرقام' }
  }
  
  // منع الرموز الغريبة (السماح بالمسافات والحروف العربية والإنجليزية فقط)
  if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(trimmedName)) {
    return { isValid: false, error: 'الاسم يجب أن يحتوي على حروف عربية أو إنجليزية فقط' }
  }
  
  // منع التكرار المفرط للحرف نفسه
  if (/(.)\1{3,}/.test(trimmedName)) {
    return { isValid: false, error: 'الاسم يحتوي على تكرار مفرط للأحرف' }
  }
  
  // منع الأسماء غير المنطقية
  const invalidNames = [
    'test', 'admin', 'user', 'null', 'undefined',
    'تجربة', 'اختبار', 'مستخدم', 'ادمن'
  ]
  
  if (invalidNames.includes(trimmedName.toLowerCase())) {
    return { isValid: false, error: 'يرجى إدخال اسم حقيقي' }
  }
  
  // التحقق من وجود حرف واحد على الأقل
  if (!/[a-zA-Z\u0600-\u06FF]/.test(trimmedName)) {
    return { isValid: false, error: 'الاسم يجب أن يحتوي على حروف صحيحة' }
  }
  
  return { isValid: true }
}

/**
 * تحقق من صحة رمز OTP
 */
export function validateOTPCode(otp: string): { isValid: boolean; error?: string } {
  if (!otp || otp.trim().length === 0) {
    return { isValid: false, error: 'رمز التحقق مطلوب' }
  }
  
  const cleanOTP = otp.trim()
  
  if (cleanOTP.length !== 4) {
    return { isValid: false, error: 'رمز التحقق يجب أن يكون 4 أرقام' }
  }
  
  if (!/^\d{4}$/.test(cleanOTP)) {
    return { isValid: false, error: 'رمز التحقق يجب أن يحتوي على أرقام فقط' }
  }
  
  return { isValid: true }
}

/**
 * تحقق من صحة التاريخ المختار
 */
export function validateSelectedDate(date: string): { isValid: boolean; error?: string } {
  if (!date || date.trim().length === 0) {
    return { isValid: false, error: 'يرجى اختيار تاريخ الموعد' }
  }
  
  try {
    const selectedDate = parseIstanbulDate(date)
    const today = createIstanbulDate()
    const todayString = getTodayIstanbul()
    
    // التحقق من أن التاريخ ليس في الماضي
    if (date < todayString) {
      return { isValid: false, error: 'لا يمكن اختيار تاريخ في الماضي' }
    }
    
    // التحقق من أن التاريخ ليس بعيداً جداً (مثلاً أكثر من 3 أشهر)
    const threeMonthsLater = new Date(today)
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
    
    if (selectedDate > threeMonthsLater) {
      return { isValid: false, error: 'لا يمكن الحجز لأكثر من 3 أشهر مقدماً' }
    }
    
    return { isValid: true }
    
  } catch (error) {
    logWarn("Date validation failed", {
      error: error.message,
      operation: "validateDate",
      component: "form-validation"
    })
    return { isValid: false, error: 'صيغة التاريخ غير صحيحة' 
  }
  }
}

/**
 * تحقق من صحة الوقت المختار
 */
export function validateSelectedTime(time: string, date: string): { isValid: boolean; error?: string } {
  if (!time || time.trim().length === 0) {
    return { isValid: false, error: 'يرجى اختيار وقت الموعد' }
  }
  
  // التحقق من صيغة الوقت
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return { isValid: false, error: 'صيغة الوقت غير صحيحة' }
  }
  
  const [hours, minutes] = time.split(':').map(Number)
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return { isValid: false, error: 'الوقت غير صحيح' }
  }
  
  // التحقق من ساعات العمل (11:30 - 18:30)
  const workingStart = 11 * 60 + 30 // 11:30 بالدقائق
  const workingEnd = 18 * 60 + 30   // 18:30 بالدقائق
  const selectedTimeInMinutes = hours * 60 + minutes
  
  if (selectedTimeInMinutes < workingStart || selectedTimeInMinutes > workingEnd) {
    return { isValid: false, error: 'الوقت خارج ساعات العمل (11:30 - 18:30)' }
  }
  
  // إذا كان التاريخ اليوم، تحقق من أن الوقت لم يمض
  const today = getTodayIstanbul()
  if (date === today) {
    const now = createIstanbulDate()
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes()
    
    if (selectedTimeInMinutes <= currentTimeInMinutes + 30) { // إضافة 30 دقيقة buffer
      return { isValid: false, error: 'لا يمكن اختيار وقت مضى أو قريب جداً. يرجى اختيار وقت بعد 30 دقيقة على الأقل' }
    }
  }
  
  return { isValid: true }
}

/**
 * تحقق من صحة الخدمات المختارة
 */
export function validateSelectedServices(services: string[]): { isValid: boolean; error?: string } {
  if (!services || services.length === 0) {
    return { isValid: false, error: 'يرجى اختيار خدمة واحدة على الأقل' }
  }
  
  if (services.length > 10) {
    return { isValid: false, error: 'لا يمكن اختيار أكثر من 10 خدمات في الموعد الواحد' }
  }
  
  // التحقق من أن كل خدمة لها ID صحيح
  for (const serviceId of services) {
    if (!serviceId || typeof serviceId !== 'string' || serviceId.trim().length === 0) {
      return { isValid: false, error: 'هناك خدمة غير صحيحة في القائمة' }
    }
  }
  
  return { isValid: true }
}

/**
 * تحقق شامل من النموذج
 */
export function validateBookingForm(formData: BookingFormData): ValidationResult {
  const errors: FormValidationErrors = {}
  
  // تحقق من رقم الهاتف
  const phoneValidation = validateTurkishPhone(formData.phoneNumber)
  if (!phoneValidation.isValid) {
    errors.phoneNumber = phoneValidation.error
  }
  
  // تحقق من الاسم
  const nameValidation = validateCustomerName(formData.customerName)
  if (!nameValidation.isValid) {
    errors.customerName = nameValidation.error
  }
  
  // تحقق من OTP إذا كان مطلوباً
  if (formData.currentStep >= 2 && !formData.isPhoneVerified) {
    const otpValidation = validateOTPCode(formData.otpCode)
    if (!otpValidation.isValid) {
      errors.otpCode = otpValidation.error
    }
  }
  
  // تحقق من التاريخ إذا كان في الخطوة 2 أو أكثر
  if (formData.currentStep >= 2) {
    const dateValidation = validateSelectedDate(formData.selectedDate)
    if (!dateValidation.isValid) {
      errors.selectedDate = dateValidation.error
    }
    
    // تحقق من الوقت
    const timeValidation = validateSelectedTime(formData.selectedTime, formData.selectedDate)
    if (!timeValidation.isValid) {
      errors.selectedTime = timeValidation.error
    }
    
    // تحقق من الخدمات
    const servicesValidation = validateSelectedServices(formData.selectedServices)
    if (!servicesValidation.isValid) {
      errors.selectedServices = servicesValidation.error
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * تحقق من إمكانية الانتقال للخطوة التالية
 */
export function canProceedToNextStep(formData: BookingFormData): { canProceed: boolean; reason?: string } {
  switch (formData.currentStep) {
    case 1:
      // للانتقال للخطوة 2: يجب التحقق من الهاتف
      if (!formData.isPhoneVerified) {
        return { canProceed: false, reason: 'يجب التحقق من رقم الهاتف أولاً' }
      }
      break
      
    case 2:
      // للانتقال للخطوة 3: يجب اختيار التاريخ والوقت والخدمات
      if (!formData.selectedDate || !formData.selectedTime || formData.selectedServices.length === 0) {
        return { canProceed: false, reason: 'يجب إكمال جميع بيانات الحجز' }
      }
      
      // تحقق إضافي من صحة البيانات
      const validation = validateBookingForm(formData)
      if (!validation.isValid) {
        return { canProceed: false, reason: 'يرجى تصحيح الأخطاء أولاً' }
      }
      break
      
    case 3:
      // في الخطوة 3، يمكن إرسال النموذج
      return { canProceed: true }
      
    default:
      return { canProceed: false, reason: 'خطوة غير صحيحة' }
  }
  
  return { canProceed: true }
}

/**
 * تنسيق رقم الهاتف للعرض
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    // 5XX XXX XX XX -> +90 5XX XXX XX XX
    return `+90 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('05')) {
    // 05XX XXX XX XX -> +90 5XX XXX XX XX
    return `+90 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('90')) {
    // 905XX XXX XX XX -> +90 5XX XXX XX XX
    return `+90 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`
  }
  
  return phone // إرجاع كما هو إذا لم يطابق أي نمط
}

/**
 * تنظيف رقم الهاتف للإرسال لـ API
 */
export function normalizePhoneForAPI(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    return `+90${cleaned}`
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('05')) {
    return `+90${cleaned.slice(1)}`
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('90')) {
    return `+${cleaned}`
  }
  
  if (cleaned.length === 13 && cleaned.startsWith('90')) {
    return `+${cleaned}`
  }
  
  return phone
}
