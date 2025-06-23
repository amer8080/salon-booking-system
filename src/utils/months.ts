import dayjs from 'dayjs'
import 'dayjs/locale/ar'

// 🔥 Array تلقائي للأشهر العربية
export const monthNames = Array.from({ length: 12 }, (_, i) => 
  dayjs().month(i).locale('ar').format('MMMM')
)

// 🎯 Functions مساعدة للتعامل مع الأشهر
export const getMonthName = (monthIndex: number): string => {
  if (monthIndex < 0 || monthIndex > 11) return 'غير محدد'
  return monthNames[monthIndex]
}

export const getAllMonthNames = (): string[] => monthNames

export const getCurrentMonthName = (): string => {
  return getMonthName(new Date().getMonth())
}

export const getMonthIndex = (monthName: string): number => {
  return monthNames.findIndex(name => name === monthName)
}

// 🌟 Functions إضافية مفيدة
export const isCurrentMonth = (monthIndex: number, year?: number): boolean => {
  const today = new Date()
  const currentYear = year || today.getFullYear()
  return today.getMonth() === monthIndex && today.getFullYear() === currentYear
}

export const formatMonthYear = (monthIndex: number, year: number): string => {
  return `${getMonthName(monthIndex)} ${year}`
}

// 📊 معلومات إضافية
export const getMonthInfo = (monthIndex: number) => {
  const today = new Date()
  return {
    name: getMonthName(monthIndex),
    index: monthIndex,
    isCurrent: monthIndex === today.getMonth(),
    arabicName: monthNames[monthIndex],
    englishName: dayjs().month(monthIndex).locale('en').format('MMMM')
  }
}

// 🔄 تحويل بين الأشهر
export const convertMonthNames = (locale: 'ar' | 'en' = 'ar'): string[] => {
  return Array.from({ length: 12 }, (_, i) => 
    dayjs().month(i).locale(locale).format('MMMM')
  )
}