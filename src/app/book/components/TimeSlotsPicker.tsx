// src/app/book/components/TimeSlotsPicker.tsx
// مكون اختيار الأوقات المتاحة

import React, { useState, useEffect } from 'react';
import { Clock, Loader2, RefreshCw, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { TimeSlotsProps, TimeSlot } from '../types/calendar.types';
import { useTimeSlots, useTimeSlotsFilter } from '../hooks/useTimeSlots';
import { formatTimeForDisplay } from '../utils/booking-helpers';

export default function TimeSlotsPicker({
  selectedDate,
  selectedTime,
  onTimeSelect,
  onRetry,
  userType = 'customer',
  className = '',
}: TimeSlotsProps) {
  const {
    state,
    loadTimeSlots,
    selectTime,
    refresh,
    availableSlots,
    hasAvailableSlots,
    isValidSelection,
  } = useTimeSlots({
    selectedDate,
    userType,
    autoLoad: true,
    onSlotsLoaded: (slots) => {
      // Auto-select first available time if none selected
      if (!selectedTime && slots.length > 0) {
        const firstAvailable = slots.find((slot) => slot.isAvailable);
        if (firstAvailable) {
          onTimeSelect(firstAvailable.time);
        }
      }
    },
    onFirstAvailableTime: (_time) => {},
  });

  const [showFilters, setShowFilters] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const { filteredSlots, showOnlyAvailable, setShowOnlyAvailable, timeOfDay, setTimeOfDay } =
    useTimeSlotsFilter(state.slots);

  const displaySlots = showFilters ? filteredSlots : state.slots;

  useEffect(() => {
    if (selectedTime !== state.selectedTime) {
      selectTime(selectedTime);
    }
  }, [selectedTime, selectTime, state.selectedTime]);

  const handleTimeClick = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      onTimeSelect(slot.time);
    }
  };

  const handleRefresh = async () => {
    const success = await refresh();
    if (success) {
      setLastRefresh(new Date());
    }
  };

  const handleRetry = () => {
    onRetry?.();
    loadTimeSlots();
  };

  const getSlotStyles = (slot: TimeSlot) => {
    if (slot.time === selectedTime) {
      return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg ring-2 ring-purple-200 scale-105';
    }

    if (slot.isBlocked) {
      return 'bg-red-50 text-red-600 border-red-200 cursor-not-allowed opacity-60';
    }

    if (slot.isBooked) {
      return 'bg-orange-50 text-orange-600 border-orange-200 cursor-not-allowed opacity-60';
    }

    if (slot.isPast) {
      return 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50';
    }

    if (slot.isAvailable) {
      return 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 active:scale-95';
    }

    return 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed';
  };

  const getSlotIcon = (slot: TimeSlot) => {
    if (slot.time === selectedTime) {
      return <CheckCircle className="w-4 h-4" />;
    }

    if (slot.isBlocked) {
      return <span className="text-xs">🔒</span>;
    }

    if (slot.isBooked) {
      return <span className="text-xs">📅</span>;
    }

    return <Clock className="w-4 h-4" />;
  };

  if (state.isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">جاري تحميل الأوقات المتاحة...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`bg-white rounded-xl border border-red-200 p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">خطأ في تحميل الأوقات</h3>
          <p className="text-red-600 mb-4">{state.error}</p>
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">الأوقات المتاحة</h3>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showFilters
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label="فلاتر الأوقات"
            >
              <Filter className="w-4 h-4" />
            </button>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors duration-200"
              aria-label="تحديث الأوقات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {availableSlots.length} وقت متاح من {state.slots.length}
          </span>

          {state.firstAvailableTime && (
            <span className="text-green-600 font-medium">
              أول موعد: {formatTimeForDisplay(state.firstAvailableTime)}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">الأوقات المتاحة فقط</span>
            </label>

            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">جميع الأوقات</option>
              <option value="morning">الصباح (11:00 - 14:00)</option>
              <option value="afternoon">بعد الظهر (14:00 - 17:00)</option>
              <option value="evening">المساء (17:00 - 18:30)</option>
            </select>
          </div>
        </div>
      )}

      {/* Time Slots Grid */}
      <div className="p-4">
        {!hasAvailableSlots ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد أوقات متاحة</h3>
            <p className="text-gray-500 mb-4">جميع المواعيد محجوزة أو مقفلة في هذا التاريخ</p>
            <p className="text-sm text-gray-400">جرب تاريخاً آخر أو تواصل معنا مباشرة</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
            {displaySlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => handleTimeClick(slot)}
                disabled={!slot.isAvailable}
                className={`
                  relative p-4 rounded-lg border-2 font-medium transition-all duration-200 text-sm
                  flex flex-col items-center justify-center min-h-[80px] group
                  ${getSlotStyles(slot)}
                `}
                aria-label={`
                  ${slot.label}
                  ${slot.time === selectedTime ? ' - مختار' : ''}
                  ${slot.isBooked ? ' - محجوز' : ''}
                  ${slot.isBlocked ? ' - مقفل' : ''}
                  ${slot.isPast ? ' - مضى' : ''}
                  ${slot.isAvailable ? ' - متاح' : ''}
                `}
              >
                {/* Time Display */}
                <div className="flex items-center space-x-1 rtl:space-x-reverse mb-1">
                  {getSlotIcon(slot)}
                  <span className="font-bold">{slot.time}</span>
                </div>

                {/* Status Label */}
                <span className="text-xs opacity-80">
                  {slot.time === selectedTime
                    ? 'مختار'
                    : slot.isBooked
                      ? 'محجوز'
                      : slot.isBlocked
                        ? 'مقفل'
                        : slot.isPast
                          ? 'مضى'
                          : 'متاح'}
                </span>

                {/* Selection Indicator */}
                {slot.time === selectedTime && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                      ✓
                    </div>
                  </div>
                )}

                {/* Hover Effect */}
                {slot.isAvailable && slot.time !== selectedTime && (
                  <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Time Display */}
      {selectedTime && isValidSelection && (
        <div className="bg-purple-50 border-t border-purple-100 p-4">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <div className="text-center">
              <p className="text-sm font-medium text-purple-800">الوقت المختار</p>
              <p className="text-lg font-bold text-purple-700">
                {formatTimeForDisplay(selectedTime)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Refresh Info */}
      {lastRefresh && (
        <div className="text-center text-xs text-gray-500 p-2 border-t">
          آخر تحديث: {lastRefresh.toLocaleTimeString('ar-SA')}
        </div>
      )}
    </div>
  );
}

// Compact Time Slots for Mobile
export function CompactTimeSlots({
  selectedDate,
  selectedTime,
  onTimeSelect,
  className = '',
}: Omit<TimeSlotsProps, 'onRetry' | 'userType'>) {
  const { availableSlots, state } = useTimeSlots({
    selectedDate,
    userType: 'customer',
    autoLoad: true,
  });

  if (state.isLoading) {
    return (
      <div className={`bg-white rounded-lg border p-3 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin ml-2" />
          <span className="text-sm text-gray-600">تحميل الأوقات...</span>
        </div>
      </div>
    );
  }

  if (!availableSlots.length) {
    return (
      <div className={`bg-gray-50 rounded-lg border p-3 text-center ${className}`}>
        <p className="text-sm text-gray-600">لا توجد أوقات متاحة</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-3 border-b bg-gray-50">
        <h4 className="text-sm font-medium text-gray-800">
          الأوقات المتاحة ({availableSlots.length})
        </h4>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.slice(0, 6).map((slot) => (
            <button
              key={slot.time}
              onClick={() => onTimeSelect(slot.time)}
              className={`
                p-2 rounded text-xs font-medium transition-all duration-200
                ${
                  slot.time === selectedTime
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                }
              `}
            >
              {slot.time}
            </button>
          ))}
        </div>

        {availableSlots.length > 6 && (
          <button className="w-full mt-2 text-xs text-purple-600 hover:text-purple-800">
            عرض جميع الأوقات ({availableSlots.length})
          </button>
        )}
      </div>
    </div>
  );
}

// Time Slot Statistics
export function TimeSlotsStats({
  slots,
  className = '',
}: {
  slots: TimeSlot[];
  className?: string;
}) {
  const stats = {
    total: slots.length,
    available: slots.filter((s) => s.isAvailable).length,
    booked: slots.filter((s) => s.isBooked).length,
    blocked: slots.filter((s) => s.isBlocked).length,
    past: slots.filter((s) => s.isPast).length,
  };

  const percentage = Math.round((stats.available / stats.total) * 100) || 0;

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-800 mb-3">إحصائيات الأوقات</h4>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">متاح</span>
          <span className="font-medium text-green-600">{stats.available}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">محجوز</span>
          <span className="font-medium text-orange-600">{stats.booked}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">مقفل</span>
          <span className="font-medium text-red-600">{stats.blocked}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">مضى</span>
          <span className="font-medium text-gray-400">{stats.past}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">معدل التوفر</span>
          <span className="font-medium text-purple-600">{percentage}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

