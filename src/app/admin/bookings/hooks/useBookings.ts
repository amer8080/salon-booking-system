import { logError } from '@/lib/logger-client';
import { useState, useEffect, useCallback } from 'react';
import { Booking, Service, BlockedTime } from '../types/booking.types';

interface UseBookingsReturn {
  // State
  bookings: Booking[];
  services: { [key: string]: Service };
  servicesWithCategories: { [key: string]: Service };
  allServices: Service[];
  blockedTimes: BlockedTime[];
  loading: boolean;
  error: string;

  // Actions - ✅ إضافة view parameter
  fetchBookings: (startDate: string, endDate: string, view?: string) => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchBlockedTimes: () => Promise<void>;
  refreshData: () => Promise<void>;
  setError: (error: string) => void;
  setBookings: (bookings: Booking[]) => void;
  setBlockedTimes: (blockedTimes: BlockedTime[]) => void;
}

export const useBookings = (): UseBookingsReturn => {
  // State Management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<{ [key: string]: Service }>({});
  const [servicesWithCategories, setServicesWithCategories] = useState<{ [key: string]: Service }>(
    {},
  );
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Fetch Bookings Function - مع view parameter
  const fetchBookings = useCallback(
    async (startDate: string, endDate: string, view: string = 'week') => {
      try {
        setLoading(true);
        setError('');

        // ✅ URL صحيح مع view parameter
        const response = await fetch(
          `/api/admin/bookings?startDate=${startDate}&endDate=${endDate}&view=${view}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setBookings(data.bookings || []);
        } else {
          throw new Error(data.error || 'فشل في جلب الحجوزات');
        }
      } catch (err) {
        logError('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب الحجوزات');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch Services Function
  const fetchServices = useCallback(async () => {
    try {
      setError('');

      const response = await fetch('/api/admin/services');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // تحويل البيانات للصيغ المطلوبة
        const servicesMap: { [key: string]: string } = {};
        const servicesWithCategoriesMap: { [key: string]: Service } = {};

        data.services.forEach((service: Service) => {
          servicesMap[service.id] = service.name;
          servicesWithCategoriesMap[service.id] = service;
        });

        setServices(servicesMap as any);
        setServicesWithCategories(servicesWithCategoriesMap);
        setAllServices(data.services);
      } else {
        throw new Error(data.error || 'فشل في جلب الخدمات');
      }
    } catch (err) {
      logError('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب الخدمات');
    }
  }, []);

  // Fetch Blocked Times Function
  const fetchBlockedTimes = useCallback(async () => {
    try {
      setError('');

      const response = await fetch('/api/admin/blocked-times');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setBlockedTimes(data.blockedTimes || []);
      } else {
        throw new Error(data.error || 'فشل في جلب الأوقات المحظورة');
      }
    } catch (err) {
      logError('Error fetching blocked times:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب الأوقات المحظورة');
    }
  }, []);

  // Refresh All Data Function
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchServices(), fetchBlockedTimes()]);
    } finally {
      setLoading(false);
    }
  }, [fetchServices, fetchBlockedTimes]);

  // Initial Data Loading
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // State
    bookings,
    services,
    servicesWithCategories,
    allServices,
    blockedTimes,
    loading,
    error,

    // Actions
    fetchBookings,
    fetchServices,
    fetchBlockedTimes,
    refreshData,
    setError,
    setBookings,
    setBlockedTimes,
  };
};
