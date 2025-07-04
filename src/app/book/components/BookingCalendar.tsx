// src/app/book/components/BookingCalendar.tsx
// تقويم تفاعلي مع دعم Swipe للجوال

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { CalendarProps, CalendarDay } from '../types/calendar.types';
import { useCalendar, useCalendarKeyboard } from '../hooks/useCalendar';
import { formatArabicDate, parseIstanbulDate } from '@/lib/timezone';

export default function BookingCalendar({
  selectedDate,
  blockedDays = [],
  onDateSelect,
  onMonthChange,
  showAvailableSlots = false,
  className = '',
}: CalendarProps) {
  const calendar = useCalendar({
    blockedDays,
    selectedDate,
    onDateSelect,
    onMonthChange,
    enableSwipe: true,
    autoSelectFirstAvailable: false,
  });

  const { handleKeyDown } = useCalendarKeyboard(calendar);
  const [firstAvailableTime, setFirstAvailableTime] = useState<string | null>(null);

  // Load first available time when date is selected
  useEffect(() => {
    if (selectedDate) {
      // Simulate API call to get first available time
      // In real implementation, this would come from useTimeSlots hook
      setFirstAvailableTime('10:00 ص');
    }
  }, [selectedDate]);

  const handleDateClick = (day: CalendarDay) => {
    if (calendar.isDaySelectable(day)) {
      calendar.selectDate(day.date);
    }
  };

  const getWeekDayNames = () => {
    return ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={calendar.goToPreviousMonth}
            disabled={!calendar.canGoPrevious}
            className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="الشهر السابق"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800">{calendar.currentMonth?.monthName}</h3>
            <p className="text-sm text-gray-600">اختر التاريخ المناسب</p>
          </div>

          <button
            onClick={calendar.goToNextMonth}
            disabled={!calendar.canGoNext}
            className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="الشهر التالي"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Month Navigation Dots */}
        <div className="flex justify-center space-x-2 rtl:space-x-reverse">
          {calendar.state.months.map((_, index) => (
            <button
              key={index}
              onClick={() => calendar.goToMonth(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === calendar.currentMonthIndex
                  ? 'bg-purple-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`الشهر ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="p-4"
        {...calendar.swipeHandlers}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="grid"
        aria-label="تقويم اختيار التاريخ"
      >
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {getWeekDayNames().map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div
          className={`grid grid-cols-7 gap-1 transition-transform duration-300 ${
            calendar.gestureState.isDragging
              ? `transform translate-x-[${calendar.gestureState.deltaX}px]`
              : ''
          }`}
        >
          {calendar.currentMonth?.days.map((dayData, index) => (
            <div key={index} className="aspect-square">
              {dayData ? (
                <CalendarDayButton
                  day={dayData}
                  onClick={() => handleDateClick(dayData)}
                  isSelected={calendar.isDateSelected(dayData.date)}
                  firstAvailableTime={
                    calendar.isDateSelected(dayData.date) ? firstAvailableTime : null
                  }
                  showAvailableSlots={showAvailableSlots}
                />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="bg-purple-50 border-t border-purple-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">التاريخ المختار</p>
                <p className="text-purple-700">
                  {formatArabicDate(parseIstanbulDate(selectedDate))}
                </p>
              </div>
            </div>

            {firstAvailableTime && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-green-700">أول موعد: {firstAvailableTime}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Swipe Indicator */}
      {calendar.gestureState.isDragging && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-full p-3 shadow-lg">
            {calendar.gestureState.direction === 'left' ? (
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-600" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Calendar Day Button Component
function CalendarDayButton({
  day,
  onClick,
  isSelected,
  firstAvailableTime,
  showAvailableSlots = false,
}: {
  day: CalendarDay;
  onClick: () => void;
  isSelected: boolean;
  firstAvailableTime?: string | null;
  showAvailableSlots?: boolean;
}) {
  const getButtonStyles = () => {
    if (day.isPast || day.isBlocked) {
      return 'text-gray-300 cursor-not-allowed bg-gray-50';
    }

    if (isSelected) {
      return 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-200';
    }

    if (day.isToday) {
      return 'bg-blue-100 text-blue-600 hover:bg-blue-200 border-2 border-blue-300';
    }

    return 'text-gray-700 hover:bg-purple-100 hover:text-purple-700 bg-white border border-gray-200';
  };

  const isSelectable = !day.isPast && !day.isBlocked;

  return (
    <button
      onClick={onClick}
      disabled={!isSelectable}
      className={`
        w-full h-full rounded-lg text-sm font-medium transition-all duration-200 
        flex flex-col items-center justify-center relative group
        ${getButtonStyles()}
        ${isSelectable ? 'active:scale-95' : ''}
      `}
      aria-label={`
        ${day.day} ${day.dayName}
        ${day.isToday ? '- اليوم' : ''}
        ${day.isBlocked ? '- محظور' : ''}
        ${day.isPast ? '- في الماضي' : ''}
        ${isSelected ? '- مختار' : ''}
      `}
      role="gridcell"
    >
      {/* Day Number */}
      <span className="text-base font-bold">{day.day}</span>

      {/* Today Indicator */}
      {day.isToday && !isSelected && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
        </div>
      )}

      {/* Blocked Indicator */}
      {day.isBlocked && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      )}

      {/* Available Slots Count */}
      {showAvailableSlots &&
        day.availableSlotsCount !== undefined &&
        day.availableSlotsCount > 0 && (
          <span className="text-xs text-green-600 mt-1">{day.availableSlotsCount}</span>
        )}

      {/* First Available Time */}
      {isSelected && firstAvailableTime && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {firstAvailableTime}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-600 rotate-45"></div>
        </div>
      )}

      {/* Hover Effect for Available Days */}
      {isSelectable && !isSelected && (
        <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
      )}
    </button>
  );
}

// Compact Calendar for Mobile
export function CompactCalendar({
  selectedDate,
  blockedDays = [],
  onDateSelect,
  className = '',
}: Omit<CalendarProps, 'onMonthChange' | 'showAvailableSlots'>) {
  const calendar = useCalendar({
    blockedDays,
    selectedDate,
    onDateSelect,
    enableSwipe: true,
    monthsCount: 2,
  });

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
        <button
          onClick={calendar.goToPreviousMonth}
          disabled={!calendar.canGoPrevious}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <h4 className="text-sm font-medium text-gray-800">{calendar.currentMonth?.monthName}</h4>

        <button
          onClick={calendar.goToNextMonth}
          disabled={!calendar.canGoNext}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Compact Grid */}
      <div className="p-2" {...calendar.swipeHandlers}>
        <div className="grid grid-cols-7 gap-1 text-xs mb-1">
          {['أحد', 'إث', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'].map((day) => (
            <div key={day} className="text-center text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendar.currentMonth?.days.map((dayData, index) => (
            <div key={index} className="aspect-square">
              {dayData ? (
                <button
                  onClick={() => dayData && calendar.selectDate(dayData.date)}
                  disabled={!dayData || dayData.isPast || dayData.isBlocked}
                  className={`
                    w-full h-full rounded text-xs font-medium transition-all duration-200
                    ${
                      calendar.isDateSelected(dayData.date)
                        ? 'bg-purple-500 text-white'
                        : dayData.isToday
                          ? 'bg-blue-100 text-blue-600'
                          : dayData.isPast || dayData.isBlocked
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {dayData.day}
                </button>
              ) : (
                <div />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="p-2 bg-purple-50 border-t text-center">
          <p className="text-xs text-purple-700">
            {formatArabicDate(parseIstanbulDate(selectedDate))}
          </p>
        </div>
      )}
    </div>
  );
}

// Calendar Legend Component
export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
        <span>اليوم</span>
      </div>
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <div className="w-3 h-3 bg-purple-500 rounded"></div>
        <span>مختار</span>
      </div>
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <div className="w-3 h-3 bg-gray-200 rounded"></div>
        <span>متاح</span>
      </div>
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <div className="w-3 h-3 bg-gray-50 rounded opacity-50"></div>
        <span>غير متاح</span>
      </div>
    </div>
  );
}
