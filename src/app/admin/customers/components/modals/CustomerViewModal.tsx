// components/modals/CustomerViewModal.tsx
'use client';

import { X, User, Calendar, Gift, Clock, Award, Star, TrendingUp } from 'lucide-react';
import { Customer } from '../../types/customer.types';

interface CustomerViewModalProps {
  customer: Customer;
  onClose: () => void;
}

export default function CustomerViewModal({ customer, onClose }: CustomerViewModalProps) {
  const getCustomerLevelColor = (level: string) => {
    switch (level) {
      case 'عميل VIP':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'عميل ذهبي':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'عميل فضي':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'عميل عادي':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getCustomerLevelIcon = (level: string) => {
    switch (level) {
      case 'عميل VIP':
        return <Award className="w-4 h-4" />;
      case 'عميل ذهبي':
        return <Star className="w-4 h-4" />;
      case 'عميل فضي':
        return <TrendingUp className="w-4 h-4" />;
      case 'عميل عادي':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <User className="w-5 h-5 ml-2 text-purple-600" />
            تفاصيل العميل
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Header */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">{customer.name}</h4>
              <p className="text-gray-600">{customer.phone}</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCustomerLevelColor(customer.customerLevel)}`}
              >
                {getCustomerLevelIcon(customer.customerLevel)}
                <span className="mr-1">{customer.customerLevel}</span>
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">إجمالي الزيارات</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{customer.totalVisits}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                <Gift className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">كوبونات متاحة</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{customer.availableCoupons}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">آخر زيارة</span>
              </div>
              <p className="text-sm font-bold text-purple-600">
                {customer.daysSinceLastVisit > 0
                  ? `منذ ${customer.daysSinceLastVisit} يوم`
                  : 'اليوم'}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">معلومات إضافية</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ أول زيارة:</span>
                <span className="font-medium">{formatDate(customer.firstVisit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ آخر زيارة:</span>
                <span className="font-medium">{formatDate(customer.lastVisit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">متوسط الفترة بين الزيارات:</span>
                <span className="font-medium">
                  {customer.avgDaysBetweenVisits > 0
                    ? `${customer.avgDaysBetweenVisits} يوم`
                    : 'غير محدد'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">اللغة المفضلة:</span>
                <span className="font-medium">
                  {customer.language === 'ar'
                    ? 'العربية'
                    : customer.language === 'en'
                      ? 'English'
                      : customer.language === 'tr'
                        ? 'Türkçe'
                        : 'غير محدد'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الحالة:</span>
                <span
                  className={`font-medium ${
                    customer.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div>
              <h5 className="font-medium text-gray-800 mb-2">ملاحظات:</h5>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700">{customer.notes}</p>
              </div>
            </div>
          )}

          {/* Recent Reservations */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">آخر الحجوزات</h5>
            {customer.recentReservations && customer.recentReservations.length > 0 ? (
              <div className="space-y-2">
                {customer.recentReservations.slice(0, 3).map((reservation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{formatDate(reservation.date)}</p>
                      <p className="text-xs text-gray-600">
                        حالة:{' '}
                        {reservation.status === 'confirmed'
                          ? 'مؤكد'
                          : reservation.status === 'completed'
                            ? 'مكتمل'
                            : 'ملغي'}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{reservation.totalPrice} ليرة</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">لا توجد حجوزات حديثة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
