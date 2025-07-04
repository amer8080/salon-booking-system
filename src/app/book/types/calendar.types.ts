// src/app/book/types/calendar.types.ts
// تعريفات الأنواع الخاصة بالتقويم والتواريخ

export interface CalendarDay {
  day: number;
  date: string; // YYYY-MM-DD format
  isToday: boolean;
  isPast: boolean;
  isBlocked: boolean;
  isSelected: boolean;
  dayName: string; // اسم اليوم بالعربية
  hasAvailableSlots?: boolean;
  availableSlotsCount?: number;
  firstAvailableTime?: string;
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-11 (JavaScript month)
  monthName: string; // اسم الشهر بالعربية مع السنة
  monthNameShort: string; // اسم مختصر
  days: (CalendarDay | null)[]; // null للأيام الفارغة في بداية/نهاية الشهر
  totalDays: number;
  availableDaysCount: number;
}

export interface CalendarState {
  currentMonthIndex: number;
  months: CalendarMonth[];
  selectedDate: string;
  blockedDays: string[];
  availableDates: string[];
  isLoading: boolean;
  error: string;
}

export interface CalendarProps {
  selectedDate: string;
  blockedDays: string[];
  onDateSelect: (date: string) => void;
  onMonthChange?: (monthIndex: number) => void;
  showAvailableSlots?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export interface CalendarNavigationProps {
  currentMonth: CalendarMonth;
  currentIndex: number;
  totalMonths: number;
  onPrevious: () => void;
  onNext: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export interface SwipeGestureProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface TimeSlot {
  time: string; // HH:MM format
  label: string; // عرض مع ص/م
  isAvailable: boolean;
  isBooked: boolean;
  isBlocked: boolean;
  isPast: boolean;
}

export interface TimeSlotsState {
  slots: TimeSlot[];
  selectedTime: string;
  isLoading: boolean;
  error: string;
  firstAvailableTime: string | null;
}

export interface TimeSlotsProps {
  selectedDate: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  onRetry?: () => void;
  userType?: 'customer' | 'admin';
  className?: string;
}

// Working hours configuration
export interface WorkingHours {
  start: string; // HH:MM
  end: string; // HH:MM
  slotDuration: number; // minutes
  breakTimes?: Array<{
    start: string;
    end: string;
    reason?: string;
  }>;
}

// Calendar generation options
export interface CalendarGenerationOptions {
  monthsCount: number; // عدد الأشهر للعرض
  startFromToday: boolean;
  includeBlockedDays: boolean;
  workingHours: WorkingHours;
  timezone: string;
}

// Calendar utilities types
export interface DateRange {
  start: string;
  end: string;
}

export interface CalendarFilters {
  showOnlyAvailable: boolean;
  showBlockedDays: boolean;
  highlightToday: boolean;
  showWeekNumbers: boolean;
}

// Mobile-specific types
export interface MobileCalendarProps extends CalendarProps {
  compact: boolean;
  touchOptimized: boolean;
  swipeEnabled: boolean;
  hapticFeedback: boolean;
}

export interface CalendarGestureState {
  isDragging: boolean;
  startX: number;
  currentX: number;
  deltaX: number;
  velocity: number;
  direction: 'left' | 'right' | null;
}

// Arabic date formatting
export interface ArabicDateOptions {
  includeYear: boolean;
  includeDayName: boolean;
  shortFormat: boolean;
  numerals: 'arabic' | 'english';
}

// Calendar view modes
export type CalendarViewMode = 'month' | 'week' | 'day';

export interface CalendarViewProps {
  mode: CalendarViewMode;
  onModeChange: (mode: CalendarViewMode) => void;
  currentDate: string;
  onDateChange: (date: string) => void;
}

// Error handling for calendar
export interface CalendarError {
  type: 'network' | 'validation' | 'server' | 'unknown';
  message: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
}

export interface CalendarErrorState {
  hasError: boolean;
  error: CalendarError | null;
  retryCount: number;
  isRetrying: boolean;
}
