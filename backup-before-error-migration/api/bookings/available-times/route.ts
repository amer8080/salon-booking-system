// src/app/api/bookings/available-times/route.ts
// API محدث بالكامل للنظام الديناميكي - جميع الدوال موجودة

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppSettings } from '@/lib/app-settings';
import {
  createIstanbulDate,
  getAppTimezone,
  getIstanbulStartOfDay,
  getIstanbulEndOfDay,
  fromDatabaseTime,
  isTimeExpiredApp
} from '@/lib/timezone';

// دالة توليد الأوقات المتاحة
function generateTimeSlots(startHour: number, endHour: number, slotDuration: number): string[] {
  const slots: string[] = [];
  let currentTime = startHour * 60; // تحويل لدقائق
  const endTime = endHour * 60;

  while (currentTime < endTime) {
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    slots.push(timeString);
    currentTime += slotDuration;
  }

  return slots;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔥 Available Times API called with dynamic settings');
    
    const { searchParams } = new URL(request.url);
    const selectedDate = searchParams.get('date');
    const userType = searchParams.get('userType') || 'customer';

    console.log('📅 Parameters:', { selectedDate, userType });

    if (!selectedDate) {
      return NextResponse.json(
        { success: false, error: 'التاريخ مطلوب' },
        { status: 400 }
      );
    }

    // 🔧 DYNAMIC: الحصول على الإعدادات الديناميكية
    const [
      appTimezone,
      businessHours,
      slotDuration,
      workingDays,
      lunchBreak
    ] = await Promise.all([
      getAppTimezone(),
      AppSettings.getBusinessHours(),
      AppSettings.getDefaultSlotDuration(),
      AppSettings.getWorkingDays(),
      AppSettings.getLunchBreak()
    ]);

    console.log('🌍 Using timezone:', appTimezone);
    console.log('📊 Dynamic Settings:', {
      businessHours,
      slotDuration,
      timezone: appTimezone
    });

    // التحقق من يوم العمل
    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj.getDay(); // 0 = الأحد, 6 = السبت
    
    if (!workingDays.includes(dayOfWeek)) {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        bookedSlots: [],
        blockedSlots: [],
        totalSlots: 0,
        allSlots: 0,
        userType,
        timezone: appTimezone,
        message: 'يوم عطلة',
        settings: {
          businessHours,
          slotDuration,
          workingDays
        },
        dynamicSettings: true
      });
    }

    // توليد جميع الأوقات المتاحة
    const startHour = parseInt(businessHours.start.split(':')[0]);
    const startMinute = parseInt(businessHours.start.split(':')[1] || '0');
    const endHour = parseInt(businessHours.end.split(':')[0]);
    const endMinute = parseInt(businessHours.end.split(':')[1] || '0');
    
    const startTimeInMinutes = (startHour * 60) + startMinute;
    const endTimeInMinutes = (endHour * 60) + endMinute;
    
    let allTimeSlots = generateTimeSlots(
      startTimeInMinutes / 60, 
      endTimeInMinutes / 60, 
      slotDuration
    );

    console.log(`⏰ Generated ${allTimeSlots.length} time slots from ${businessHours.start} to ${businessHours.end}`);

    // إزالة أوقات استراحة الغداء إذا كانت مفعلة
    if (lunchBreak.enabled) {
      const lunchStartHour = parseInt(lunchBreak.start.split(':')[0]);
      const lunchStartMinute = parseInt(lunchBreak.start.split(':')[1] || '0');
      const lunchEndHour = parseInt(lunchBreak.end.split(':')[0]);
      const lunchEndMinute = parseInt(lunchBreak.end.split(':')[1] || '0');
      
      const lunchStartTime = `${lunchStartHour.toString().padStart(2, '0')}:${lunchStartMinute.toString().padStart(2, '0')}`;
      const lunchEndTime = `${lunchEndHour.toString().padStart(2, '0')}:${lunchEndMinute.toString().padStart(2, '0')}`;
      
      allTimeSlots = allTimeSlots.filter(slot => {
        return slot < lunchStartTime || slot >= lunchEndTime;
      });
      
      console.log(`🍽️ Lunch break filtered: ${lunchStartTime} - ${lunchEndTime}`);
    }

    // 🔧 FIXED: استخدام الدوال الموجودة للتاريخ
    const startOfDay = getIstanbulStartOfDay(new Date(selectedDate));
    const endOfDay = getIstanbulEndOfDay(new Date(selectedDate));

    console.log('📅 Date range:', { startOfDay, endOfDay });

    const existingReservations = await prisma.reservation.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'cancelled'
        }
      },
      select: {
        id: true,
        startTime: true,
        customerId: true,
      },
    });

    console.log(`📋 Found ${existingReservations.length} existing reservations`);

    // استخراج الأوقات المحجوزة مع تحويل من قاعدة البيانات
    const bookedTimes = existingReservations.map(reservation => {
      const dbTime = fromDatabaseTime(reservation.startTime);
      return `${dbTime.getHours().toString().padStart(2, '0')}:${dbTime.getMinutes().toString().padStart(2, '0')}`;
    });

    // التحقق من الأوقات المحظورة
    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        OR: [
          {
            date: new Date(selectedDate),
            isRecurring: false,
          },
          {
            isRecurring: true,
            // يمكن إضافة منطق للأوقات المتكررة هنا
          },
        ],
      },
    });

    console.log(`📋 Found ${blockedTimes.length} blocked times`);

    const blockedTimeSlots = blockedTimes.flatMap(blocked => {
      const startTime = fromDatabaseTime(blocked.startTime);
      const endTime = fromDatabaseTime(blocked.endTime);
      const blockedSlots: string[] = [];
      
      let currentTime = startTime;
      while (currentTime < endTime) {
        const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
        blockedSlots.push(timeString);
        
        // إضافة مدة slot للوقت الحالي
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const nextMinutes = currentMinutes + slotDuration;
        const nextHours = Math.floor(nextMinutes / 60);
        const nextMins = nextMinutes % 60;
        
        currentTime = new Date(currentTime);
        currentTime.setHours(nextHours, nextMins, 0, 0);
        
        if (currentTime >= endTime) break;
      }
      
      return blockedSlots;
    });

    // فلترة الأوقات المتاحة
    let availableSlots = allTimeSlots.filter(slot => {
      return !bookedTimes.includes(slot) && !blockedTimeSlots.includes(slot);
    });

    // 🔧 DYNAMIC: إزالة الأوقات المنتهية الصلاحية باستخدام النظام الديناميكي
    const currentAppTime = createIstanbulDate(); // استخدام legacy function للتوافق
    const currentDateString = currentAppTime.toISOString().split('T')[0];
    
    if (selectedDate === currentDateString) {
      console.log('📅 Filtering past times for today');
      const filteredSlots = [];
      
      for (const slot of availableSlots) {
        const isExpired = await isTimeExpiredApp(selectedDate, slot);
        if (!isExpired) {
          filteredSlots.push(slot);
        }
      }
      
      const filteredOut = availableSlots.length - filteredSlots.length;
      console.log(`⏰ Filtered out ${filteredOut} past time slots`);
      availableSlots = filteredSlots;
    }

    const response = {
      success: true,
      availableSlots,
      bookedSlots: bookedTimes,
      blockedSlots: blockedTimeSlots,
      totalSlots: availableSlots.length,
      allSlots: allTimeSlots.length,
      userType,
      timezone: appTimezone,
      settings: {
        businessHours,
        slotDuration,
        workingDays,
        lunchBreak
      },
      dynamicSettings: true,
      debug: {
        selectedDate,
        isDayBlocked: !workingDays.includes(dayOfWeek),
        reservationsFound: existingReservations.length,
        bookedTimes,
        blockedTimeSlots,
        blockedTimesFound: blockedTimes.length,
        filteredOut: allTimeSlots.length - availableSlots.length,
        timezone: appTimezone,
        dynamicSettingsUsed: true
      }
    };

    console.log(`✅ Returning ${availableSlots.length} available slots`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Available Times API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في جلب الأوقات المتاحة',
      details: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
}