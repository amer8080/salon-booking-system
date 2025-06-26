// src/app/admin/bookings/components/UI/ViewToggleButtons.tsx
'use client'

import React from 'react'
import { Calendar, CalendarDays, Clock, List } from 'lucide-react'

type ViewMode = 'list' | 'month' | 'week' | 'day'

interface ViewToggleButtonsProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}

export default function ViewToggleButtons({ 
  currentView, 
  onViewChange, 
  className = "" 
}: ViewToggleButtonsProps) {
  
  const views = [
    { 
      key: 'list' as ViewMode, 
      label: 'قائمة', 
      icon: List,
      description: 'عرض جميع الحجوزات في قائمة'
    },
    { 
      key: 'month' as ViewMode, 
      label: 'شهري', 
      icon: Calendar,
      description: 'عرض التقويم الشهري'
    },
    { 
      key: 'week' as ViewMode, 
      label: 'أسبوعي', 
      icon: CalendarDays,
      description: 'عرض الأسبوع الحالي'
    },
    { 
      key: 'day' as ViewMode, 
      label: 'يومي', 
      icon: Clock,
      description: 'عرض تفاصيل اليوم'
    }
  ]

  return (
    <div className={`flex items-center bg-gray-100 rounded-xl p-1 ${className}`}>
      {views.map((view) => {
        const Icon = view.icon
        const isActive = currentView === view.key
        
        return (
          <button
            key={view.key}
            onClick={() => onViewChange(view.key)}
            title={view.description}
            className={`
              flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${isActive 
                ? 'bg-white text-purple-600 shadow-sm border border-purple-200' 
                : 'text-gray-600 active:text-gray-800 active:bg-gray-200'
              }
            `}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
            <span>{view.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// 🎯 Hook مساعد لإدارة حالة العرض
export function useViewMode(initialView: ViewMode = 'month') {
  const [viewMode, setViewMode] = React.useState<ViewMode>(initialView)
  
  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView)
    // يمكن إضافة localStorage هنا لحفظ التفضيل
    // localStorage.setItem('bookings-view-mode', newView)
  }

  return {
    viewMode,
    setViewMode: handleViewChange
  }
}