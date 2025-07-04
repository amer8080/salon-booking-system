// components/modals/CustomerDeleteModal.tsx
'use client';

import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Customer } from '../../types/customer.types';

interface CustomerDeleteModalProps {
  customer: Customer;
  onDelete: () => Promise<boolean>;
  onClose: () => void;
  deleting: boolean;
}

export default function CustomerDeleteModal({
  customer,
  onDelete,
  onClose,
  deleting,
}: CustomerDeleteModalProps) {
  const handleDelete = async () => {
    const success = await onDelete();
    if (success) {
      alert('تم حذف العميل بنجاح!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-red-600">تأكيد حذف العميل</h3>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{customer.name}</p>
              <p className="text-sm text-gray-600">{customer.phone}</p>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-2">تحذير: هذا الإجراء لا يمكن التراجع عنه!</p>
                <ul className="space-y-1 text-xs">
                  <li>• سيتم حذف العميل وجميع بياناته نهائياً</li>
                  <li>• سيتم حذف تاريخ جميع الحجوزات المرتبطة</li>
                  <li>• لن يكون بالإمكان استرداد هذه البيانات</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">معلومات العميل:</p>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">إجمالي الزيارات:</span>
                <span className="mr-1">{customer.totalVisits}</span>
              </div>
              <div>
                <span className="font-medium">آخر زيارة:</span>
                <span className="mr-1">
                  {customer.daysSinceLastVisit > 0
                    ? `منذ ${customer.daysSinceLastVisit} يوم`
                    : 'اليوم'}
                </span>
              </div>
              <div>
                <span className="font-medium">الكوبونات:</span>
                <span className="mr-1">{customer.availableCoupons}</span>
              </div>
              <div>
                <span className="font-medium">المستوى:</span>
                <span className="mr-1">{customer.customerLevel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2 rtl:space-x-reverse"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>حذف نهائياً</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
