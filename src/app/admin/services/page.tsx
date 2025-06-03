'use client'

import { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Eye,
  EyeOff,
  ArrowLeft,
  Save,
  X,
  AlertTriangle
} from 'lucide-react'

interface Service {
  id: string
  name: string
  nameAr: string
  nameEn: string
  nameTr: string
  category: string
  price: number
  duration: number
  description: string | null
  isActive: boolean
  displayOrder: number
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // فئات الخدمات
  const categories = [
    { value: 'all', label: 'جميع الفئات' },
    { value: 'hair', label: 'الشعر' },
    { value: 'makeup', label: 'المكياج' },
    { value: 'nails', label: 'الأظافر' },
    { value: 'skincare', label: 'العناية بالبشرة' }
  ]

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    // فلترة الخدمات
    let filtered = services

    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.nameTr.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter)
    }

    setFilteredServices(filtered)
  }, [services, searchTerm, categoryFilter])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services')
      const data = await response.json()

      if (data.success) {
        setServices(data.services)
      } else {
        setError(data.error || 'فشل في تحميل الخدمات')
      }
    } catch (error) {
      console.error('خطأ في تحميل الخدمات:', error)
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const toggleServiceStatus = async (serviceId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        setServices(services.map(service => 
          service.id === serviceId 
            ? { ...service, isActive: newStatus }
            : service
        ))
      } else {
        alert('فشل في تحديث حالة الخدمة')
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الخدمة:', error)
      alert('خطأ في الاتصال بالخادم')
    }
  }

  const deleteService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setServices(services.filter(service => service.id !== serviceId))
        setShowDeleteConfirm(null)
      } else {
        alert('فشل في حذف الخدمة')
      }
    } catch (error) {
      console.error('خطأ في حذف الخدمة:', error)
      alert('خطأ في الاتصال بالخادم')
    }
  }

  const updateService = async (updatedService: Service) => {
    try {
      const response = await fetch(`/api/admin/services/${updatedService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedService),
      })

      const data = await response.json()

      if (data.success) {
        setServices(services.map(service => 
          service.id === updatedService.id ? updatedService : service
        ))
        setEditingService(null)
      } else {
        alert('فشل في تحديث الخدمة')
      }
    } catch (error) {
      console.error('خطأ في تحديث الخدمة:', error)
      alert('خطأ في الاتصال بالخادم')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">جاري تحميل الخدمات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button 
                onClick={() => window.location.href = '/admin'}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5 ml-2" />
                لوحة التحكم
              </button>
              <div className="w-8 h-8 border-r border-gray-300"></div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">إدارة الخدمات</h1>
                  <p className="text-sm text-gray-600">إضافة وتعديل خدمات الصالون</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.href = '/admin/services/new'}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة خدمة جديدة</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في الخدمات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            عرض {filteredServices.length} من {services.length} خدمة
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              {/* Service Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{service.nameAr}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">EN:</span> {service.nameEn}</p>
                    <p><span className="font-medium">TR:</span> {service.nameTr}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleServiceStatus(service.id, !service.isActive)}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    service.isActive 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {service.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              {/* Service Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">السعر:</span>
                  <span className="font-bold text-purple-600">{service.price} ليرة</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">المدة:</span>
                  <span className="text-gray-800">{service.duration} دقيقة</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">الفئة:</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                    {categories.find(cat => cat.value === service.category)?.label || service.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">الحالة:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    service.isActive 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {service.isActive ? 'مفعل' : 'معطل'}
                  </span>
                </div>
              </div>

              {/* Service Description */}
              {service.description && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {service.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setEditingService(service)}
                  className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-300"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(service.id)}
                  className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">لا توجد خدمات تطابق البحث</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">تعديل الخدمة</h2>
                <button
                  onClick={() => setEditingService(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم بالعربية
                    </label>
                    <input
                      type="text"
                      value={editingService.nameAr}
                      onChange={(e) => setEditingService({
                        ...editingService,
                        nameAr: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم بالإنجليزية
                    </label>
                    <input
                      type="text"
                      value={editingService.nameEn}
                      onChange={(e) => setEditingService({
                        ...editingService,
                        nameEn: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم بالتركية
                    </label>
                    <input
                      type="text"
                      value={editingService.nameTr}
                      onChange={(e) => setEditingService({
                        ...editingService,
                        nameTr: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر (ليرة)
                    </label>
                    <input
                      type="number"
                      value={editingService.price}
                      onChange={(e) => setEditingService({
                        ...editingService,
                        price: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدة (دقيقة)
                    </label>
                    <input
                      type="number"
                      value={editingService.duration}
                      onChange={(e) => setEditingService({
                        ...editingService,
                        duration: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفئة
                    </label>
                    <select
                      value={editingService.category}
                      onChange={(e) => setEditingService({
                        ...editingService,
                        category: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      {categories.slice(1).map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({
                      ...editingService,
                      description: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="وصف مختصر للخدمة..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse mt-6">
                <button
                  onClick={() => updateService(editingService)}
                  className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التغييرات</span>
                </button>
                
                <button
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => deleteService(showDeleteConfirm)}
                  className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف</span>
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}