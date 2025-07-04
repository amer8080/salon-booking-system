import { logError } from '@/lib/logger-client';
// src/app/book/hooks/useServices.ts
// Hook لإدارة تحميل الخدمات واختيارها

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Service, ServicesState } from '../types/booking-form.types';
import { ServicesAPIResponse } from '../types/api-responses.types';
import { executeWithRetry, handleServicesError } from '../utils/error-handling';
import { groupServicesByCategory, formatDuration } from '../utils/booking-helpers';

interface UseServicesProps {
  autoLoad?: boolean;
  onError?: (error: any) => void;
  onServicesLoaded?: (services: Service[]) => void;
}

interface UseServicesReturn {
  // State
  state: ServicesState;
  selectedServices: string[];

  // Actions
  loadServices: () => Promise<boolean>;
  toggleService: (serviceId: string) => void;
  selectService: (serviceId: string) => void;
  deselectService: (serviceId: string) => void;
  clearSelection: () => void;
  setSelectedServices: (serviceIds: string[]) => void;
  refresh: () => Promise<boolean>;

  // Computed values
  servicesGrouped: Record<string, Service[]>;
  selectedServicesData: Service[];
  totalDuration: number;
  totalPrice: number;
  selectionSummary: string;

  // Validation
  hasSelection: boolean;
  canSelectMore: boolean;
  isValidSelection: boolean;

  // Helpers
  getServiceById: (id: string) => Service | undefined;
  isServiceSelected: (id: string) => boolean;
  getServicesByCategory: (category: string) => Service[];
  getCategoryCount: (category: string) => number;
}

const MAX_SERVICES_PER_BOOKING = 10;

export function useServices({
  autoLoad = true,
  onError,
  onServicesLoaded,
}: UseServicesProps = {}): UseServicesReturn {
  const [state, setState] = useState<ServicesState>({
    services: [],
    servicesLoading: false,
    servicesError: '',
  });

  const [selectedServices, setSelectedServicesState] = useState<string[]>([]);

  // Load services from API
  const loadServices = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({
        ...prev,
        servicesLoading: true,
        servicesError: '',
      }));

      const response = await executeWithRetry(async () => {
        const res = await fetch('/api/services');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      });

      const data: ServicesAPIResponse = response;

      if (data.success && data.services) {
        setState((prev) => ({
          ...prev,
          services: data.services,
          servicesLoading: false,
          servicesError: '',
        }));

        onServicesLoaded?.(data.services);
        return true;
      } else {
        throw new Error(data.error || 'فشل في تحميل الخدمات');
      }
    } catch (error) {
      await logError('Failed to load services:', error);

      const errorHandler = handleServicesError(error);
      setState((prev) => ({
        ...prev,
        servicesLoading: false,
        servicesError: errorHandler.message,
      }));

      onError?.(error);
      return false;
    }
  }, [onError, onServicesLoaded]);

  // Auto-load services on mount
  useEffect(() => {
    if (autoLoad && state.services.length === 0 && !state.servicesLoading) {
      loadServices();
    }
  }, [autoLoad, loadServices, state.services.length, state.servicesLoading]);

  // Toggle service selection
  const toggleService = useCallback((serviceId: string) => {
    setSelectedServicesState((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        // Check if we can add more services
        if (prev.length >= MAX_SERVICES_PER_BOOKING) {
          return prev; // Don't add if at max
        }
        return [...prev, serviceId];
      }
    });
  }, []);

  // Select a service (add if not selected)
  const selectService = useCallback((serviceId: string) => {
    setSelectedServicesState((prev) => {
      if (!prev.includes(serviceId) && prev.length < MAX_SERVICES_PER_BOOKING) {
        return [...prev, serviceId];
      }
      return prev;
    });
  }, []);

  // Deselect a service (remove if selected)
  const deselectService = useCallback((serviceId: string) => {
    setSelectedServicesState((prev) => prev.filter((id) => id !== serviceId));
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedServicesState([]);
  }, []);

  // Set multiple services at once
  const setSelectedServices = useCallback(
    (serviceIds: string[]) => {
      // Validate that all service IDs exist and limit to max
      const validIds = serviceIds
        .filter((id) => state.services.some((service) => service.id === id))
        .slice(0, MAX_SERVICES_PER_BOOKING);

      setSelectedServicesState(validIds);
    },
    [state.services],
  );

  // Refresh services (reload from API)
  const refresh = useCallback(async (): Promise<boolean> => {
    return await loadServices();
  }, [loadServices]);

  // Computed values
  const servicesGrouped = useMemo(() => groupServicesByCategory(state.services), [state.services]);

  const selectedServicesData = useMemo(
    () => state.services.filter((service) => selectedServices.includes(service.id)),
    [state.services, selectedServices],
  );

  const totalDuration = useMemo(
    () => selectedServicesData.reduce((total, service) => total + service.duration, 0),
    [selectedServicesData],
  );

  const totalPrice = useMemo(
    () => selectedServicesData.reduce((total, service) => total + service.price, 0),
    [selectedServicesData],
  );

  const selectionSummary = useMemo(() => {
    if (selectedServicesData.length === 0) return 'لم تختر أي خدمة';
    if (selectedServicesData.length === 1) return `خدمة واحدة: ${selectedServicesData[0].nameAr}`;
    return `${selectedServicesData.length} خدمات مختارة`;
  }, [selectedServicesData]);

  // Validation
  const hasSelection = selectedServices.length > 0;
  const canSelectMore = selectedServices.length < MAX_SERVICES_PER_BOOKING;
  const isValidSelection =
    selectedServices.length > 0 && selectedServices.length <= MAX_SERVICES_PER_BOOKING;

  // Helper functions
  const getServiceById = useCallback(
    (id: string): Service | undefined => {
      return state.services.find((service) => service.id === id);
    },
    [state.services],
  );

  const isServiceSelected = useCallback(
    (id: string): boolean => {
      return selectedServices.includes(id);
    },
    [selectedServices],
  );

  const getServicesByCategory = useCallback(
    (category: string): Service[] => {
      return state.services.filter((service) => service.category === category);
    },
    [state.services],
  );

  const getCategoryCount = useCallback(
    (category: string): number => {
      return getServicesByCategory(category).length;
    },
    [getServicesByCategory],
  );

  return {
    // State
    state,
    selectedServices,

    // Actions
    loadServices,
    toggleService,
    selectService,
    deselectService,
    clearSelection,
    setSelectedServices,
    refresh,

    // Computed values
    servicesGrouped,
    selectedServicesData,
    totalDuration,
    totalPrice,
    selectionSummary,

    // Validation
    hasSelection,
    canSelectMore,
    isValidSelection,

    // Helpers
    getServiceById,
    isServiceSelected,
    getServicesByCategory,
    getCategoryCount,
  };
}

// Hook للبحث في الخدمات
export function useServicesSearch(services: Service[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Service[]>(services);

  const search = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setSearchResults(services);
        return;
      }

      const lowerQuery = query.toLowerCase().trim();
      const filtered = services.filter(
        (service) =>
          service.nameAr.toLowerCase().includes(lowerQuery) ||
          service.nameEn.toLowerCase().includes(lowerQuery) ||
          service.nameTr.toLowerCase().includes(lowerQuery) ||
          service.category.toLowerCase().includes(lowerQuery) ||
          (service.description && service.description.toLowerCase().includes(lowerQuery)),
      );

      setSearchResults(filtered);
    },
    [services],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(services);
  }, [services]);

  // Update results when services change
  useEffect(() => {
    if (searchQuery) {
      search(searchQuery);
    } else {
      setSearchResults(services);
    }
  }, [services, searchQuery, search]);

  return {
    searchQuery,
    searchResults,
    search,
    clearSearch,
    hasResults: searchResults.length > 0,
    hasQuery: searchQuery.trim().length > 0,
  };
}

// Hook لفلترة الخدمات حسب الفئة
export function useServicesFilter(services: Service[]) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [durationRange, setDurationRange] = useState<[number, number] | null>(null);

  const categories = useMemo(() => {
    const cats = [...new Set(services.map((s) => s.category))];
    return cats.sort();
  }, [services]);

  const priceExtent = useMemo(() => {
    if (services.length === 0) return [0, 0];
    const prices = services.map((s) => s.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [services]);

  const durationExtent = useMemo(() => {
    if (services.length === 0) return [0, 0];
    const durations = services.map((s) => s.duration);
    return [Math.min(...durations), Math.max(...durations)];
  }, [services]);

  const filteredServices = useMemo(() => {
    let filtered = services;

    if (selectedCategory) {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    if (priceRange) {
      filtered = filtered.filter(
        (service) => service.price >= priceRange[0] && service.price <= priceRange[1],
      );
    }

    if (durationRange) {
      filtered = filtered.filter(
        (service) => service.duration >= durationRange[0] && service.duration <= durationRange[1],
      );
    }

    return filtered;
  }, [services, selectedCategory, priceRange, durationRange]);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setPriceRange(null);
    setDurationRange(null);
  }, []);

  const hasActiveFilters =
    selectedCategory !== null || priceRange !== null || durationRange !== null;

  return {
    // Filters
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    durationRange,
    setDurationRange,

    // Data
    categories,
    priceExtent,
    durationExtent,
    filteredServices,

    // Actions
    clearFilters,
    hasActiveFilters,

    // Stats
    totalServices: services.length,
    filteredCount: filteredServices.length,
  };
}

// Hook لترتيب الخدمات
export function useServicesSort(services: Service[]) {
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'duration' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedServices = useMemo(() => {
    const sorted = [...services].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.nameAr.localeCompare(b.nameAr, 'ar');
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category, 'ar');
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [services, sortBy, sortOrder]);

  const toggleSort = useCallback(
    (field: typeof sortBy) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder('asc');
      }
    },
    [sortBy],
  );

  return {
    sortedServices,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    toggleSort,
  };
}

// Hook لإحصائيات الخدمات
export function useServicesStats(services: Service[], selectedServices: string[]) {
  return useMemo(() => {
    const selected = services.filter((s) => selectedServices.includes(s.id));

    const stats = {
      total: services.length,
      selected: selected.length,
      totalDuration: selected.reduce((sum, s) => sum + s.duration, 0),
      totalPrice: selected.reduce((sum, s) => sum + s.price, 0),
      avgPrice:
        services.length > 0 ? services.reduce((sum, s) => sum + s.price, 0) / services.length : 0,
      avgDuration:
        services.length > 0
          ? services.reduce((sum, s) => sum + s.duration, 0) / services.length
          : 0,
      categories: [...new Set(services.map((s) => s.category))].length,
      priceRange:
        services.length > 0
          ? {
              min: Math.min(...services.map((s) => s.price)),
              max: Math.max(...services.map((s) => s.price)),
            }
          : { min: 0, max: 0 },
    };

    return {
      ...stats,
      formattedTotalDuration: formatDuration(stats.totalDuration),
      selectionPercentage: Math.round((stats.selected / stats.total) * 100) || 0,
    };
  }, [services, selectedServices]);
}
