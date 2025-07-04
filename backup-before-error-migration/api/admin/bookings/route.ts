import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  console.log('🔥 Bookings API called');
  
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const view = searchParams.get('view') || 'week';

    console.log('📅 Parameters:', { startDate, endDate, view });

    if (!startDate || !endDate) {
      console.log('❌ Missing parameters');
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    console.log('💾 Fetching reservations...');
    
    // تحويل التواريخ
    const startDateTime = new Date(startDate + 'T00:00:00');
    const endDateTime = new Date(endDate + 'T23:59:59');

    console.log('🕐 Date range:', { startDateTime, endDateTime });

    // 1. Fetch reservations مع customer relation فقط
    const reservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      include: {
        customer: true, // ✅ relation صحيح
        coupon: true,   // ✅ relation صحيح
      },
      orderBy: {
        date: 'asc',
      },
      take: 100,
    });

    console.log('✅ Found reservations:', reservations.length);

    // 2. استخراج جميع service IDs من JSON strings
    const allServiceIds = new Set<number>();
    
    reservations.forEach((reservation) => {
      try {
        if (reservation.services) {
          // Parse JSON string
          const servicesData = JSON.parse(reservation.services);
          
          // Handle different JSON formats
          if (Array.isArray(servicesData)) {
            servicesData.forEach((service) => {
              if (typeof service === 'number') {
                allServiceIds.add(service);
              } else if (typeof service === 'string') {
                const id = parseInt(service);
                if (!isNaN(id)) allServiceIds.add(id);
              } else if (service && service.id) {
                allServiceIds.add(parseInt(service.id));
              }
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse services JSON for reservation:', reservation.id, error);
      }
    });

    console.log('🔍 Unique service IDs found:', Array.from(allServiceIds));

    // 3. Fetch service details إذا وجدت IDs
    let servicesMap = new Map();
    
    if (allServiceIds.size > 0) {
      const services = await prisma.service.findMany({
        where: {
          id: { in: Array.from(allServiceIds) },
        },
      });

      console.log('✅ Found services:', services.length);

      // إنشاء map للوصول السريع
      services.forEach((service) => {
        servicesMap.set(service.id, {
          id: service.id,
          name: service.nameAr || service.nameEn || service.name,
          nameAr: service.nameAr,
          nameEn: service.nameEn,
          nameTr: service.nameTr,
          duration: service.duration,
          price: service.price,
          category: service.category,
        });
      });
    }

    // 4. تحويل البيانات للعرض مع دمج services
    const formattedReservations = reservations.map((reservation) => {
      let services = [];
      
      try {
        if (reservation.services) {
          const servicesData = JSON.parse(reservation.services);
          
          if (Array.isArray(servicesData)) {
            services = servicesData.map((service) => {
              let serviceId;
              
              if (typeof service === 'number') {
                serviceId = service;
              } else if (typeof service === 'string') {
                serviceId = parseInt(service);
              } else if (service && service.id) {
                serviceId = parseInt(service.id);
              }
              
              // الحصول على بيانات الخدمة من الـ map
              const serviceData = servicesMap.get(serviceId);
              
              return serviceData || {
                id: serviceId,
                name: 'خدمة غير معروفة',
                nameAr: 'خدمة غير معروفة',
                nameEn: 'Unknown Service',
                nameTr: 'Bilinmeyen Hizmet',
                duration: 30,
                price: 0,
                category: 'general',
              };
            }).filter(Boolean);
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to process services for reservation:', reservation.id, error);
        services = [];
      }

      return {
        id: reservation.id,
        date: reservation.date,
        time: reservation.startTime,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        duration: services.reduce((sum, service) => sum + (service.duration || 0), 0),
        totalPrice: reservation.totalPrice,
        discount: reservation.discount,
        status: reservation.status,
        notes: reservation.notes,
        customer: {
          id: reservation.customer?.id,
          name: reservation.customer?.name,
          phone: reservation.customer?.phone,
        },
        services: services,
        coupon: reservation.coupon ? {
          id: reservation.coupon.id,
          code: reservation.coupon.code,
          discountType: reservation.coupon.discountType,
          discountValue: reservation.coupon.discountValue,
        } : null,
        createdAt: reservation.createdAt,
        createdBy: reservation.createdBy,
      };
    });

    console.log('📋 Formatted reservations:', formattedReservations.length);

    // إرجاع البيانات بالصيغة المتوقعة
    return NextResponse.json({
      success: true,
      data: formattedReservations,
      bookings: formattedReservations, // للتوافق مع useBookings.ts
      count: formattedReservations.length,
      view,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      debug: {
        totalReservations: reservations.length,
        uniqueServices: allServiceIds.size,
        formattedCount: formattedReservations.length,
        servicesFound: servicesMap.size,
      }
    });

  } catch (error) {
    console.error('🚨 Bookings API Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'Unknown error');
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطأ في جلب الحجوزات',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          timestamp: new Date().toISOString(),
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('📝 POST Bookings API called');
  
  try {
    const body = await request.json();
    console.log('📋 Request body:', body);

    const {
      customerId,
      services: serviceIds,
      date,
      startTime,
      endTime,
      notes,
    } = body;

    // التحقق من صحة البيانات الأساسية
    if (!customerId || !serviceIds || !date || !startTime) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    console.log('🔍 Validating customer and services...');

    // التحقق من وجود العميل
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'العميل غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من وجود الخدمات
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds.map((id: any) => parseInt(id)) },
      },
    });

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        { success: false, error: 'إحدى الخدمات غير موجودة' },
        { status: 404 }
      );
    }

    // حساب المدة الإجمالية والسعر
    const totalPrice = services.reduce((sum, service) => sum + Number(service.price), 0);

    console.log('💰 Calculated total price:', totalPrice);

    // تحويل التواريخ والأوقات
    const reservationDate = new Date(date);
    const startTimeDate = new Date(`${date}T${startTime}`);
    const endTimeDate = endTime ? new Date(`${date}T${endTime}`) : new Date(startTimeDate.getTime() + (30 * 60 * 1000)); // default 30 minutes

    // تحضير services JSON
    const servicesJSON = JSON.stringify(serviceIds.map((id: any) => parseInt(id)));

    console.log('📅 Dates:', { reservationDate, startTimeDate, endTimeDate });
    console.log('🛠️ Services JSON:', servicesJSON);

    // إنشاء الحجز
    const reservation = await prisma.reservation.create({
      data: {
        customerId: parseInt(customerId),
        date: reservationDate,
        startTime: startTimeDate,
        endTime: endTimeDate,
        services: servicesJSON, // حفظ كـ JSON string
        totalPrice: totalPrice,
        status: 'confirmed',
        notes: notes || null,
        createdBy: 'admin',
      },
      include: {
        customer: true,
        coupon: true,
      },
    });

    console.log('✅ Reservation created:', reservation.id);

    // تحويل البيانات للعرض
    const formattedReservation = {
      id: reservation.id,
      date: reservation.date,
      time: reservation.startTime,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      duration: services.reduce((sum, service) => sum + service.duration, 0),
      totalPrice: reservation.totalPrice,
      discount: reservation.discount,
      status: reservation.status,
      notes: reservation.notes,
      customer: {
        id: reservation.customer.id,
        name: reservation.customer.name,
        phone: reservation.customer.phone,
      },
      services: services.map((service) => ({
        id: service.id,
        name: service.nameAr || service.nameEn || service.name,
        nameAr: service.nameAr,
        nameEn: service.nameEn,
        nameTr: service.nameTr,
        duration: service.duration,
        price: service.price,
        category: service.category,
      })),
      coupon: reservation.coupon,
      createdAt: reservation.createdAt,
      createdBy: reservation.createdBy,
    };

    return NextResponse.json({
      success: true,
      data: formattedReservation,
      message: 'تم إنشاء الحجز بنجاح',
    });

  } catch (error) {
    console.error('🚨 POST Bookings API Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'Unknown error');
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطأ في إنشاء الحجز',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}