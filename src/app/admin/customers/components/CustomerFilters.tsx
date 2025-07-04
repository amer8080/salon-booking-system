// components/CustomerFilters.tsx
'use client';

import { Search, Filter, Plus, RefreshCw, BarChart3 } from 'lucide-react';
import type { CustomerFilters, PageSize } from '../types/customer.types';

interface CustomerFiltersProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: Partial<CustomerFilters>) => void;
  onResetFilters: () => void;
  onAddCustomer: () => void;
  onRefresh: () => void;

  // Pagination props
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
  currentPageInfo: {
    start: number;
    end: number;
    total: number;
    showing: number;
  };

  // Stats
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    vipCustomers: number;
    newCustomersThisMonth: number;
  };

  // Loading state
  refreshing?: boolean;
}

export default function CustomerFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  onAddCustomer,
  onRefresh,
  pageSize,
  onPageSizeChange,
  currentPageInfo,
  stats,
  refreshing = false,
}: CustomerFiltersProps) {
  const hasActiveFilters =
    filters.searchTerm !== '' ||
    filters.statusFilter !== 'all' ||
    filters.visitsFilter !== '0' ||
    filters.lastVisitFilter !== 'all';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <h2 className="text-lg font-bold text-gray-800">البحث والفلترة</h2>
          {hasActiveFilters && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              فلاتر نشطة
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            onClick={onAddCustomer}
            className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">إجمالي العملاء</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{stats.totalCustomers.toLocaleString()}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            <BarChart3 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">عملاء نشطين</span>
          </div>
          <p className="text-xl font-bold text-green-600">
            {stats.activeCustomers.toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">عملاء VIP</span>
          </div>
          <p className="text-xl font-bold text-purple-600">{stats.vipCustomers.toLocaleString()}</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            <BarChart3 className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">عملاء جدد</span>
          </div>
          <p className="text-xl font-bold text-orange-600">
            {stats.newCustomersThisMonth.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الهاتف..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
              className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
          <select
            value={filters.statusFilter}
            onChange={(e) => onFiltersChange({ statusFilter: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عدد الزيارات</label>
          <select
            value={filters.visitsFilter}
            onChange={(e) => onFiltersChange({ visitsFilter: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="0">جميع العملاء</option>
            <option value="1">زيارة واحدة فأكثر</option>
            <option value="5">5 زيارات فأكثر</option>
            <option value="10">10 زيارات فأكثر</option>
            <option value="20">20 زيارة فأكثر</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">آخر زيارة</label>
          <select
            value={filters.lastVisitFilter}
            onChange={(e) => onFiltersChange({ lastVisitFilter: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">جميع الفترات</option>
            <option value="7">آخر أسبوع</option>
            <option value="30">آخر شهر</option>
            <option value="90">آخر 3 أشهر</option>
            <option value="180">آخر 6 أشهر</option>
          </select>
        </div>
      </div>

      {/* Sorting & Pagination Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        {/* Sorting */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <label className="text-sm font-medium text-gray-700">ترتيب بـ:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="lastVisit">آخر زيارة</option>
              <option value="name">الاسم</option>
              <option value="totalVisits">عدد الزيارات</option>
              <option value="createdAt">تاريخ التسجيل</option>
            </select>
          </div>

          <select
            value={filters.sortOrder}
            onChange={(e) => onFiltersChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center space-x-1 rtl:space-x-reverse text-red-600 hover:text-red-800 text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>إعادة تعيين</span>
            </button>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-gray-600">عرض:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(e.target.value as PageSize)}
              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="all">الجميع</option>
            </select>
            <span className="text-gray-600">عميل</span>
          </div>

          <div className="text-gray-600">
            {pageSize === 'all' ? (
              <span>
                {currentPageInfo.showing.toLocaleString()} من{' '}
                {currentPageInfo.total.toLocaleString()}
              </span>
            ) : (
              <span>
                {currentPageInfo.start.toLocaleString()}-{currentPageInfo.end.toLocaleString()} من{' '}
                {currentPageInfo.total.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
