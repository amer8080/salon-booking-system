// src/app/book/components/ServicesList.tsx
// قائمة الخدمات مع البحث والفلترة

import React, { useState, useMemo } from 'react'
import { Sparkles, Search, Filter, CheckCircle, Loader2, AlertCircle, Star, Clock, Tag } from 'lucide-react'
import { Service } from '../types/booking-form.types'
import { useServices, useServicesSearch, useServicesFilter } from '../hooks/useServices'
import { formatDuration } from '../utils/booking-helpers'

interface ServicesListProps {
  selectedServices: string[]
  onServiceToggle: (serviceId: string) => void
  onSelectionChange?: (services: string[]) => void
  maxSelection?: number
  showSearch?: boolean
  showFilters?: boolean
  groupByCategory?: boolean
  className?: string
}

export default function ServicesList({
  selectedServices,
  onServiceToggle,
  onSelectionChange,
  maxSelection = 10,
  showSearch = true,
  showFilters = false,
  groupByCategory = true,
  className = ''
}: ServicesListProps) {

  const {
    state,
    refresh,
    servicesGrouped,
    selectedServicesData,
    totalDuration,
    selectionSummary,
    hasSelection,
    canSelectMore,
    isValidSelection
  } = useServices({
    autoLoad: true,
    onServicesLoaded: (services) => {
    }
  })

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const {
    searchQuery,
    searchResults,
    search,
    clearSearch,
    hasQuery
  } = useServicesSearch(state.services)

  const {
    filteredServices,
    categories,
    selectedCategory,
    setSelectedCategory,
    clearFilters,
    hasActiveFilters
  } = useServicesFilter(searchResults)

  const handleServiceClick = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      // Remove service
      const newSelection = selectedServices.filter(id => id !== serviceId)
      onSelectionChange?.(newSelection)
    } else if (canSelectMore) {
      // Add service
      const newSelection = [...selectedServices, serviceId]
      onSelectionChange?.(newSelection)
    }
    
    onServiceToggle(serviceId)
  }

  const handleClearSelection = () => {
    onSelectionChange?.([])
    selectedServices.forEach(serviceId => onServiceToggle(serviceId))
  }

  const displayServices = useMemo(() => {
    if (hasActiveFilters || hasQuery) {
      return filteredServices
    }
    return state.services
  }, [filteredServices, state.services, hasActiveFilters, hasQuery])

  const groupedServices = useMemo(() => {
    if (!groupByCategory) {
      return { 'جميع الخدمات': displayServices }
    }
    
    return displayServices.reduce((groups, service) => {
      const category = service.category || 'أخرى'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(service)
      return groups
    }, {} as Record<string, Service[]>)
  }, [displayServices, groupByCategory])

  if (state.servicesLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">جاري تحميل الخدمات...</p>
        </div>
      </div>
    )
  }

  if (state.servicesError) {
    return (
      <div className={`bg-white rounded-xl border border-red-200 p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            خطأ في تحميل الخدمات
          </h3>
          <p className="text-red-600 mb-4">{state.servicesError}</p>
          <button
            onClick={refresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-800">
              اختاري خدماتك
            </h3>
          </div>
          
          {showFilters && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showAdvancedFilters 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          يمكنك اختيار خدمة واحدة أو أكثر (حد أقصى {maxSelection} خدمات)
        </p>

        {/* Search Bar */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن خدمة..."
              value={searchQuery}
              onChange={(e) => search(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {hasQuery && (
              <button
                onClick={clearSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">جميع الفئات</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {hasSelection && (
        <div className="bg-green-50 border-b border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {selectionSummary}
                </p>
                {totalDuration > 0 && (
                  <p className="text-xs text-green-700">
                    المدة الإجمالية: {formatDuration(totalDuration)}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleClearSelection}
              className="text-sm text-green-700 hover:text-green-900 font-medium"
            >
              مسح الكل
            </button>
          </div>
        </div>
      )}

      {/* Services Content */}
      <div className="p-4">
        {Object.keys(groupedServices).length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              لا توجد خدمات
            </h3>
            <p className="text-gray-500">
              {hasQuery 
                ? `لا توجد نتائج للبحث "${searchQuery}"`
                : 'لم يتم العثور على خدمات متاحة'
              }
            </p>
            {hasQuery && (
              <button
                onClick={clearSearch}
                className="mt-3 text-purple-600 hover:text-purple-800 font-medium"
              >
                مسح البحث
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
              <div key={categoryName}>
                {groupByCategory && Object.keys(groupedServices).length > 1 && (
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Tag className="w-4 h-4 ml-2 text-purple-600" />
                    {categoryName}
                    <span className="text-sm text-gray-500 mr-2">
                      ({categoryServices.length})
                    </span>
                  </h4>
                )}
                
                <div className="grid gap-3">
                  {categoryServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isSelected={selectedServices.includes(service.id)}
                      onClick={() => handleServiceClick(service.id)}
                      disabled={!selectedServices.includes(service.id) && !canSelectMore}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {hasSelection && (
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="text-center text-sm text-gray-600">
            {selectedServices.length} من {maxSelection} خدمات مختارة
            {!canSelectMore && (
              <span className="text-orange-600 font-medium mr-2">
                (وصلت للحد الأقصى)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Service Card Component
function ServiceCard({
  service,
  isSelected,
  onClick,
  disabled = false
}: {
  service: Service
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 group
        ${isSelected
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm'
        }
      `}
    >
      {/* Selection Indicator */}
      <div className="absolute top-4 left-4">
        <div
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${isSelected
              ? 'border-purple-500 bg-purple-500'
              : 'border-gray-300 group-hover:border-purple-400'
            }
          `}
        >
          {isSelected && (
            <CheckCircle className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Service Content */}
      <div className="pr-10">
        <div className="flex justify-between items-start mb-2">
          <h5 className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-200">
            {service.nameAr}
          </h5>
          
          {service.price > 0 && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                {service.price} ₺
              </span>
            </div>
          )}
        </div>

        {/* Service Details */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(service.duration)}</span>
          </div>
          
          {service.category && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Tag className="w-4 h-4" />
              <span>{service.category}</span>
            </div>
          )}
        </div>

        {/* Service Description */}
        {service.description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Popular/Recommended Badge */}
        {service.price > 100 && (
          <div className="absolute top-2 right-2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Star className="w-3 h-3 ml-1" />
              مميزة
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect */}
      {!disabled && !isSelected && (
        <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200"></div>
      )}
    </div>
  )
}

// Compact Services List for Mobile
export function CompactServicesList({
  selectedServices,
  onServiceToggle,
  className = ''
}: Pick<ServicesListProps, 'selectedServices' | 'onServiceToggle' | 'className'>) {
  
  const { state, servicesGrouped } = useServices({ autoLoad: true })

  if (state.servicesLoading) {
    return (
      <div className={`bg-white rounded-lg border p-3 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin ml-2" />
          <span className="text-sm text-gray-600">تحميل الخدمات...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-3 border-b bg-gray-50">
        <h4 className="text-sm font-medium text-gray-800">
          اختر الخدمات ({selectedServices.length})
        </h4>
      </div>
      
      <div className="p-3 max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {state.services.slice(0, 8).map((service) => (
            <div
              key={service.id}
              onClick={() => onServiceToggle(service.id)}
              className={`
                flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors
                ${selectedServices.includes(service.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {service.nameAr}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDuration(service.duration)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {service.price > 0 && (
                  <span className="text-sm font-medium text-green-600">
                    {service.price} ₺
                  </span>
                )}
                <div
                  className={`
                    w-4 h-4 rounded border-2 flex items-center justify-center
                    ${selectedServices.includes(service.id)
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                    }
                  `}
                >
                  {selectedServices.includes(service.id) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {state.services.length > 8 && (
          <button className="w-full mt-2 text-xs text-purple-600 hover:text-purple-800">
            عرض جميع الخدمات ({state.services.length})
          </button>
        )}
      </div>
    </div>
  )
}