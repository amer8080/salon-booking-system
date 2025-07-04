import { logError } from '@/lib/logger-client';
// hooks/useCustomers.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Customer,
  CustomersResponse,
  CustomerFilters,
  PaginationOptions,
  PageSize,
} from '../types/customer.types';

interface UseCustomersParams {
  initialPageSize?: PageSize;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useCustomers = (params: UseCustomersParams = {}) => {
  const { initialPageSize = 100, autoRefresh = false, refreshInterval = 30000 } = params;

  // States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Pagination & Filters
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: typeof initialPageSize === 'number' ? initialPageSize : 100,
    total: 0,
  });

  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);
  const [filters, setFilters] = useState<CustomerFilters>({
    searchTerm: '',
    statusFilter: 'all',
    visitsFilter: '0',
    lastVisitFilter: 'all',
    sortBy: 'lastVisit',
    sortOrder: 'desc',
  });

  // Stats
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    newCustomersThisMonth: 0,
  });

  // Build API URL with params
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();

    // Pagination
    params.append('page', pagination.page.toString());
    if (pageSize !== 'all') {
      params.append('limit', pageSize.toString());
    }

    // Filters
    if (filters.searchTerm) params.append('search', filters.searchTerm);
    if (filters.statusFilter !== 'all') params.append('status', filters.statusFilter);
    if (filters.visitsFilter !== '0') params.append('minVisits', filters.visitsFilter);
    if (filters.lastVisitFilter !== 'all') params.append('lastVisitDays', filters.lastVisitFilter);

    // Sorting
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);

    return `/api/admin/customers?${params.toString()}`;
  }, [pagination.page, pageSize, filters]);

  // Fetch customers
  const fetchCustomers = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(buildApiUrl());
        const data: CustomersResponse = await response.json();

        if (data.success) {
          setCustomers(data.customers);
          setPagination((prev) => ({
            ...prev,
            total: data.pagination.total,
          }));
          setStats(data.stats);
          setError('');
        } else {
          setError(data.error || 'فشل في تحميل العملاء');
        }
      } catch (error) {
        setError('خطأ في الاتصال بالخادم');
        logError('Error fetching customers:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [buildApiUrl],
  );

  // Update page size
  const changePageSize = useCallback((newPageSize: PageSize) => {
    setPageSize(newPageSize);
    setPagination((prev) => ({
      ...prev,
      page: 1,
      limit: typeof newPageSize === 'number' ? newPageSize : 0,
    }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<CustomerFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Change page
  const changePage = useCallback((newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      visitsFilter: '0',
      lastVisitFilter: 'all',
      sortBy: 'lastVisit',
      sortOrder: 'desc',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Quick filters
  const quickFilters = useMemo(
    () => ({
      showActiveOnly: () => updateFilters({ statusFilter: 'active' }),
      showVIPOnly: () => updateFilters({ statusFilter: 'active', visitsFilter: '10' }),
      showRecentCustomers: () => updateFilters({ lastVisitFilter: '30' }),
      showFrequentCustomers: () => updateFilters({ visitsFilter: '10' }),
      showNewCustomers: () => updateFilters({ sortBy: 'createdAt', sortOrder: 'desc' }),
    }),
    [updateFilters],
  );

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCustomers(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCustomers]);

  // Fetch on params change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Computed values
  const totalPages = useMemo(() => {
    if (pageSize === 'all') return 1;
    return Math.ceil(pagination.total / pagination.limit);
  }, [pagination.total, pagination.limit, pageSize]);

  const currentPageInfo = useMemo(() => {
    if (pageSize === 'all') {
      return {
        start: 1,
        end: customers.length,
        total: pagination.total,
        showing: customers.length,
      };
    }

    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);

    return {
      start,
      end,
      total: pagination.total,
      showing: customers.length,
    };
  }, [pagination, customers.length, pageSize]);

  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;

  return {
    // Data
    customers,
    stats,
    loading,
    error,
    refreshing,

    // Pagination
    pagination: {
      ...pagination,
      totalPages,
      hasNext: hasNextPage,
      hasPrev: hasPrevPage,
    },
    pageSize,
    currentPageInfo,

    // Filters
    filters,

    // Actions
    fetchCustomers: () => fetchCustomers(),
    refreshCustomers: () => fetchCustomers(true),
    changePageSize,
    changePage,
    updateFilters,
    resetFilters,
    quickFilters,

    // Utilities
    buildApiUrl,
  };
};
