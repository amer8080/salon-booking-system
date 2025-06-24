'use client'
import { logError } from '@/lib/logger-client';

import { useState } from 'react'
import { 
  Sparkles, 
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface NewService {
  nameAr: string
  nameEn: string
  nameTr: string
  category: string
  price: number
  duration: number
  description: string
}

export default function AdminServicesNewPage() {
  const [service, setService] = useState<NewService>({
    nameAr: '',
    nameEn: '',
    nameTr: '',
    category: 'hair',
    price: 0,
    duration: 30,
    description: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // فئات الخدمات
  const categories = [
    { value: 'hair', label: 'الشعر' },
    { value: 'makeup', label: 'المكياج' },
    { value: 'nails', label: 'الأظافر' },
    { value: 'skincare', label: 'العناية بالبشرة' }
  ]

  const handleSubmit = async () => {
    // التحقق من البيانات
    if (!service.nameAr || !service.nameEn || !service.nameTr || !service.category || service.price <= 0 || service.duration <= 0) {
      setError('جميع البيانات الأساسية مطلوبة والقيم يجب أن تكون أكبر من صفر')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // إعادة تعيين النموذج
        setService({
          nameAr: '',
          nameEn: '',
          nameTr: '',
          category: 'hair',
          price: 0,
          duration: 30,
          description: ''
        })
        
        // إعادة توجيه بعد 2 ثانية
        setTimeout(() => {
          window.location.href = '/admin/services'
        }, 2000)
      } else {
        setError(data.error || 'فشل في إضافة الخدمة')
      }
    } catch (error) {
      logError('خطأ في إضافة الخدمة:', error)
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof NewService, value: string | number) => {
    setService(prev => ({
      ...prev,
      [field]: value
    }))
    
    // إخفاء رسائل الخطأ عند التعديل
    if (error) setError('')
    if (success) setSuccess(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button 
                onClick={() => window.location.href = '/admin/services'}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5 ml-2" />
                إدارة الخدمات
              </button>
              <div className="w-8 h-8 border-r border-gray-300"></div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">إضافة خدمة جديدة</h1>
                  <p className="text-sm text-gray-600">إضافة خدمة جديدة للصالون</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
              <p className="text-green-700">تم إضافة الخدمة بنجاح! سيتم إعادة توجيهك...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Service Names */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">أسماء الخدمة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم بالعربية *
                  </label>
                  <input
                    type="text"
                    value={service.nameAr}
                    onChange={(e) => handleInputChange('nameAr', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="مثل: قص شعر"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم بالإنجليزية *
                  </label>
                  <input
                    type="text"
                    value={service.nameEn}
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g: Hair Cut"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم بالتركية *
                  </label>
                  <input
                    type="text"
                    value={service.nameTr}
                    onChange={(e) => handleInputChange('nameTr', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="örn: Saç Kesimi"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">تفاصيل الخدمة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفئة *
                  </label>
                  <select
                    value={service.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر (ليرة تركية) *
                  </label>
                  <input
                    type="number"
                    value={service.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="مثل: 150"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدة (دقيقة) *
                  </label>
                  <input
                    type="number"
                    value={service.duration || ''}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="مثل: 45"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">الوصف</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الخدمة (اختياري)
                </label>
                <textarea
                  value={service.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="وصف مختصر للخدمة وما تشمله..."
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">معاينة الخدمة</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {service.nameAr || 'اسم الخدمة بالعربية'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">EN:</span> {service.nameEn || 'Service Name in English'}</p>
                      <p><span className="font-medium">TR:</span> {service.nameTr || 'Türkçe Hizmet Adı'}</p>
                    </div>
                  </div>
                  
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">السعر:</span>
                    <span className="font-bold text-purple-600">{service.price} ليرة</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">المدة:</span>
                    <span className="text-gray-800">{service.duration} دقيقة</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">الفئة:</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                      {categories.find(cat => cat.value === service.category)?.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">الحالة:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                      مفعل
                    </span>
                  </div>
                </div>

                {service.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                      {service.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 rtl:space-x-reverse pt-6 border-t">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'جاري الحفظ...' : 'حفظ الخدمة'}</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/services'}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
