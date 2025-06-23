// components/CustomerList.tsx
'use client'

import { Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Customer, PageSize } from '../types/customer.types'
import CustomerCard from './CustomerCard'

interface CustomerListProps {
  customers: Customer[]
  loading: boolean
  
  // Pagination
  pagination: {
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  pageSize: PageSize
  onPageChange: (page: number) => void
  currentPageInfo: {
    start: number
    end: number
    total: number
    showing: number
  }
  
  // Actions
  onViewCustomer: (customer: Customer) => void
  onEditCustomer: (customer: Customer) => void
  onDeleteCustomer: (customer: Customer) => void
}

export default function CustomerList({
  customers,
  loading,
  pagination,
  pageSize,
  onPageChange,
  currentPageInfo,
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer
}: CustomerListProps) {

  const renderPaginationNumbers = () => {
    const { page, totalPages } = pagination
    const delta = 2
    const range = []
    const rangeWithDots = []

    // Calculate range around current page
    const rangeStart = Math.max(2, page - delta)
    const rangeEnd = Math.min(totalPages - 1, page + delta)

    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i)
    }

    // Add first page
    if (page - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    // Add middle pages
    rangeWithDots.push(...range)

    // Add last page
    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800">جاري التحميل...</h3>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">جاري تحميل العملاء...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            قائمة العملاء ({currentPageInfo.total.toLocaleString()})
          </h3>
          
          {pageSize !== 'all' && (
            <div className="text-sm text-gray-600">
              صفحة {pagination.page} من {pagination.totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Customer List */}
      {customers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-500">لا توجد عملاء</p>
          <p className="text-sm text-gray-400">جرب تغيير معايير البحث أو إضافة عملاء جدد</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onView={onViewCustomer}
                onEdit={onEditCustomer}
                onDelete={onDeleteCustomer}
              />
            ))}
          </div>

          {/* Pagination */}
          {pageSize !== 'all' && pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  عرض {currentPageInfo.start.toLocaleString()}-{currentPageInfo.end.toLocaleString()} من {currentPageInfo.total.toLocaleString()} عميل
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {/* First Page */}
                  <button
                    onClick={() => onPageChange(1)}
                    disabled={!pagination.hasPrev}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="الصفحة الأولى"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="الصفحة السابقة"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    {renderPaginationNumbers().map((pageNum, index) => (
                      <button
                        key={index}
                        onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
                        disabled={pageNum === '...'}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          pageNum === pagination.page
                            ? 'bg-purple-600 text-white'
                            : pageNum === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next Page */}
                  <button
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="الصفحة التالية"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => onPageChange(pagination.totalPages)}
                    disabled={!pagination.hasNext}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="الصفحة الأخيرة"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Navigation */}
              {pagination.totalPages > 10 && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                    <span className="text-gray-600">انتقال إلى الصفحة:</span>
                    <input
                      type="number"
                      min="1"
                      max={pagination.totalPages}
                      value={pagination.page}
                      onChange={(e) => {
                        const page = parseInt(e.target.value)
                        if (page >= 1 && page <= pagination.totalPages) {
                          onPageChange(page)
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="text-gray-600">من {pagination.totalPages}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}