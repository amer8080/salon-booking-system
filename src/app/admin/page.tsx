'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  Sparkles, 
  Settings, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  Shield,
  Plus,
  TrendingUp
} from 'lucide-react'

interface DashboardStats {
  totalBookings: number
  todayBookings: number
  pendingBookings: number
  totalCustomers: number
  totalServices: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    // تحميل إحصائيات لوحة التحكم
    fetchDashboardStats()
  }, [router])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || 'فشل في تحميل الإحصائيات')
      }
    } catch (error) {
      console.error('خطأ في تحميل إحصائيات لوحة التحكم:', error)
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const menuItems = [
    {
      title: 'الحجوزات',
      href: '/admin/bookings',
      icon: Calendar,
      description: 'إدارة جميع الحجوزات',
      color: 'from-blue-500 to-blue-600',
      count: stats?.totalBookings
    },
    {
      title: 'العملاء',
      href: '/admin/customers',
      icon: Users,
      description: 'إدارة بيانات العملاء',
      color: 'from-green-500 to-green-600',
      count: stats?.totalCustomers
    },
    {
      title: 'الخدمات',
      href: '/admin/services',
      icon: Sparkles,
      description: 'إدارة الخدمات والأسعار',
      color: 'from-purple-500 to-purple-600',
      count: stats?.totalServices
    },
    {
      title: 'الإعدادات',
      href: '/admin/settings',
      icon: Settings,
      description: 'إعدادات النظام',
      color: 'from-gray-500 to-gray-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">لوحة تحكم الأدمن</h1>
                <p className="text-sm text-gray-600">صالون ريم</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link 
                href="/"
                className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                الموقع الرئيسي
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 rtl:space-x-reverse text-red-600 hover:text-red-800 transition-colors duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            مرحباً بك في لوحة التحكم! 👋
          </h2>
          <p className="text-gray-600">
            إدارة شاملة لنظام حجوزات صالون ريم
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">حجوزات اليوم</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.todayBookings}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">حجوزات معلقة</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalCustomers}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الخدمات</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalServices}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} className="group">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  {item.count !== undefined && (
                    <span className="text-2xl font-bold text-gray-700">{item.count}</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Create Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">إجراءات سريعة</h3>
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/bookings/new"
              className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-purple-600">إنشاء حجز جديد</p>
              </div>
            </Link>

            <Link 
              href="/admin/services/new"
              className="flex items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-green-600">إضافة خدمة جديدة</p>
              </div>
            </Link>

            <Link 
              href="/admin/customers"
              className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
            >
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-blue-600">إدارة العملاء</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}