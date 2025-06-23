// components/modals/CustomerAddModal.tsx
'use client'

import { X, Plus, Loader2 } from 'lucide-react'
import { CustomerFormData } from '../../types/customer.types'

interface CustomerAddModalProps {
  form: CustomerFormData
  onFormChange: (updates: Partial<CustomerFormData>) => void
  onAdd: () => Promise<boolean>
  onClose: () => void
  saving: boolean
  isValid: boolean
}

export default function CustomerAddModal({
  form,
  onFormChange,
  onAdd,
  onClose,
  saving,
  isValid
}: CustomerAddModalProps) {

  const handleAdd = async () => {
    const success = await onAdd()
    if (success) {
      alert('تم إضافة العميل بنجاح!')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">إضافة عميل جديد</h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onFormChange({ name: e.target.value })}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="أدخل اسم العميل"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => onFormChange({ phone: e.target.value })}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="+90 5XX XXX XX XX"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select
              value={form.status}
              onChange={(e) => onFormChange({ status: e.target.value })}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={(e) => onFormChange({ notes: e.target.value })}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              rows={3}
              placeholder="ملاحظات إضافية..."
            />
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          * الحقول المطلوبة
        </div>

        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleAdd}
            disabled={saving || !isValid}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 rtl:space-x-reverse"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الإضافة...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>إضافة العميل</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}