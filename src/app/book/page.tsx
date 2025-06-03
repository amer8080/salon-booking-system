'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Phone, Shield, Calendar, Clock, CheckCircle, Sparkles, Loader2 } from 'lucide-react'
import { createIstanbulDate, formatIstanbulDate, parseIstanbulDate, formatArabicDate, getTodayIstanbul, isToday } from '@/lib/timezone'

interface Service {
 id: string
 name: string
 nameAr: string
 nameEn: string
 nameTr: string
 category: string
 price: number
 duration: number
 description?: string
}

export default function BookPage() {
 const [currentStep, setCurrentStep] = useState(1)
 const [phoneNumber, setPhoneNumber] = useState('')
 const [customerName, setCustomerName] = useState('')
 const [otpCode, setOtpCode] = useState('')
 const [isPhoneVerified, setIsPhoneVerified] = useState(false)
 const [isOtpSent, setIsOtpSent] = useState(false)
 const [selectedServices, setSelectedServices] = useState<string[]>([])
 const [selectedDate, setSelectedDate] = useState('')
 const [selectedTime, setSelectedTime] = useState('')
 
 const [services, setServices] = useState<Service[]>([])
 const [servicesLoading, setServicesLoading] = useState(true)
 const [servicesError, setServicesError] = useState('')
 
 const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
 const [timeSlotsLoading, setTimeSlotsLoading] = useState(false)
 const [timeSlotsError, setTimeSlotsError] = useState('')
 
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [blockedDays, setBlockedDays] = useState<string[]>([])

 useEffect(() => {
   const fetchServices = async () => {
     try {
       setServicesLoading(true)
       const response = await fetch('/api/services')
       const data = await response.json()
       
       if (data.success) {
         setServices(data.services)
       } else {
         setServicesError('فشل في تحميل الخدمات')
       }
     } catch (error) {
       console.error('خطأ في تحميل الخدمات:', error)
       setServicesError('خطأ في الاتصال بالخادم')
     } finally {
       setServicesLoading(false)
     }
   }

   const fetchBlockedDays = async () => {
     try {
       const response = await fetch('/api/admin/blocked-times')
       const data = await response.json()
       
       if (data.success) {
         const blockedDaysList = data.blockedTimes
           .filter((blocked: any) => blocked.startTime === null && blocked.endTime === null)
           .map((blocked: any) => blocked.date)
         setBlockedDays(blockedDaysList)
       }
     } catch (error) {
       console.error('خطأ في تحميل الأيام المقفلة:', error)
     }
   }

   fetchServices()
   fetchBlockedDays()
 }, [])

 useEffect(() => {
   if (selectedDate && isPhoneVerified) {
     fetchAvailableTimeSlots(selectedDate)
   }
 }, [selectedDate, isPhoneVerified])

 const fetchAvailableTimeSlots = async (date: string) => {
   try {
     setTimeSlotsLoading(true)
     setTimeSlotsError('')
     
     const response = await fetch(`/api/bookings/available-times?date=${date}&userType=customer`)
     const data = await response.json()
     
     console.log('🔍 Debug - استجابة API للأوقات:', data)
     
     if (data.success) {
       setAvailableTimeSlots(data.availableSlots)
       
       if (selectedTime && !data.availableSlots.includes(selectedTime)) {
         setSelectedTime('')
         console.log('🔍 Debug - تم مسح الوقت المختار لأنه غير متاح:', selectedTime)
       }
       
       if (data.debug) {
         console.log('🔍 Debug - تفاصيل الفلترة:', data.debug)
       }
       
     } else {
       console.error('فشل في تحميل الأوقات:', data.error)
       setTimeSlotsError(data.error || 'فشل في تحميل الأوقات')
       setAvailableTimeSlots([])
     }
   } catch (error) {
     console.error('خطأ في تحميل الأوقات:', error)
     setTimeSlotsError('خطأ في الاتصال بالخادم')
     setAvailableTimeSlots([])
   } finally {
     setTimeSlotsLoading(false)
   }
 }

 const handleBookingSubmit = async () => {
   if (!phoneNumber || !customerName || !selectedDate || !selectedTime || selectedServices.length === 0) {
     alert('يرجى إكمال جميع البيانات')
     return
   }

   setIsSubmitting(true)
   
   try {
     const response = await fetch('/api/bookings', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         phoneNumber,
         customerName,
         selectedDate,
         selectedTime,
         selectedServices
       })
     })

     const data = await response.json()

     if (data.success) {
       const selectedDateObj = parseIstanbulDate(selectedDate)
       const arabicDate = formatArabicDate(selectedDateObj)
       
       let message = '🎉 تم تأكيد حجزك بنجاح!\n\n'
       message += `👤 العميلة: ${data.data.customerName}\n`
       message += `📱 رقم الحجز: ${data.data.reservationId}\n`
       message += `📅 موعدك: ${arabicDate} في ${selectedTime}\n`
       message += `✨ الخدمات: ${selectedServices.length} خدمة\n`
       message += `🎯 إجمالي زياراتك: ${data.data.totalVisits}\n`
       
       if (data.data.coupon) {
         message += `\n🎁 مبروك! حصلت على كوبون خصم!\n`
         message += `كود الخصم: ${data.data.coupon.code}\n`
         message += `قيمة الخصم: ${data.data.coupon.discount}%\n`
       }
       
       message += '\nسنرسل لك رسالة تأكيد قريباً 💕'
       
       alert(message)
       
       setPhoneNumber('')
       setCustomerName('')
       setOtpCode('')
       setIsPhoneVerified(false)
       setIsOtpSent(false)
       setSelectedServices([])
       setSelectedDate('')
       setSelectedTime('')
       setCurrentStep(1)
       
     } else {
       alert(`حدث خطأ: ${data.error}`)
     }
   } catch (error) {
     console.error('خطأ في الحجز:', error)
     alert('حدث خطأ في إرسال الحجز. يرجى المحاولة مرة أخرى.')
   } finally {
     setIsSubmitting(false)
   }
 }

 const handleSendOTP = () => {
   if (phoneNumber.length > 10 && customerName.length > 2) {
     setIsOtpSent(true)
     console.log('إرسال OTP إلى:', phoneNumber, 'للعميلة:', customerName)
   }
 }

 const handleVerifyOTP = () => {
   if (otpCode === '1234') {
     setIsPhoneVerified(true)
     setCurrentStep(2)
   }
 }

 const generateCalendarMonths = () => {
   const months = []
   const today = createIstanbulDate()
   
   for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
     const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
     const monthData = {
       year: currentMonth.getFullYear(),
       month: currentMonth.getMonth(),
       monthName: currentMonth.toLocaleDateString('ar', { month: 'long', year: 'numeric' }),
       days: []
     }
     
     const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
     const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
     
     for (let i = 0; i < firstDayOfWeek; i++) {
       monthData.days.push(null)
     }
     
     for (let day = 1; day <= daysInMonth; day++) {
       const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
       const dateString = formatIstanbulDate(date, 'date')
       const todayString = getTodayIstanbul()
       const isTodayDate = isToday(date)
       const isPast = date < today && !isTodayDate
       const isBlocked = blockedDays.includes(dateString)
       
       monthData.days.push({
         day,
         date: dateString,
         isToday: isTodayDate,
         isPast,
         isBlocked,
         dayName: date.toLocaleDateString('ar', { weekday: 'short' })
       })
     }
     
     months.push(monthData)
   }
   
   return months
 }

 const [currentMonthIndex, setCurrentMonthIndex] = useState(0)
 const calendarMonths = generateCalendarMonths()

 const steps = [
   { id: 1, title: 'التحقق من الهاتف', icon: Phone, completed: isPhoneVerified },
   { id: 2, title: 'الحجز والخدمات', icon: Calendar, completed: selectedDate && selectedTime && selectedServices.length > 0 },
   { id: 3, title: 'تأكيد الحجز', icon: CheckCircle, completed: false }
 ]

 return (
   <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
     <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
       <div className="max-w-6xl mx-auto px-4 py-4">
         <div className="flex items-center justify-between">
           <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
             <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
               <Sparkles className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-bold text-gray-800">صالون ريم</span>
           </Link>
           <button className="text-gray-600 hover:text-gray-800 transition-colors">
             العربية
           </button>
         </div>
       </div>
     </header>

     <div className="max-w-4xl mx-auto py-8 px-4">
       <div className="text-center mb-8">
         <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
           احجزي موعدك الآن
         </h1>
         <p className="text-lg text-gray-600">
           اتبعي الخطوات لإكمال حجزك بسهولة
         </p>
       </div>

       <div className="mb-8">
         <div className="flex items-center justify-between relative">
           <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
           <div 
             className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 -z-10 transition-all duration-500"
             style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
           ></div>

           {steps.map((step, index) => (
             <div key={step.id} className="flex flex-col items-center relative">
               <div className={`
                 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                 ${step.completed 
                   ? 'bg-green-500 border-green-500 text-white' 
                   : currentStep >= step.id 
                     ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white'
                     : 'bg-white border-gray-300 text-gray-400'
                 }
               `}>
                 {step.completed ? (
                   <CheckCircle className="w-6 h-6" />
                 ) : (
                   <step.icon className="w-6 h-6" />
                 )}
               </div>
               <span className={`
                 mt-2 text-sm text-center font-medium transition-colors duration-300
                 ${currentStep >= step.id ? 'text-gray-800' : 'text-gray-400'}
               `}>
                 {step.title}
               </span>
             </div>
           ))}
         </div>
       </div>

       <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
         
         <div className={`${currentStep !== 1 && isPhoneVerified ? 'hidden' : ''}`}>
           <div className="text-center mb-6">
             <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Phone className="w-8 h-8 text-white" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">
               التحقق من رقم الهاتف
             </h2>
             <p className="text-gray-600">
               أدخلي رقم هاتفك لإرسال رمز التحقق
             </p>
           </div>

           {!isOtpSent ? (
             <div className="max-w-md mx-auto">
               <div className="mb-4">
                 <label className="block text-gray-700 text-sm font-bold mb-2">
                   الاسم الكامل
                 </label>
                 <input
                   type="text"
                   placeholder="أدخلي اسمك الكامل"
                   value={customerName}
                   onChange={(e) => setCustomerName(e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg"
                 />
               </div>
               <div className="mb-4">
                 <label className="block text-gray-700 text-sm font-bold mb-2">
                   رقم الهاتف
                 </label>
                 <input
                   type="tel"
                   placeholder="+90 5XX XXX XX XX"
                   value={phoneNumber}
                   onChange={(e) => setPhoneNumber(e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg"
                   dir="ltr"
                 />
               </div>
               <button
                 onClick={handleSendOTP}
                 disabled={phoneNumber.length < 10 || customerName.length < 2}
                 className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 إرسال رمز التحقق
               </button>
             </div>
           ) : (
             <div className="max-w-md mx-auto">
               <div className="text-center mb-4">
                 <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                   <Shield className="w-6 h-6 text-green-600" />
                 </div>
                 <p className="text-sm text-gray-600">
                   تم إرسال رمز التحقق إلى
                 </p>
                 <p className="font-semibold text-gray-800" dir="ltr">
                   {phoneNumber}
                 </p>
               </div>

               <div className="mb-4">
                 <label className="block text-gray-700 text-sm font-bold mb-2">
                   رمز التحقق
                 </label>
                 <input
                   type="text"
                   placeholder="أدخلي الرمز هنا"
                   value={otpCode}
                   onChange={(e) => setOtpCode(e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                   maxLength={4}
                 />
                 <p className="text-xs text-gray-500 mt-1 text-center">
                   كود تجريبي: 1234
                 </p>
               </div>

               <button
                 onClick={handleVerifyOTP}
                 disabled={otpCode.length < 4}
                 className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 تأكيد الرمز
               </button>

               <button
                 onClick={() => setIsOtpSent(false)}
                 className="w-full mt-3 text-purple-600 hover:text-purple-800 font-medium"
               >
                 تغيير رقم الهاتف
               </button>
             </div>
           )}
         </div>

         <div className={`${!isPhoneVerified ? 'opacity-30 pointer-events-none' : ''} ${currentStep !== 2 ? 'hidden' : ''}`}>
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Calendar className="w-8 h-8 text-white" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">
               اختاري موعدك وخدماتك
             </h2>
             <p className="text-gray-600">
               حددي الوقت المناسب والخدمات المطلوبة
             </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             
             <div className="order-2 lg:order-1">
               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                 <Calendar className="w-5 h-5 ml-2 text-purple-600" />
                 اختاري التاريخ والوقت
               </h3>
               
               <div className="mb-6">
                 <div className="bg-white border rounded-xl p-4">
                   <div className="flex items-center justify-between mb-4">
                     <button
                       onClick={() => setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))}
                       disabled={currentMonthIndex === 0}
                       className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       ←
                     </button>
                     <h4 className="text-lg font-bold text-gray-800">
                       {calendarMonths[currentMonthIndex]?.monthName}
                     </h4>
                     <button
                       onClick={() => setCurrentMonthIndex(Math.min(2, currentMonthIndex + 1))}
                       disabled={currentMonthIndex === 2}
                       className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       →
                     </button>
                   </div>

                   <div className="grid grid-cols-7 gap-1 mb-2">
                     {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day) => (
                       <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                         {day}
                       </div>
                     ))}
                   </div>

                   <div className="grid grid-cols-7 gap-1">
                     {calendarMonths[currentMonthIndex]?.days.map((dayData, index) => (
                       <div key={index} className="aspect-square">
                         {dayData ? (
                           <button
                             onClick={() => !dayData.isPast && !dayData.isBlocked && setSelectedDate(dayData.date)}
                             disabled={dayData.isPast || dayData.isBlocked}
                             className={`
                               w-full h-full rounded-lg text-sm font-medium transition-all duration-200
                               ${dayData.isPast || dayData.isBlocked
                                 ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                                 : selectedDate === dayData.date
                                   ? 'bg-purple-500 text-white'
                                   : dayData.isToday
                                     ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                     : 'text-gray-700 hover:bg-purple-100'
                               }
                             `}
                           >
                             {dayData.day}
                             {dayData.isToday && (
                               <div className="text-xs">اليوم</div>
                             )}
                             {dayData.isBlocked && (
                               <div className="text-xs text-red-500">🔒</div>
                             )}
                           </button>
                         ) : (
                           <div></div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               </div>

               {selectedDate && (
                 <div>
                   <h4 className="text-lg font-semibold text-gray-700 mb-3">
                     الأوقات المتاحة
                     <span className="text-sm text-gray-500 mr-2">
                       ({availableTimeSlots.length} وقت متاح)
                     </span>
                   </h4>
                   
                   {timeSlotsLoading ? (
                     <div className="text-center py-8">
                       <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
                       <p className="text-gray-600">جاري تحميل الأوقات المتاحة...</p>
                     </div>
                   ) : timeSlotsError ? (
                     <div className="text-center py-8 bg-red-50 rounded-xl">
                       <p className="text-red-600">{timeSlotsError}</p>
                       <button 
                         onClick={() => fetchAvailableTimeSlots(selectedDate)}
                         className="mt-2 text-red-700 hover:text-red-900 font-medium"
                       >
                         إعادة المحاولة
                       </button>
                     </div>
                   ) : availableTimeSlots.length > 0 ? (
                     <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                       {availableTimeSlots.map((time) => (
                         <button
                           key={time}
                           onClick={() => setSelectedTime(time)}
                           className={`
                             p-3 rounded-lg font-medium transition-all duration-300 text-sm
                             ${selectedTime === time
                               ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                               : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                             }
                           `}
                         >
                           {time}
                         </button>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center p-8 bg-gray-50 rounded-xl">
                       <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                       <p className="text-gray-600">لا توجد أوقات متاحة لهذا التاريخ</p>
                       <p className="text-sm text-gray-500">جميع المواعيد محجوزة أو مقفلة</p>
                     </div>
                   )}
                 </div>
               )}

               {selectedDate && selectedTime && (
                 <div className="mt-4 bg-purple-50 rounded-xl p-4">
                   <p className="text-purple-800 font-medium text-center">
                     📅 موعدك: {formatArabicDate(parseIstanbulDate(selectedDate))}
                   </p>
                   <p className="text-purple-700 text-center mt-1">
                     🕒 الساعة: {selectedTime}
                   </p>
                 </div>
               )}
             </div>

             <div className="order-1 lg:order-2">
               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                 <Sparkles className="w-5 h-5 ml-2 text-purple-600" />
                 اختاري خدماتك
               </h3>
               <p className="text-gray-600 mb-4 text-sm">يمكنك اختيار خدمة واحدة أو أكثر</p>
               
               {servicesLoading ? (
                 <div className="text-center py-8">
                   <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
                   <p className="text-gray-600">جاري تحميل الخدمات...</p>
                 </div>
               ) : servicesError ? (
                 <div className="text-center py-8 bg-red-50 rounded-xl">
                   <p className="text-red-600">{servicesError}</p>
                   <button 
                     onClick={() => window.location.reload()}
                     className="mt-2 text-red-700 hover:text-red-900 font-medium"
                   >
                     إعادة المحاولة
                   </button>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {services.map((service) => (
                     <div
                       key={service.id}
                       onClick={() => {
                         if (selectedServices.includes(service.id)) {
                           setSelectedServices(selectedServices.filter(id => id !== service.id))
                         } else {
                           setSelectedServices([...selectedServices, service.id])
                         }
                       }}
                       className={`
                         border-2 rounded-xl p-4 cursor-pointer transition-all duration-300
                         ${selectedServices.includes(service.id)
                           ? 'border-purple-500 bg-purple-50'
                           : 'border-gray-200 hover:border-purple-300'
                         }
                       `}
                     >
                       <div className="flex justify-between items-center">
                         <div className="flex-1">
                           <h4 className="font-bold text-gray-800 text-lg">{service.nameAr}</h4>
                         </div>
                         <div className="text-center ml-4">
                           <div className={`
                             w-6 h-6 rounded-full border-2 flex items-center justify-center
                             ${selectedServices.includes(service.id)
                               ? 'border-purple-500 bg-purple-500'
                               : 'border-gray-300'
                             }
                           `}>
                             {selectedServices.includes(service.id) && (
                               <CheckCircle className="w-4 h-4 text-white" />
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}

               {selectedServices.length > 0 && !servicesLoading && (
                 <div className="mt-4 bg-green-50 rounded-xl p-4">
                   <div className="text-center">
                     <p className="text-green-800 font-medium">
                       ✨ اخترت {selectedServices.length} خدمة
                     </p>
                   </div>
                 </div>
               )}
             </div>
           </div>

           {selectedDate && selectedTime && selectedServices.length > 0 && (
             <div className="text-center mt-8">
               <button
                 onClick={() => setCurrentStep(3)}
                 className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 text-lg"
               >
                 متابعة إلى التأكيد النهائي ✨
               </button>
             </div>
           )}
         </div>

         <div className={`${!isPhoneVerified || !selectedDate || !selectedTime || selectedServices.length === 0 ? 'opacity-30 pointer-events-none' : ''} ${currentStep !== 3 ? 'hidden' : ''}`}>
           <div className="text-center mb-6">
             <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="w-8 h-8 text-white" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">
               تأكيد الحجز
             </h2>
             <p className="text-gray-600">
               مراجعة تفاصيل الحجز
             </p>
           </div>

           <div className="bg-gray-50 rounded-xl p-6 mb-6">
             <h3 className="font-bold text-gray-800 mb-4">ملخص الحجز:</h3>
             
             <div className="space-y-3">
               <div className="flex justify-between">
                 <span className="text-gray-600">👤 الاسم:</span>
                 <span className="font-medium">{customerName}</span>
               </div>
               
               <div className="flex justify-between">
                 <span className="text-gray-600">📱 رقم الهاتف:</span>
                 <span className="font-medium" dir="ltr">{phoneNumber}</span>
               </div>
               
               <div className="flex justify-between">
                 <span className="text-gray-600">📅 التاريخ:</span>
                 <span className="font-medium">
                   {selectedDate ? formatArabicDate(parseIstanbulDate(selectedDate)) : ''}
                 </span>
               </div>
               
               <div className="flex justify-between">
                 <span className="text-gray-600">🕒 الوقت:</span>
                 <span className="font-medium">{selectedTime}</span>
               </div>
               
               <div className="border-t pt-3">
                 <span className="text-gray-600">✨ الخدمات المختارة:</span>
                 <div className="mt-2">
                   {selectedServices.map(serviceId => {
                     const service = services.find(s => s.id === serviceId)
                     return service ? (
                       <div key={serviceId} className="py-1">
                         <span>• {service.nameAr}</span>
                       </div>
                     ) : null
                   })}
                 </div>
               </div>
             </div>
           </div>

           <button
             onClick={handleBookingSubmit}
             disabled={isSubmitting}
             className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
           >
             {isSubmitting ? (
               <>
                 <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                 جاري الحفظ...
               </>
             ) : (
               'تأكيد الحجز نهائياً ✨'
             )}
           </button>
         </div>

       </div>

       <div className="text-center mt-8">
         <Link 
           href="/"
           className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors duration-300"
         >
           <ArrowRight className="w-5 h-5 ml-2" />
           العودة للصفحة الرئيسية
         </Link>
       </div>
     </div>
   </div>
 )
}