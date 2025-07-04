// src/app/admin/bookings/components/UI/LoadingSpinner.tsx
// مكون Loading المحسن والقابل لإعادة الاستخدام

import { Calendar } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  message = 'جاري تحميل الحجوزات...',
  size = 'medium',
  showIcon = true,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    medium: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-base',
    },
    large: {
      container: 'w-24 h-24',
      icon: 'w-12 h-12',
      text: 'text-lg',
    },
  };

  const currentSize = sizeClasses[size];

  if (size === 'small') {
    return (
      <div className={`flex items-center space-x-2 rtl:space-x-reverse ${className}`}>
        {showIcon && (
          <div
            className={`${currentSize.container} bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse`}
          >
            <Calendar className={`${currentSize.icon} text-white`} />
          </div>
        )}
        {message && <p className={`text-gray-600 ${currentSize.text}`}>{message}</p>}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center ${className}`}
    >
      <div className="text-center">
        {showIcon && (
          <div
            className={`${currentSize.container} bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
          >
            <Calendar className={`${currentSize.icon} text-white`} />
          </div>
        )}
        {message && <p className={`text-gray-600 ${currentSize.text}`}>{message}</p>}

        {/* Loading dots animation */}
        <div className="flex items-center justify-center space-x-1 mt-4">
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Component للاستخدام داخل modals أو containers صغيرة
export function InlineLoadingSpinner({
  message = 'جاري التحميل...',
  className = '',
}: Omit<LoadingSpinnerProps, 'size'>) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <p className="text-gray-600 text-sm">{message}</p>

        {/* Loading dots */}
        <div className="flex items-center justify-center space-x-1 mt-2">
          <div
            className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Component للاستخدام في buttons
export function ButtonLoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      <span>جاري المعالجة...</span>
    </div>
  );
}

// Skeleton loader للحجوزات
export function BookingSkeleton() {
  return (
    <div className="border rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Calendar day skeleton
export function CalendarDaySkeleton() {
  return (
    <div className="h-24 border rounded-lg p-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-6 mb-2"></div>
      <div className="space-y-1">
        <div className="h-3 bg-gray-200 rounded w-12"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}
