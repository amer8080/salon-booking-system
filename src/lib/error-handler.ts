// src/lib/error-handler.ts
// معالج الأخطاء المبسط - بدون logging

export function useErrorHandler() {
  const autoFixBooking = (booking: any) => {
    return {
      ...booking,
      customerName: booking.customerName || 'عميل غير محدد',
      customerPhone: booking.customerPhone || '',
      serviceIds: booking.serviceIds || booking.services || []
    };
  };

  return { autoFixBooking };
}