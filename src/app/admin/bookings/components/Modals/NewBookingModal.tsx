'use client';

import { useState, useEffect } from 'react';
import { X, Save, Check, Sparkles, Calendar, Clock, User, Phone, Plus } from 'lucide-react';
import { Service, EditBookingData } from '../../types/booking.types';
import { formatArabicDate } from '@/lib/timezone';

interface NewBookingModalProps {
  // Props للـ modal
  isOpen: boolean;
  onClose: () => void;

  // Props للبيانات المطلوبة
  services: { [key: string]: string };
  allServices: Service[];
  adminTimeSlots: string[];

  // Props للوظائف
  onSave: (bookingData: EditBookingData) => Promise<void>;

  // Props للتصميم
  getServiceColor: (serviceId: string) => string;

  // Props للتاريخ المحدد مسبقاً (اختياري)
  selectedDate?: string;
}

const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  _services,
  allServices,
  adminTimeSlots,
  onSave,
  getServiceColor,
  selectedDate = '',
}) => {
  // ✅ State محلي للـ modal
  const [bookingData, setBookingData] = useState<EditBookingData>({
    customerName: '',
    customerPhone: '',
    selectedDate: selectedDate,
    selectedTime: '',
    selectedServices: [],
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ✅ تحديث التاريخ المحدد عند فتح الـ modal
  useEffect(() => {
    if (isOpen) {
      setBookingData((prev) => ({
        ...prev,
        selectedDate: selectedDate || '',
      }));
      setValidationErrors([]);
    }
  }, [isOpen, selectedDate]);

  // ✅ تنظيف البيانات عند الإغلاق
  const handleClose = () => {
    setBookingData({
      customerName: '',
      customerPhone: '',
      selectedDate: selectedDate,
      selectedTime: '',
      selectedServices: [],
      notes: '',
    });
    setValidationErrors([]);
    setIsSaving(false);
    onClose();
  };

  // ✅ تحديث البيانات
  const updateBookingData = (updates: Partial<EditBookingData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }));

    // إزالة أخطاء الحقول المحدثة
    const updatedFields = Object.keys(updates);
    if (updatedFields.includes('customerName') && validationErrors.includes('name')) {
      setValidationErrors((prev) => prev.filter((error) => error !== 'name'));
    }
    if (updatedFields.includes('customerPhone') && validationErrors.includes('phone')) {
      setValidationErrors((prev) => prev.filter((error) => error !== 'phone'));
    }
    if (updatedFields.includes('selectedDate') && validationErrors.includes('date')) {
      setValidationErrors((prev) => prev.filter((error) => error !== 'date'));
    }
    if (updatedFields.includes('selectedTime') && validationErrors.includes('time')) {
      setValidationErrors((prev) => prev.filter((error) => error !== 'time'));
    }
  };

  // ✅ تبديل اختيار الخدمة
  const toggleService = (serviceId: string) => {
    const newServices = bookingData.selectedServices.includes(serviceId)
      ? bookingData.selectedServices.filter((id) => id !== serviceId)
      : [...bookingData.selectedServices, serviceId];

    updateBookingData({ selectedServices: newServices });

    // إزالة خطأ الخدمات إذا تم اختيار خدمة
    if (newServices.length > 0 && validationErrors.includes('services')) {
      setValidationErrors((prev) => prev.filter((error) => error !== 'services'));
    }
  };

  // ✅ التحقق من صحة البيانات
  const validateData = (): boolean => {
    const errors: string[] = [];

    if (!bookingData.customerName.trim()) {
      errors.push('name');
    }

    if (!bookingData.customerPhone.trim()) {
      errors.push('phone');
    }

    if (!bookingData.selectedDate) {
      errors.push('date');
    }

    if (!bookingData.selectedTime) {
      errors.push('time');
    }

    if (bookingData.selectedServices.length === 0) {
      errors.push('services');
    }

    // التحقق من تنسيق رقم الهاتف (اختياري)
    if (bookingData.customerPhone.trim() && !isValidPhoneNumber(bookingData.customerPhone)) {
      errors.push('phone-format');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // ✅ التحقق من تنسيق رقم الهاتف
  const isValidPhoneNumber = (phone: string): boolean => {
    // أرقام تركية أو دولية بسيطة
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$|^(\+\d{1,3})[0-9]{8,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // ✅ حفظ الحجز الجديد
  const handleSave = async () => {
    // التحقق من صحة البيانات
    if (!validateData()) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave(bookingData);
      handleClose();
    } catch {
      // يمكن إضافة معالجة أخطاء أكثر تفصيلاً هنا
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ تنسيق عرض التاريخ
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      const dateObj = new Date(dateString + 'T00:00:00');
      return formatArabicDate(dateObj);
    } catch {
      return dateString;
    }
  };

  // ✅ اقتراح أوقات متاحة (يمكن تحسينه لاحقاً)
  const getSuggestedTimes = () => {
    // للآن نعرض جميع الأوقات، يمكن تحسينه لإخفاء الأوقات المحجوزة
    return adminTimeSlots.slice(0, 6); // أول 6 أوقات كاقتراحات
  };

  // ✅ لا نعرض شيئاً إذا لم يكن الـ modal مفتوح
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 🎨 Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2 rtl:space-x-reverse">
            <Plus className="w-5 h-5 text-green-600" />
            <span>إنشاء حجز جديد</span>
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 active:text-gray-700 transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 📝 نموذج الحجز الجديد */}
        <div className="space-y-6">
          {/* 👤 معلومات العميلة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميلة *</label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={bookingData.customerName}
                  onChange={(e) => updateBookingData({ customerName: e.target.value })}
                  className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    validationErrors.includes('name')
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="أدخل اسم العميلة"
                  disabled={isSaving}
                />
              </div>
              {validationErrors.includes('name') && (
                <p className="text-red-500 text-xs mt-1">اسم العميلة مطلوب</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={bookingData.customerPhone}
                  onChange={(e) => updateBookingData({ customerPhone: e.target.value })}
                  className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    validationErrors.includes('phone') || validationErrors.includes('phone-format')
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="+90 5XX XXX XX XX"
                  dir="ltr"
                  disabled={isSaving}
                />
              </div>
              {validationErrors.includes('phone') && (
                <p className="text-red-500 text-xs mt-1">رقم الهاتف مطلوب</p>
              )}
              {validationErrors.includes('phone-format') && (
                <p className="text-red-500 text-xs mt-1">تنسيق رقم الهاتف غير صحيح</p>
              )}
            </div>
          </div>

          {/* 📅 التاريخ والوقت */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-3 flex items-center space-x-2 rtl:space-x-reverse">
              <Calendar className="w-4 h-4" />
              <span>اختيار التاريخ والوقت</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التاريخ *{' '}
                  {bookingData.selectedDate && `- ${formatDateDisplay(bookingData.selectedDate)}`}
                </label>
                <input
                  type="date"
                  value={bookingData.selectedDate}
                  onChange={(e) => updateBookingData({ selectedDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    validationErrors.includes('date')
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  disabled={isSaving}
                  min={new Date().toISOString().split('T')[0]} // منع التواريخ السابقة
                />
                {validationErrors.includes('date') && (
                  <p className="text-red-500 text-xs mt-1">التاريخ مطلوب</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوقت *</label>
                <div className="relative">
                  <Clock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={bookingData.selectedTime}
                    onChange={(e) => updateBookingData({ selectedTime: e.target.value })}
                    className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      validationErrors.includes('time')
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    disabled={isSaving}
                  >
                    <option value="">اختر الوقت</option>
                    {adminTimeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.includes('time') && (
                  <p className="text-red-500 text-xs mt-1">الوقت مطلوب</p>
                )}
              </div>
            </div>

            {/* 💡 اقتراحات أوقات سريعة */}
            {bookingData.selectedDate && !bookingData.selectedTime && (
              <div className="mt-3">
                <p className="text-sm text-green-700 mb-2">⚡ أوقات مقترحة:</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedTimes().map((time) => (
                    <button
                      key={time}
                      onClick={() => updateBookingData({ selectedTime: time })}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full active:bg--green-200 transition-colors"
                      disabled={isSaving}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-green-600 bg-green-100 p-2 rounded">
              💡 الأدمن يستطيع الحجز في أي وقت حتى لو كان محجوز أو مقفل
            </div>
          </div>

          {/* 🛍️ الخدمات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              الخدمات المطلوبة * ({bookingData.selectedServices.length} خدمة مختارة)
            </label>

            <div
              className={`bg-gray-50 p-4 rounded-lg border max-h-60 overflow-y-auto transition-colors ${
                validationErrors.includes('services')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allServices.map((service) => (
                  <div
                    key={service.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      bookingData.selectedServices.includes(service.id)
                        ? 'border-green-300 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-white active:border-green-200 active:shadow-sm'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isSaving && toggleService(service.id)}
                  >
                    <div className="flex items-center w-full">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                          bookingData.selectedServices.includes(service.id)
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {bookingData.selectedServices.includes(service.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{service.nameAr}</div>
                        <div className="text-xs text-gray-500">
                          {service.category} • {service.duration} دقيقة • {service.price} ليرة
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {bookingData.selectedServices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>لم يتم اختيار أي خدمة</p>
                  <p className="text-sm">انقر على الخدمات لاختيارها</p>
                </div>
              )}
            </div>

            {validationErrors.includes('services') && (
              <p className="text-red-500 text-xs mt-1">يجب اختيار خدمة واحدة على الأقل</p>
            )}

            {/* 🏷️ عرض الخدمات المختارة */}
            {bookingData.selectedServices.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-2 flex items-center space-x-2 rtl:space-x-reverse">
                  <Sparkles className="w-4 h-4" />
                  <span>الخدمات المختارة:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bookingData.selectedServices.map((serviceId, serviceIndex) => {
                    const service = allServices.find((s) => s.id === serviceId);
                    const serviceColor = getServiceColor(serviceId);

                    return (
                      <span
                        key={`new-selected-service-${serviceId}-${serviceIndex}`}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${serviceColor} transition-all`}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {service?.nameAr || `خدمة ${serviceId}`}
                        <button
                          onClick={() => !isSaving && toggleService(serviceId)}
                          className="ml-1 active:opacity-70 transition-opacity"
                          disabled={isSaving}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 📝 ملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية</label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => updateBookingData({ notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
              rows={3}
              placeholder="ملاحظات إضافية عن الحجز..."
              disabled={isSaving}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {(bookingData.notes || '').length}/500 حرف
            </div>
          </div>
        </div>

        {/* 🎯 أزرار العمل */}
        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6 pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg active:bg--gray-50 transition-colors"
            disabled={isSaving}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg active:bg--green-700 flex items-center space-x-2 rtl:space-x-reverse transition-all ${
              isSaving || bookingData.selectedServices.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={isSaving || bookingData.selectedServices.length === 0}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>إنشاء الحجز</span>
              </>
            )}
          </button>
        </div>

        {/* ⚠️ عرض أخطاء التحقق */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium mb-1">يرجى إكمال البيانات المطلوبة:</p>
            <ul className="text-red-600 text-xs space-y-1">
              {validationErrors.includes('name') && <li>• اسم العميلة</li>}
              {validationErrors.includes('phone') && <li>• رقم الهاتف</li>}
              {validationErrors.includes('phone-format') && <li>• تنسيق رقم الهاتف صحيح</li>}
              {validationErrors.includes('date') && <li>• التاريخ</li>}
              {validationErrors.includes('time') && <li>• الوقت</li>}
              {validationErrors.includes('services') && <li>• اختيار خدمة واحدة على الأقل</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBookingModal;
