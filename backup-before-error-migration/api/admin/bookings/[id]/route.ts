import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  parseIstanbulDate,
  toDatabaseTime,
  fromDatabaseTime,
  createIstanbulDate,
  formatIstanbulDate,
} from '@/lib/timezone';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // ✅ إصلاح Next.js 15
    const body = await request.json();
    const { customerName, customerPhone, selectedDate, selectedTime, selectedServices, notes } =
      body;
    const bookingId = parseInt(id);

    const existingBooking = await prisma.reservation.findUnique({
      where: { id: bookingId },
      include: { customer: true },
    });

    if (!existingBooking) {
      return NextResponse.json({ success: false, error: 'الحجز غير موجود' }, { status: 404 });
    }

    let updatedCustomer = existingBooking.customer;
    if (customerName || customerPhone) {
      const customerUpdateData: any = {};
      if (customerName && customerName.trim() !== existingBooking.customer.name) {
        customerUpdateData.name = customerName.trim();
      }
      if (customerPhone && customerPhone.trim() !== existingBooking.customer.phone) {
        customerUpdateData.phone = customerPhone.trim();
      }
      if (Object.keys(customerUpdateData).length > 0) {
        updatedCustomer = await prisma.customer.update({
          where: { id: existingBooking.customerId },
          data: customerUpdateData,
        });
      }
    }

    const updateData: any = {};

    if (selectedServices && selectedServices.length > 0) {
      updateData.services = JSON.stringify(selectedServices);
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const currentDate = fromDatabaseTime(existingBooking.date);
    const currentTime = fromDatabaseTime(existingBooking.startTime);
    const currentDateString = formatIstanbulDate(currentDate, 'date');
    const currentTimeString = formatIstanbulDate(currentTime, 'time');
    const dateChanged = selectedDate && selectedDate !== currentDateString;
    const timeChanged = selectedTime && selectedTime !== currentTimeString;

    if (dateChanged || timeChanged) {
      if (!selectedDate || !selectedTime) {
        return NextResponse.json(
          { success: false, error: 'التاريخ والوقت مطلوبان لنقل الحجز' },
          { status: 400 },
        );
      }

      const newAppointmentDate = parseIstanbulDate(selectedDate);
      const newStartTime = parseIstanbulDate(selectedDate, selectedTime);
      const newEndTime = new Date(newStartTime.getTime() + 30 * 60 * 1000);

     const existingReservation = await prisma.reservation.findFirst({
  where: {
    startTime: toDatabaseTime(newStartTime),
    status: { not: 'cancelled' },
    id: { not: bookingId },
  },
});

if (existingReservation) {
  return NextResponse.json(
    { success: false, error: 'هذا الموعد محجوز مسبقاً' },
    { status: 409 }
  );
}
      updateData.date = toDatabaseTime(newAppointmentDate);
      updateData.startTime = toDatabaseTime(newStartTime);
      updateData.endTime = toDatabaseTime(newEndTime);
    }

    const updatedBooking = await prisma.reservation.update({
      where: { id: bookingId },
      data: updateData,
    });

    const successMessage =
      dateChanged || timeChanged ? 'تم نقل وتحديث الحجز بنجاح' : 'تم تحديث الحجز بنجاح';

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      customer: updatedCustomer,
      message: successMessage,
      moved: dateChanged || timeChanged,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في تحديث الحجز',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // ✅ إصلاح Next.js 15
    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ success: false, error: 'سبب الإلغاء مطلوب' }, { status: 400 });
    }

    const bookingId = parseInt(id);
    const existingBooking = await prisma.reservation.findUnique({
      where: { id: bookingId },
      include: { customer: true },
    });

    if (!existingBooking) {
      return NextResponse.json({ success: false, error: 'الحجز غير موجود' }, { status: 404 });
    }

    const currentTime = createIstanbulDate();
    const cancelNote = `تم الإلغاء بواسطة الأدمن في ${formatIstanbulDate(currentTime, 'datetime')}. السبب: ${reason.trim()}`;

    const cancelledBooking = await prisma.reservation.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        notes: cancelNote,
      },
    });

    if (existingBooking.status === 'confirmed' || existingBooking.status === 'completed') {
      await prisma.customer.update({
        where: { id: existingBooking.customerId },
        data: {
          totalVisits: Math.max(0, existingBooking.customer.totalVisits - 1),
        },
      });
    }

    return NextResponse.json({
      success: true,
      booking: cancelledBooking,
      message: 'تم إلغاء الحجز بنجاح',
    });
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ success: false, error: 'الحجز غير موجود' }, { status: 404 });
    }
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في إلغاء الحجز',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // ✅ إصلاح Next.js 15

    const booking = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            totalVisits: true,
            language: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'الحجز غير موجود' }, { status: 404 });
    }

    let services = [];
    try {
      services = JSON.parse(booking.services || '[]');
    } catch (error) {
      services = [];
    }

    const bookingDetails = {
      id: booking.id,
      customer: booking.customer,
      date: formatIstanbulDate(fromDatabaseTime(booking.date), 'date'),
      startTime: formatIstanbulDate(fromDatabaseTime(booking.startTime), 'datetime'),
      endTime: formatIstanbulDate(fromDatabaseTime(booking.endTime), 'datetime'),
      services: services,
      status: booking.status,
      totalPrice: booking.totalPrice || 0,
      notes: booking.notes,
      createdAt: formatIstanbulDate(fromDatabaseTime(booking.createdAt), 'datetime'),
      createdBy: booking.createdBy,
    };

    return NextResponse.json({
      success: true,
      booking: bookingDetails,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في جلب تفاصيل الحجز',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}
