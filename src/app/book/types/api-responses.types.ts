// src/app/book/types/api-responses.types.ts
// تعريفات أنواع استجابات API المختلفة

import { Service } from './booking-form.types';

// Base API Response
export interface BaseAPIResponse {
  success: boolean;
  error?: string;
  details?: any;
  timestamp?: string;
}

// Services API Response
export interface ServicesAPIResponse extends BaseAPIResponse {
  services: Service[];
  count: number;
}

// Available Times API Response
export interface AvailableTimesAPIResponse extends BaseAPIResponse {
  availableSlots: string[];
  bookedSlots: string[];
  blockedSlots: string[];
  totalSlots: number;
  allSlots: number;
  userType: 'customer' | 'admin';
  message?: string;
  firstAvailableTime?: string;
  debug?: {
    selectedDate: string;
    isDayBlocked: boolean;
    reservationsFound: number;
    bookedTimes: string[];
    blockedTimeSlots: string[];
    blockedTimesFound: number;
    filteredOut: number;
  };
}

// Blocked Times API Response
export interface BlockedTimesAPIResponse extends BaseAPIResponse {
  blockedTimes: Array<{
    id: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    isRecurring: boolean;
    recurringType: string | null;
    reason: string | null;
    createdBy: string;
    createdAt: string;
  }>;
  count: number;
}

// Booking Creation Response
export interface BookingAPIResponse extends BaseAPIResponse {
  message: string;
  data: {
    reservationId: number;
    customerId: number;
    customerName: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    services: string[];
    status: 'confirmed' | 'pending' | 'cancelled';
    totalVisits: number;
    coupon: {
      code: string;
      discount: number;
      expiresAt: string | null;
    } | null;
  };
}

// Phone Verification Responses (للمستقبل إذا تم دمج OTP حقيقي)
export interface SendOTPResponse extends BaseAPIResponse {
  otpSent: boolean;
  phoneNumber: string;
  expiresIn: number; // seconds
  retryAfter?: number; // seconds
}

export interface VerifyOTPResponse extends BaseAPIResponse {
  verified: boolean;
  customerExists: boolean;
  customerData?: {
    id: number;
    name: string;
    totalVisits: number;
    lastVisit: string | null;
    preferredLanguage: string;
  };
  token?: string; // للمستقبل إذا تم إضافة authentication
}

// Error Response Types
export interface APIError extends BaseAPIResponse {
  success: false;
  error: string;
  errorCode?: string;
  errorType:
    | 'validation'
    | 'network'
    | 'server'
    | 'timeout'
    | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'conflict'
    | 'unknown';
  details?: {
    field?: string;
    message?: string;
    code?: number;
    stack?: string; // في development فقط
  };
  retryable: boolean;
  retryAfter?: number;
}

// Request Types
export interface BookingRequest {
  phoneNumber: string;
  customerName: string;
  selectedDate: string;
  selectedTime: string;
  selectedServices: string[];
  language?: 'ar' | 'en' | 'tr';
  source?: 'web' | 'mobile' | 'app';
}

export interface AvailableTimesRequest {
  date: string;
  userType?: 'customer' | 'admin';
  serviceIds?: string[]; // للمستقبل: فلترة حسب مدة الخدمات
}

export interface SendOTPRequest {
  phoneNumber: string;
  customerName: string;
  language?: 'ar' | 'en' | 'tr';
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
}

// Response Handler Types
export type APIResponseHandler<T> = (response: T) => void;
export type APIErrorHandler = (error: APIError) => void;

export interface APICallOptions {
  retries?: number;
  timeout?: number;
  onSuccess?: APIResponseHandler<any>;
  onError?: APIErrorHandler;
  onFinally?: () => void;
}

// Loading States
export interface APILoadingState {
  isLoading: boolean;
  error: APIError | null;
  retryCount: number;
  lastUpdated: Date | null;
}

export interface APICallState<T> extends APILoadingState {
  data: T | null;
  hasData: boolean;
}

// Batch API calls (للمستقبل)
export interface BatchAPIRequest {
  services: boolean;
  blockedTimes: boolean;
  availableTimes?: {
    date: string;
    userType?: 'customer' | 'admin';
  };
}

export interface BatchAPIResponse extends BaseAPIResponse {
  services?: ServicesAPIResponse;
  blockedTimes?: BlockedTimesAPIResponse;
  availableTimes?: AvailableTimesAPIResponse;
  errors?: Record<string, APIError>;
}

// Retry Logic Types
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

export interface RetryState {
  attempt: number;
  nextRetryIn: number;
  isRetrying: boolean;
  canRetry: boolean;
}

// Cache Types (للمستقبل)
export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
  key: string;
}

export interface CacheOptions {
  ttl: number; // seconds
  staleWhileRevalidate: boolean;
  key: string;
}

// WebSocket types (للمستقبل - real-time updates)
export interface RealtimeUpdate {
  type: 'booking_created' | 'booking_cancelled' | 'time_blocked' | 'time_unblocked';
  data: any;
  timestamp: string;
}

export interface RealtimeConfig {
  enabled: boolean;
  reconnectAttempts: number;
  heartbeatInterval: number;
}
