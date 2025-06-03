'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        // حفظ جلسة بسيطة في localStorage
        localStorage.setItem('adminToken', data.token)
        router.push('/admin')
      } else {
        setError(data.error || 'خطأ في تسجيل الدخول')
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* العودة للموقع الرئيسي */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-white/70 hover:text-white transition-colors duration-300"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للموقع الرئيسي
          </Link>
        </div>

        {/* بطاقة تسجيل الدخول */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* العنوان */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              لوحة تحكم الأدمن
            </h1>
            <p className="text-white/70">
              تسجيل دخول صالون ريم
            </p>
          </div>

          {/* نموذج تسجيل الدخول */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* حقل اسم المستخدم */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 pr-12"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* معلومات تجريبية */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-200 text-sm text-center mb-2">
                <strong>بيانات تجريبية:</strong>
              </p>
              <p className="text-blue-200 text-xs text-center">
                المستخدم: <code className="bg-white/20 px-2 py-1 rounded">admin</code> | 
                كلمة المرور: <code className="bg-white/20 px-2 py-1 rounded">admin123</code>
              </p>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* معلومات إضافية */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-sm">صالون ريم - لوحة التحكم</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}