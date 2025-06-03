'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Calendar, 
  Gift,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Copy,
  ArrowLeft,
  LogOut,
  Plus,
  X,
  Save,
  Star,
  Award,
  Clock,
  TrendingUp,
  User
} from 'lucide-react'

interface Customer {
  id: number
  name: string
  phone: string
  firstVisit: string
  totalVisits: number
  lastVisit: string
  status: string
  language: string
  notes?: string
  createdAt: string
  totalReservations: number
  availableCoupons: number
  usedCoupons: number
  customerLevel: string
  daysSinceLastVisit: number
  avgDaysBetweenVisits: number
  recentReservations: any[]
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // حالات البحث والفلترة
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visitsFilter, setVisitsFilter] = useState('0')
  const [lastVisitFilter, setLastVisitFilter] = useState('all')
  
  // حالات النوافذ
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  
  // بيانات النماذج
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    notes: '',
    status: 'active'
  })
  
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    notes: '',
    status: 'active'
  })

  const [showPhoneMenu, setShowPhoneMenu] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    
    fetchCustomers()
  }, [router])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, statusFilter, visitsFilter, lastVisitFilter])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        minVisits: visitsFilter,
        lastVisitDays: lastVisitFilter
      })
      
      const response = await fetch(`/api/admin/customers?${params}`)
      const data = await response.json()

      if (data.success) {
        setCustomers(data.customers)
      } else {
        setError(data.error || 'فشل في تحميل العملاء')
      }
    } catch (error) {
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    // البحث
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      )
    }

    // فلترة الحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter)
    }

    // فلترة الزيارات
    if (visitsFilter !== '0') {
      filtered = filtered.filter(customer => customer.totalVisits >= parseInt(visitsFilter))
    }

    // فلترة آخر زيارة
    if (lastVisitFilter !== 'all') {
      filtered = filtered.filter(customer => customer.daysSinceLastVisit <= parseInt(lastVisitFilter))
    }

    setFilteredCustomers(filtered)
  }

  const openEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes || '',
      status: customer.status
    })
  }

  const saveCustomer = async () => {
    if (!editingCustomer) return

    try {
      const response = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (data.success) {
        setEditingCustomer(null)
        fetchCustomers()
        alert('تم تحديث بيانات العميل بنجاح!')
      } else {
        alert('فشل في تحديث العميل: ' + data.error)
      }
    } catch (error) {
      alert('خطأ في الاتصال بالخادم')
    }
  }

  const addCustomer = async () => {
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      })

      const data = await response.json()

      if (data.success) {
        setAddingCustomer(false)
        setAddForm({ name: '', phone: '', notes: '', status: 'active' })
        fetchCustomers()
        alert('تم إضافة العميل بنجاح!')
      } else {
        alert('فشل في إضافة العميل: ' + data.error)
      }
    } catch (error) {
      alert('خطأ في الاتصال بالخادم')
    }
  }

  const deleteCustomer = async () => {
    if (!deletingCustomer) return

    try {
      const response = await fetch(`/api/admin/customers/${deletingCustomer.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setDeletingCustomer(null)
        fetchCustomers()
        alert('تم حذف العميل بنجاح!')
      } else {
        alert('فشل في حذف العميل: ' + data.error)
      }
    } catch (error) {
      alert('خطأ في الاتصال بالخادم')
    }
  }

  const copyPhoneNumber = (phone: string) => {
    navigator.clipboard.writeText(phone)
    setShowPhoneMenu(null)
    alert('تم نسخ رقم الهاتف')
  }

  const openWhatsApp = (phone: string, customerName: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    const message = `مرحباً ${customerName}، من صالون ريم...`
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    setShowPhoneMenu(null)
  }

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
    setShowPhoneMenu(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">جاري تحميل العملاء...</p>
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
              <Link href="/admin" className="flex items-center text-purple-600 hover:text-purple-800">
                <ArrowLeft className="w-5 h-5 ml-2" />
                العودة للوحة التحكم
              </Link>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <h1 className="text-xl font-bold text-gray-800">إدارة العملاء</h1>
              <Users className="w-6 h-6 text-purple-600" />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 hover:text-red-800 transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* شريط البحث والفلترة */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">البحث والفلترة</h2>
            <button
              onClick={() => setAddingCustomer(true)}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عميل جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">عدد الزيارات</label>
              <select
                value={visitsFilter}
                onChange={(e) => setVisitsFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="0">جميع العملاء</option>
                <option value="1">زيارة واحدة فأكثر</option>
                <option value="5">5 زيارات فأكثر</option>
                <option value="10">10 زيارات فأكثر</option>
                <option value="20">20 زيارة فأكثر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">آخر زيارة</label>
              <select
                value={lastVisitFilter}
                onChange={(e) => setLastVisitFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">جميع الفترات</option>
                <option value="7">آخر أسبوع</option>
                <option value="30">آخر شهر</option>
                <option value="90">آخر 3 أشهر</option>
                <option value="180">آخر 6 أشهر</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 mt-4">
            <span>إجمالي العملاء: {filteredCustomers.length}</span>
            <span>عملاء نشطين: {filteredCustomers.filter(c => c.status === 'active').length}</span>
            <span>عملاء VIP: {filteredCustomers.filter(c => c.customerLevel === 'عميل VIP').length}</span>
          </div>
        </div>

        {/* قائمة العملاء */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              قائمة العملاء ({filteredCustomers.length})
            </h3>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500">لا توجد عملاء</p>
              <p className="text-sm text-gray-400">جرب تغيير معايير البحث أو إضافة عملاء جدد</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-1">
                            <h4 className="text-lg font-semibold text-gray-900">{customer.name}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCustomerLevelColor(customer.customerLevel)}`}>
                              {getCustomerLevelIcon(customer.customerLevel)}
                              <span className="mr-1">{customer.customerLevel}</span>
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              customer.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                          
                          <div className="relative inline-block">
                            <button
                              onClick={() => setShowPhoneMenu(showPhoneMenu === customer.phone ? null : customer.phone)}
                              className="flex items-center space-x-2 rtl:space-x-reverse text-purple-600 hover:text-purple-800 text-sm"
                            >
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </button>
                            
                            {showPhoneMenu === customer.phone && (
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
                            )}
                          </div>
                        </div>
                      </div>

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

                      {customer.notes && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-gray-700">{customer.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4">
                      <button
                        onClick={() => setViewingCustomer(customer)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => openEditCustomer(customer)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="تعديل البيانات"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setDeletingCustomer(customer)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="حذف العميل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* نافذة عرض تفاصيل العميل */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <User className="w-5 h-5 ml-2 text-purple-600" />
                تفاصيل العميل
              </h3>
              <button
                onClick={() => setViewingCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{viewingCustomer.name}</h4>
                  <p className="text-gray-600">{viewingCustomer.phone}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCustomerLevelColor(viewingCustomer.customerLevel)}`}>
                    {getCustomerLevelIcon(viewingCustomer.customerLevel)}
                    <span className="mr-1">{viewingCustomer.customerLevel}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">إجمالي الزيارات</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{viewingCustomer.totalVisits}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">كوبونات متاحة</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{viewingCustomer.availableCoupons}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800">آخر زيارة</span>
                  </div>
                  <p className="text-sm font-bold text-purple-600">
                    {viewingCustomer.daysSinceLastVisit > 0 
                      ? `منذ ${viewingCustomer.daysSinceLastVisit} يوم`
                      : 'اليوم'
                    }
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-3">معلومات إضافية</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ أول زيارة:</span>
                    <span className="font-medium">{formatDate(viewingCustomer.firstVisit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ آخر زيارة:</span>
                    <span className="font-medium">{formatDate(viewingCustomer.lastVisit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">متوسط الفترة بين الزيارات:</span>
                    <span className="font-medium">
                      {viewingCustomer.avgDaysBetweenVisits > 0 
                        ? `${viewingCustomer.avgDaysBetweenVisits} يوم`
                        : 'غير محدد'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">اللغة المفضلة:</span>
                    <span className="font-medium">
                      {viewingCustomer.language === 'ar' ? 'العربية' : 
                       viewingCustomer.language === 'en' ? 'English' : 
                       viewingCustomer.language === 'tr' ? 'Türkçe' : 'غير محدد'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحالة:</span>
                    <span className={`font-medium ${
                      viewingCustomer.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {viewingCustomer.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
              </div>

              {viewingCustomer.notes && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">ملاحظات:</h5>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">{viewingCustomer.notes}</p>
                  </div>
                </div>
              )}

              <div>
                <h5 className="font-medium text-gray-800 mb-3">آخر الحجوزات</h5>
                {viewingCustomer.recentReservations && viewingCustomer.recentReservations.length > 0 ? (
                  <div className="space-y-2">
                    {viewingCustomer.recentReservations.slice(0, 3).map((reservation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{formatDate(reservation.date)}</p>
                          <p className="text-xs text-gray-600">
                            حالة: {reservation.status === 'confirmed' ? 'مؤكد' : 
                                   reservation.status === 'completed' ? 'مكتمل' : 'ملغي'}
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
      )}

      {/* نافذة تعديل العميل */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">تعديل بيانات العميل</h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => setEditingCustomer(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={saveCustomer}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة عميل جديد */}
      {addingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">إضافة عميل جديد</h3>
              <button
                onClick={() => setAddingCustomer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="أدخل اسم العميل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                <input
                  type="text"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+90 5XX XXX XX XX"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({...addForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm({...addForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6">
              <button
                onClick={() => setAddingCustomer(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={addCustomer}
                disabled={!addForm.name || !addForm.phone}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة العميل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      {deletingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-red-600">تأكيد حذف العميل</h3>
              <button
                onClick={() => setDeletingCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
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
                  <p className="font-medium text-gray-800">{deletingCustomer.name}</p>
                  <p className="text-sm text-gray-600">{deletingCustomer.phone}</p>
                </div>
              </div>

              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  ⚠️ تحذير: سيتم حذف العميل وجميع بياناته نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={deleteCustomer}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف نهائياً</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showPhoneMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowPhoneMenu(null)}
        />
      )}
    </div>
  )
}