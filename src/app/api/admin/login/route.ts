import { NextRequest, NextResponse } from 'next/server'

// بيانات الأدمن المؤقتة (بسيطة للتطوير)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
}

// توليد رمز مميز بسيط (للتطوير فقط)
function generateSimpleToken() {
  return `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

export async function POST(_request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // التحقق من البيانات المطلوبة
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // التحقق من صحة البيانات
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // تسجيل دخول ناجح
      const token = generateSimpleToken()
      
      
      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        token: token,
        user: {
          username: username,
          role: 'admin',
          loginTime: new Date().toISOString()
        }
      })
    } else {
      // بيانات خاطئة
      
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في الخادم',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
