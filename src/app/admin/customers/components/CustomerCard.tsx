// components/CustomerCard.tsx
'use client'

import { useState } from 'react'
import { 
  Phone, 
  Calendar, 
  Gift, 
  Clock, 
  TrendingUp, 
  User, 
  Eye, 
  Edit, 
  Trash2, 
  MessageCircle, 
  Copy,
  Award,
  Star
} from 'lucide-react'
import { Customer } from '../types/customer.types'

interface CustomerCardProps {
  customer: Customer
  onView: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

export default function CustomerCard({ customer, onView, onEdit, onDelete }: CustomerCardProps) {
  const [showPhoneMenu, setShowPhoneMenu] = useState(false)

  const getCustomerLevelColor = (level: string) => {
    switch (level) {
      case 'عميل VIP': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'عميل ذهبي': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'عميل فضي': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'عميل عادي': return 'bg-blue-100 text-blue-700 border-blue-300'
      default: return 'bg-green-100 text-green-700 border-green-300'
    }
  }

  const getCustomerLevelIcon = (level: string) => {
    switch (level) {
      case 'عميل VIP': return <Award className="w-4 h-4" />
      case 'عميل ذهبي': return <Star className="w-4 h-4" />
      case 'عميل فضي': return <TrendingUp className="w-4 h-4" />
      case 'عميل عادي': return <User className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const copyPhoneNumber = (phone: string) => {
    navigator.clipboard.writeText(phone)
    setShowPhoneMenu(false)
    alert('تم نسخ رقم الهاتف')
  }

  const openWhatsApp = (phone: string, customerName: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    const message = `مرحباً ${customerName}، من صالون ريم...`
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    setShowPhoneMenu(false)
  }

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
    setShowPhoneMenu(false)
  }

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Customer Header */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-1">
                <h4 className="text-lg font-semibold text-gray-900">{customer.name}</h4>
                
                {/* Customer Level Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCustomerLevelColor(customer.customerLevel)}`}>
                  {getCustomerLevelIcon(customer.customerLevel)}
                  <span className="mr-1">{customer.customerLevel}</span>
                </span>
                
                {/* Status Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  customer.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              
              {/* Phone with Menu */}
              <div className="relative inline-block">
                <button
                  onClick={() => setShowPhoneMenu(!showPhoneMenu)}
                  className="flex items-center space-x-2 rtl:space-x-reverse text-purple-600 hover:text-purple-800 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </button>
                
                {showPhoneMenu && (
                  <>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                      <button
                        onClick={() => makeCall(customer.phone)}
                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Phone className="w-4 h-4 text-green-600" />
                        <span>اتصال</span>
                      </button>
                      <button
                        onClick={() => openWhatsApp(customer.phone, customer.name)}
                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span>واتساب</span>
                      </button>
                      <button
                        onClick={() => copyPhoneNumber(customer.phone)}
                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Copy className="w-4 h-4 text-blue-600" />
                        <span>نسخ الرقم</span>
                      </button>
                    </div>
                    
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-5" 
                      onClick={() => setShowPhoneMenu(false)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
              <Calendar className="w-4 h-4" />
              <div>
                <p className="font-medium">{customer.totalVisits}</p>
                <p className="text-xs text-gray-500">زيارة</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
              <Gift className="w-4 h-4" />
              <div>
                <p className="font-medium">{customer.availableCoupons}</p>
                <p className="text-xs text-gray-500">كوبون متاح</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
              <Clock className="w-4 h-4" />
              <div>
                <p className="font-medium">{customer.daysSinceLastVisit}</p>
                <p className="text-xs text-gray-500">يوم مضى</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <div>
                <p className="font-medium">
                  {customer.avgDaysBetweenVisits > 0 ? customer.avgDaysBetweenVisits : '-'}
                </p>
                <p className="text-xs text-gray-500">متوسط الفترة</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4">
          <button
            onClick={() => onView(customer)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="عرض التفاصيل"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onEdit(customer)}
            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            title="تعديل البيانات"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(customer)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="حذف العميل"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}