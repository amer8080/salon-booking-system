﻿import { logWarn } from '@/lib/logger-client';
// src/app/book/hooks/useCalendar.ts
// Hook لإدارة التقويم مع دعم Swipe للجوال

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  CalendarState,
  CalendarMonth,
  CalendarDay,
  CalendarGestureState,
} from '../types/calendar.types';
import {
  generateCalendarMonths,
  updateSelectedDate,
  findDayInMonths,
  getFirstAvailableDay,
  canNavigateMonth,
  isDaySelectable,
} from '../utils/calendar-generator';
import { getTodayIstanbul } from '@/lib/timezone';

interface UseCalendarProps {
  blockedDays?: string[];
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  onMonthChange?: (monthIndex: number) => void;
  monthsCount?: number;
  enableSwipe?: boolean;
  swipeThreshold?: number;
  autoSelectFirstAvailable?: boolean;
}

interface UseCalendarReturn {
  // State
  state: CalendarState;
  currentMonthIndex: number;
  currentMonth: CalendarMonth;

  // Actions
  selectDate: (date: string) => boolean;
  goToNextMonth: () => boolean;
  goToPreviousMonth: () => boolean;
  goToMonth: (index: number) => boolean;
  refresh: () => void;

  // Swipe handling
  swipeHandlers: {
    onTouchStart: (_e: React.TouchEvent) => void;
    onTouchMove: (_e: React.TouchEvent) => void;
    onTouchEnd: (_e: React.TouchEvent) => void;
  };
  gestureState: CalendarGestureState;

  // Navigation info
  canGoNext: boolean;
  canGoPrevious: boolean;

  // Computed values
  availableDates: string[];
  selectedDay: CalendarDay | null;
  todayString: string;

  // Helper functions
  isDaySelectable: (day: CalendarDay | null) => boolean;
  isDateSelected: (date: string) => boolean;
  findNextAvailableDate: (fromDate?: string) => string | null;
  findPreviousAvailableDate: (fromDate?: string) => string | null;
}

const DEFAULT_SWIPE_THRESHOLD = 100; // pixels
const DEFAULT_MONTHS_COUNT = 3;

export function useCalendar({
  blockedDays = [],
  selectedDate = '',
  onDateSelect,
  onMonthChange,
  monthsCount = DEFAULT_MONTHS_COUNT,
  enableSwipe = true,
  swipeThreshold = DEFAULT_SWIPE_THRESHOLD,
  autoSelectFirstAvailable = false,
}: UseCalendarProps = {}): UseCalendarReturn {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [gestureState, setGestureState] = useState<CalendarGestureState>({
    isDragging: false,
    startX: 0,
    currentX: 0,
    deltaX: 0,
    velocity: 0,
    direction: null,
  });

  // Generate initial calendar months
  const initialMonths = useMemo(
    () => generateCalendarMonths(blockedDays, { monthsCount }),
    [blockedDays, monthsCount],
  );

  const [state, setState] = useState<CalendarState>({
    currentMonthIndex: 0,
    months: initialMonths,
    selectedDate,
    blockedDays,
    availableDates: [],
    isLoading: false,
    error: '',
  });

  // Update months when blocked days change
  useEffect(() => {
    const newMonths = generateCalendarMonths(blockedDays, { monthsCount });
    setState((prev) => ({
      ...prev,
      months: newMonths,
      blockedDays,
    }));
  }, [blockedDays, monthsCount]);

  // Update selected date in calendar when it changes
  useEffect(() => {
    if (selectedDate !== state.selectedDate) {
      const updatedMonths = updateSelectedDate(state.months, selectedDate);
      setState((prev) => ({
        ...prev,
        months: updatedMonths,
        selectedDate,
      }));
    }
  }, [selectedDate, state.months, state.selectedDate]);

  // Auto-select first available date if needed
  useEffect(() => {
    if (autoSelectFirstAvailable && !selectedDate && state.months.length > 0) {
      const firstAvailable = getFirstAvailableDay(state.months);
      if (firstAvailable) {
        selectDate(firstAvailable.date);
      }
    }
  }, [autoSelectFirstAvailable, selectedDate, state.months]);

  // Get current month
  const currentMonth = useMemo(
    () => state.months[currentMonthIndex] || state.months[0],
    [state.months, currentMonthIndex],
  );

  // Get available dates
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    state.months.forEach((month) => {
      month.days.forEach((day) => {
        if (day && !day.isPast && !day.isBlocked) {
          dates.push(day.date);
        }
      });
    });
    return dates;
  }, [state.months]);

  // Get selected day object
  const selectedDay = useMemo(() => {
    if (!state.selectedDate) return null;
    const found = findDayInMonths(state.months, state.selectedDate);
    return found?.day || null;
  }, [state.months, state.selectedDate]);

  // Get today's date string
  const todayString = useMemo(() => getTodayIstanbul(), []);

  // Select a date
  const selectDate = useCallback(
    (date: string): boolean => {
      const found = findDayInMonths(state.months, date);
      if (!found || !isDaySelectable(found.day)) {
        return false;
      }

      // Update state
      const updatedMonths = updateSelectedDate(state.months, date);
      setState((prev) => ({
        ...prev,
        months: updatedMonths,
        selectedDate: date,
      }));

      // Navigate to the month containing this date
      if (found.monthIndex !== currentMonthIndex) {
        setCurrentMonthIndex(found.monthIndex);
        onMonthChange?.(found.monthIndex);
      }

      onDateSelect?.(date);
      return true;
    },
    [state.months, currentMonthIndex, onDateSelect, onMonthChange],
  );

  // Navigate to next month
  const goToNextMonth = useCallback((): boolean => {
    if (!canNavigateMonth(currentMonthIndex, state.months.length, 'next')) {
      return false;
    }

    const newIndex = currentMonthIndex + 1;
    setCurrentMonthIndex(newIndex);
    onMonthChange?.(newIndex);
    return true;
  }, [currentMonthIndex, state.months.length, onMonthChange]);

  // Navigate to previous month
  const goToPreviousMonth = useCallback((): boolean => {
    if (!canNavigateMonth(currentMonthIndex, state.months.length, 'prev')) {
      return false;
    }

    const newIndex = currentMonthIndex - 1;
    setCurrentMonthIndex(newIndex);
    onMonthChange?.(newIndex);
    return true;
  }, [currentMonthIndex, state.months.length, onMonthChange]);

  // Navigate to specific month
  const goToMonth = useCallback(
    (index: number): boolean => {
      if (index < 0 || index >= state.months.length) {
        return false;
      }

      setCurrentMonthIndex(index);
      onMonthChange?.(index);
      return true;
    },
    [state.months.length, onMonthChange],
  );

  // Refresh calendar
  const refresh = useCallback(() => {
    const newMonths = generateCalendarMonths(blockedDays, { monthsCount });
    const updatedMonths = selectedDate ? updateSelectedDate(newMonths, selectedDate) : newMonths;

    setState((prev) => ({
      ...prev,
      months: updatedMonths,
      isLoading: false,
      error: '',
    }));
  }, [blockedDays, monthsCount, selectedDate]);

  // Touch event refs for gesture handling
  const touchStartTime = useRef<number>(0);
  const lastTouchX = useRef<number>(0);

  // Handle touch start
  const handleTouchStart = useCallback(
    (_e: React.TouchEvent) => {
      if (!enableSwipe) return;

      const touch = _e.touches[0];
      const startX = touch.clientX;

      touchStartTime.current = Date.now();
      lastTouchX.current = startX;

      setGestureState({
        isDragging: true,
        startX,
        currentX: startX,
        deltaX: 0,
        velocity: 0,
        direction: null,
      });
    },
    [enableSwipe],
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (_e: React.TouchEvent) => {
      if (!enableSwipe || !gestureState.isDragging) return;

      const touch = _e.touches[0];
      const currentX = touch.clientX;
      const deltaX = currentX - gestureState.startX;

      // Calculate velocity
      const currentTime = Date.now();
      const deltaTime = currentTime - touchStartTime.current;
      const velocity = Math.abs(deltaX) / deltaTime;

      setGestureState((prev) => ({
        ...prev,
        currentX,
        deltaX,
        velocity,
        direction: deltaX > 0 ? 'right' : 'left',
      }));

      lastTouchX.current = currentX;
    },
    [enableSwipe, gestureState.isDragging, gestureState.startX],
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (_e: React.TouchEvent) => {
      if (!enableSwipe || !gestureState.isDragging) return;

      const absDeltaX = Math.abs(gestureState.deltaX);
      const shouldSwipe =
        absDeltaX > swipeThreshold || (absDeltaX > 50 && gestureState.velocity > 0.3);

      if (shouldSwipe) {
        if (gestureState.direction === 'left') {
          // Swipe left = next month
          goToNextMonth();
        } else if (gestureState.direction === 'right') {
          // Swipe right = previous month
          goToPreviousMonth();
        }
      }

      // Reset gesture state
      setGestureState({
        isDragging: false,
        startX: 0,
        currentX: 0,
        deltaX: 0,
        velocity: 0,
        direction: null,
      });
    },
    [enableSwipe, gestureState, swipeThreshold, goToNextMonth, goToPreviousMonth],
  );

  // Navigation capabilities
  const canGoNext = canNavigateMonth(currentMonthIndex, state.months.length, 'next');
  const canGoPrevious = canNavigateMonth(currentMonthIndex, state.months.length, 'prev');

  // Helper functions
  const isDateSelected = useCallback(
    (date: string): boolean => {
      return state.selectedDate === date;
    },
    [state.selectedDate],
  );

  const findNextAvailableDate = useCallback(
    (fromDate?: string): string | null => {
      const startDate = fromDate || state.selectedDate || todayString;
      const startIndex = availableDates.indexOf(startDate);

      if (startIndex >= 0 && startIndex < availableDates.length - 1) {
        return availableDates[startIndex + 1];
      }

      return availableDates[0] || null;
    },
    [availableDates, state.selectedDate, todayString],
  );

  const findPreviousAvailableDate = useCallback(
    (fromDate?: string): string | null => {
      const startDate = fromDate || state.selectedDate;
      if (!startDate) return null;

      const startIndex = availableDates.indexOf(startDate);

      if (startIndex > 0) {
        return availableDates[startIndex - 1];
      }

      return null;
    },
    [availableDates, state.selectedDate],
  );

  return {
    // State
    state,
    currentMonthIndex,
    currentMonth,

    // Actions
    selectDate,
    goToNextMonth,
    goToPreviousMonth,
    goToMonth,
    refresh,

    // Swipe handling
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    gestureState,

    // Navigation info
    canGoNext,
    canGoPrevious,

    // Computed values
    availableDates,
    selectedDay,
    todayString,

    // Helper functions
    isDaySelectable,
    isDateSelected,
    findNextAvailableDate,
    findPreviousAvailableDate,
  };
}

// Hook للتعامل مع keyboard navigation في التقويم
export function useCalendarKeyboard(calendar: UseCalendarReturn) {
  const handleKeyDown = useCallback(
    (_e: React.KeyboardEvent) => {
      switch (_e.key) {
        case 'ArrowLeft': {
          _e.preventDefault();
          const prevDate = calendar.findPreviousAvailableDate();
          if (prevDate) calendar.selectDate(prevDate);
          break;
        }

        case 'ArrowRight': {
          _e.preventDefault();
          const nextDate = calendar.findNextAvailableDate();
          if (nextDate) calendar.selectDate(nextDate);
          break;
        }

        case 'ArrowUp':
          _e.preventDefault();
          if (calendar.canGoPrevious) calendar.goToPreviousMonth();
          break;

        case 'ArrowDown':
          _e.preventDefault();
          if (calendar.canGoNext) calendar.goToNextMonth();
          break;

        case 'Home':
          _e.preventDefault();
          // Go to first available date
          if (calendar.availableDates.length > 0) {
            calendar.selectDate(calendar.availableDates[0]);
          }
          break;

        case 'End':
          _e.preventDefault();
          // Go to last available date
          if (calendar.availableDates.length > 0) {
            calendar.selectDate(calendar.availableDates[calendar.availableDates.length - 1]);
          }
          break;
      }
    },
    [calendar],
  );

  return { handleKeyDown };
}

// Hook لإدارة animation transitions بين الأشهر
export function useCalendarAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  const startAnimation = useCallback((direction: 'left' | 'right') => {
    setIsAnimating(true);
    setAnimationDirection(direction);

    // End animation after 300ms
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 300);
  }, []);

  const getAnimationClass = useCallback(() => {
    if (!isAnimating || !animationDirection) return '';

    return animationDirection === 'left' ? 'animate-slide-left' : 'animate-slide-right';
  }, [isAnimating, animationDirection]);

  return {
    isAnimating,
    animationDirection,
    startAnimation,
    getAnimationClass,
  };
}

// Hook لحفظ تفضيلات التقويم
export function useCalendarPreferences() {
  const [preferences, setPreferences] = useState({
    showWeekNumbers: false,
    highlightToday: true,
    showBlockedDays: true,
    compactMode: false,
  });

  const updatePreference = useCallback(
    (key: keyof typeof preferences, value: boolean) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));

      // Save to localStorage
      try {
        localStorage.setItem(
          'calendar_preferences',
          JSON.stringify({
            ...preferences,
            [key]: value,
          }),
        );
      } catch (error) {
        logWarn('Failed to save calendar preferences:', error);
      }
    },
    [preferences],
  );

  // Load preferences on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calendar_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      logWarn('Failed to load calendar preferences:', error);
    }
  }, []);

  return {
    preferences,
    updatePreference,
  };
}

