// src/app/admin/bookings/components/UI/PhoneMenu.tsx
'use client'

import React from 'react'
import { Phone, Copy, MessageCircle, X } from 'lucide-react'

interface PhoneMenuProps {
  isOpen: boolean
  phone: string
  customerName: string
  onClose: () => void
  position?: { x: number; y: number }
}

export default function PhoneMenu({
  isOpen,
  phone,
  customerName,
  onClose,
  position
}: PhoneMenuProps) {

  if (!isOpen) return null

  // دالة نسخ رقم الهاتف
  const copyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText(phone)
      // يمكن إضافة toast notification هنا
      onClose()
    } catch {
      // fallback للمتصفحات القديمة
      const textArea = document.createElement('textarea')
      textArea.value = phone
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      onClose()
    }
  }

  // دالة فتح واتساب
  const openWhatsApp = () => {
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    const message = `مرحباً ${customerName}، بخصوص موعدك في صالون ريم...`
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    onClose()
  }

  // دالة الاتصال المباشر
  const makeCall = () => {
    window.open(`tel:${phone}`, '_self')
    onClose()
  }

  // تحديد موضع القائمة
  const menuStyle = position
    ? {
        position: 'absolute' as const,
        top: position.y + 10,
        left: position.x - 100,
        zIndex: 1000
      }
    : {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      }

  return (
    <>
      {/* Overlay للإغلاق عند الضغط خارج القائمة */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-[999]"
        onClick={onClose}
      />

      {/* القائمة الأساسية */}
      <div
        style={menuStyle}
        className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[200px]"
      >
        {/* هيدر القائمة */}
        <div className="bg-purple-50 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Phone className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-800">خيارات الهاتف</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 active:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* رقم الهاتف */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700 font-mono">{phone}</span>
        </div>

        {/* خيارات القائمة */}
        <div className="py-2">
          {/* خيار النسخ */}
          <button
            onClick={copyPhoneNumber}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 active:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 group-active:bg-blue-200 transition-colors">
              <Copy className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 text-right">
              <span className="text-sm font-medium text-gray-800">نسخ الرقم</span>
              <p className="text-xs text-gray-500">نسخ إلى الحافظة</p>
            </div>
          </button>

          {/* خيار واتساب */}
          <button
            onClick={openWhatsApp}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 active:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 group-active:bg-green-200 transition-colors">
              <MessageCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 text-right">
              <span className="text-sm font-medium text-gray-800">فتح واتساب</span>
              <p className="text-xs text-gray-500">إرسال رسالة للعميل</p>
            </div>
          </button>

          {/* خيار الاتصال */}
          <button
            onClick={makeCall}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 active:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 group-active:bg-purple-200 transition-colors">
              <Phone className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 text-right">
              <span className="text-sm font-medium text-gray-800">اتصال مباشر</span>
              <p className="text-xs text-gray-500">فتح تطبيق الهاتف</p>
            </div>
          </button>
        </div>

        {/* معلومات إضافية */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <span className="text-xs text-gray-500">العميل: {customerName}</span>
        </div>
      </div>
    </>
  )
}



