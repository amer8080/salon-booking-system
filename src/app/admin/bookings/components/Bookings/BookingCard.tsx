'use client';
import { useState } from 'react';
import { Booking, Service } from '../../types/booking.types';
import { fromDatabaseTime, formatIstanbulDate, formatArabicDate } from '@/lib/timezone';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Sparkles,
  Edit,
  Trash2,
  Plus,
  X,
  Copy,
  MessageCircle,
  FileText,
  CheckCircle,
  Lock,
  Unlock,
} from 'lucide-react';

interface BookingCardProps {
  // بيانات الحجز (null للأوقات الفارغة)
  booking?: Booking | null;

  // بيانات الوقت للأوقات الفارغة
  date?: string;
  time?: string;

  // الخدمات المتاحة
  _services: Record<string, Service>;
  servicesWithCategories: Record<string, Service & { category: string }>;

  // دوال الألوان
  getServiceColor: (serviceId: string) => string;

  // دوال التفاعل
  onEdit?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
  onCreateNew?: (date: string, time: string) => void;
  onShowPhoneMenu?: (phone: string, customerName: string) => void;

  // حالات الإقفال
  isTimeBlocked?: boolean;
  onBlockTime?: (date: string, time: string) => void;
  onUnblockTime?: (date: string, time: string) => void;

  // التحكم في النافذة
  isOpen: boolean;
  onClose: () => void;

  // معرف فريد للموقع (لتجنب التعارض)
  position?: 'center' | 'top' | 'bottom';
}

export default function BookingCard({
  booking,
  date,
  time,
  _services,
  servicesWithCategories,
  getServiceColor,
  onEdit,
  onDelete,
  onCreateNew,
  onShowPhoneMenu,
  isTimeBlocked = false,
  onBlockTime,
  onUnblockTime,
  isOpen,
  onClose,
  position = 'center',
}: BookingCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showPhoneOptions, setShowPhoneOptions] = useState(false);

  if (!isOpen) return null;

  // تحديد نوع الكرت
  const isEmptySlot = !booking;
  const isBlocked = isTimeBlocked && isEmptySlot;

  // استخراج البيانات للعرض

  const displayTime = booking
    ? formatIstanbulDate(fromDatabaseTime(booking.startTime), 'time')
    : time || '';

  const displayDateArabic = booking
    ? formatArabicDate(fromDatabaseTime(booking.date))
    : formatArabicDate(new Date(date + 'T00:00:00'));

  // دوال التفاعل
  const handleEdit = () => {
    if (booking && onEdit) {
      onEdit(booking);
      onClose();
    }
  };

  const handleDelete = () => {
    if (showConfirmDelete && booking && onDelete) {
      onDelete(booking);
      onClose();
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleCreateNew = () => {
    if (isEmptySlot && onCreateNew && date && time) {
      onCreateNew(date, time);
      onClose();
    }
  };

  const handlePhoneAction = (action: 'copy' | 'whatsapp' | 'call') => {
    if (!booking?.customerPhone || !onShowPhoneMenu) return;

    const phone = booking.customerPhone;
    const name = booking.customerName;

    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(phone);
        alert('تم نسخ رقم الهاتف!');
        break;
      case 'whatsapp': {
        const message = `مرحباً ${name}، بخصوص موعدك في صالون ريم...`;
        const whatsappUrl = `https://wa.me/${phone.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        break;
      }
      case 'call':
        window.open(`tel:${phone}`, '_self');
        break;
    }
    setShowPhoneOptions(false);
  };

  const handleBlockToggle = () => {
    if (!date || !time) return;

    if (isBlocked && onUnblockTime) {
      onUnblockTime(date, time);
    } else if (!isBlocked && onBlockTime) {
      onBlockTime(date, time);
    }
    onClose();
  };

  // تحديد موقع النافذة
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'items-start pt-20';
      case 'bottom':
        return 'items-end pb-20';
      default:
        return 'items-center';
    }
  };

  const positionClasses = getPositionClasses();

  return (
    <div
      className={`fixed inset-0 z-50 flex ${positionClasses} justify-center bg-black bg-opacity-50 backdrop-blur-sm`}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* هيدر الكرت */}
        <div
          className={`px-6 py-4 border-b border-gray-200 ${
            isEmptySlot ? (isBlocked ? 'bg-red-50' : 'bg-green-50') : 'bg-purple-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {isEmptySlot ? (
                isBlocked ? (
                  <Lock className="w-6 h-6 text-red-600" />
                ) : (
                  <Plus className="w-6 h-6 text-green-600" />
                )
              ) : (
                <CheckCircle className="w-6 h-6 text-purple-600" />
              )}

              <div>
                <h3
                  className={`text-lg font-bold ${
                    isEmptySlot
                      ? isBlocked
                        ? 'text-red-700'
                        : 'text-green-700'
                      : 'text-purple-700'
                  }`}
                >
                  {isEmptySlot ? (isBlocked ? 'وقت مُقفل' : 'وقت فارغ') : 'حجز مُأكد'}
                </h3>
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{displayDateArabic}</span>
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-mono">{displayTime}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 active:bg--gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* محتوى الكرت */}
        <div className="p-6">
          {/* بيانات الحجز */}
          {!isEmptySlot && booking && (
            <div className="space-y-4 mb-6">
              {/* اسم العميل */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="text-sm text-gray-500">اسم العميل</label>
                  <p className="font-semibold text-gray-800">{booking.customerName}</p>
                </div>
              </div>

              {/* رقم الهاتف */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="text-sm text-gray-500">رقم الهاتف</label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <p className="font-mono text-gray-800">{booking.customerPhone}</p>
                    <button
                      onClick={() => setShowPhoneOptions(!showPhoneOptions)}
                      className="p-1 active:bg--gray-100 rounded transition-colors"
                    >
                      <Phone className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>

                  {/* خيارات الهاتف */}
                  {showPhoneOptions && (
                    <div className="mt-2 flex space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handlePhoneAction('copy')}
                        className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 bg-gray-100 active:bg--gray-200 rounded-lg text-sm transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </button>
                      <button
                        onClick={() => handlePhoneAction('whatsapp')}
                        className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 bg-green-100 active:bg--green-200 text-green-700 rounded-lg text-sm transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>واتساب</span>
                      </button>
                      <button
                        onClick={() => handlePhoneAction('call')}
                        className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 bg-blue-100 active:bg--blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>اتصال</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* الخدمات */}
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <Sparkles className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <label className="text-sm text-gray-500">الخدمات المطلوبة</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {booking.serviceIds && booking.serviceIds.length > 0 ? (
                      booking.serviceIds.map((serviceId) => {
                        const service = servicesWithCategories[serviceId];
                        if (!service) return null;

                        return (
                          <span
                            key={serviceId}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getServiceColor(serviceId)}`}
                          >
                            {service.name}
                          </span>
                        );
                      })
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        لا توجد خدمات
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* الملاحظات */}
              {booking.notes && (
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <label className="text-sm text-gray-500">ملاحظات</label>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg mt-1">{booking.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* رسالة للأوقات الفارغة */}
          {isEmptySlot && !isBlocked && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">وقت متاح للحجز</h4>
              <p className="text-gray-600 mb-4">يمكنك إنشاء حجز جديد في هذا الوقت</p>
            </div>
          )}

          {/* رسالة للأوقات المقفلة */}
          {isBlocked && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">وقت مُقفل</h4>
              <p className="text-gray-600 mb-4">هذا الوقت غير متاح للحجز حالياً</p>
            </div>
          )}

          {/* الأزرار */}
          <div className="border-t border-gray-200 pt-4">
            {!isEmptySlot && booking && (
              <div className="flex space-x-3 rtl:space-x-reverse">
                {/* زر التعديل */}
                <button
                  onClick={handleEdit}
                  className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse bg-blue-600 active:bg--blue-700 text-white px-4 py-3 rounded-xl transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>تعديل الحجز</span>
                </button>

                {/* زر الحذف */}
                <button
                  onClick={handleDelete}
                  className={`flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-3 rounded-xl transition-colors ${
                    showConfirmDelete
                      ? 'bg-red-600 active:bg--red-700 text-white'
                      : 'bg-red-100 active:bg--red-200 text-red-700'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{showConfirmDelete ? 'تأكيد الحذف' : 'حذف الحجز'}</span>
                </button>
              </div>
            )}

            {isEmptySlot && (
              <div className="space-y-3">
                {!isBlocked && (
                  <button
                    onClick={handleCreateNew}
                    className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-green-600 active:bg--green-700 text-white px-4 py-3 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء حجز جديد</span>
                  </button>
                )}

                {/* زر الإقفال/الفتح */}
                {(onBlockTime || onUnblockTime) && (
                  <button
                    onClick={handleBlockToggle}
                    className={`w-full flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-3 rounded-xl transition-colors ${
                      isBlocked
                        ? 'bg-green-100 active:bg--green-200 text-green-700'
                        : 'bg-orange-100 active:bg--orange-200 text-orange-700'
                    }`}
                  >
                    {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>{isBlocked ? 'فتح الوقت' : 'إقفال الوقت'}</span>
                  </button>
                )}
              </div>
            )}

            {/* زر إلغاء للحذف */}
            {showConfirmDelete && (
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="w-full mt-2 flex items-center justify-center space-x-2 rtl:space-x-reverse bg-gray-100 active:bg--gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>إلغاء</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

