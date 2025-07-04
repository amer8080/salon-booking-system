interface BlockedTime {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  isRecurring: boolean;
  recurringType: string | null;
  reason: string | null;
  createdBy: string;
  createdAt: string;
}
// ======================================
// Hook مخصص لإدارة منطق العرض اليومي
// ======================================
import { useCallback } from 'react';

interface UseDayViewProps {
  blockedTimes: BlockedTime[];
  fetchBlockedTimes: () => void;
  currentDateRange: any;
  setCurrentDateRange: (range: BlockedTime) => void;
}

export const useDayView = ({
  blockedTimes,
  fetchBlockedTimes,
  currentDateRange,
  setCurrentDateRange,
}: UseDayViewProps) => {
  // ✅ إصلاح: دالة تغيير التاريخ للعرض اليومي - يوم واحد فقط
  const handleDateChange = useCallback(
    (newDate: string, setSelectedDate: (date: string) => void) => {
      setSelectedDate(newDate);

      // ✅ للعرض اليومي: تحميل يوم واحد فقط
      const newRange = {
        startDate: newDate, // ← نفس اليوم
        endDate: newDate, // ← نفس اليوم
        view: 'day' as const,
      };

      // تحديث البيانات إذا كان التاريخ مختلف
      if (newRange.startDate !== currentDateRange.startDate) {
        setCurrentDateRange(newRange);
      }
    },
    [currentDateRange.startDate, setCurrentDateRange],
  );

  // دوال إقفال الأوقات
  const blockSingleTime = useCallback(
    async (date: string, time: string) => {
      try {
        await fetch('/api/admin/blocked-times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            startTime: time,
            endTime: time,
            isRecurring: false,
            reason: 'إقفال وقت من العرض اليومي',
          }),
        });
        fetchBlockedTimes();
        alert('تم إقفال الوقت بنجاح!');
      } catch (error) {
        logError('Time blocking failed', {
          error: error.message,
          operation: 'blockSingleTime',
          date: date,
          time: time,
        });
        alert('فشل في إقفال الوقت - يرجى المحاولة مرة أخرى');
      }
    },
    [fetchBlockedTimes],
  );

  const unblockSingleTime = useCallback(
    async (date: string, time: string) => {
      try {
        const blockedTime = blockedTimes.find(
          (blocked) => blocked.date === date && blocked.startTime === time,
        );

        if (blockedTime) {
          await fetch(`/api/admin/blocked-times/${blockedTime.id}`, {
            method: 'DELETE',
          });
          fetchBlockedTimes();
          alert('تم فتح الوقت بنجاح!');
        }
      } catch (error) {
        logError('Time unblocking failed', {
          error: error.message,
          operation: 'unblockSingleTime',
          date: date,
          time: time,
        });
        alert('فشل في فتح الوقت - يرجى المحاولة مرة أخرى');
      }
    },
    [blockedTimes, fetchBlockedTimes],
  );

  return {
    handleDateChange,
    blockSingleTime,
    unblockSingleTime,
  };
};
