import { logError } from "@/lib/logger-client";
// src/app/book/hooks/useTimeSlots.ts
// Hook لإدارة الأوقات المتاحة والمحجوزة

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { TimeSlot, TimeSlotsState } from '../types/calendar.types'
import { AvailableTimesAPIResponse } from '../types/api-responses.types'
import { executeWithRetry, createErrorToast } from '../utils/error-handling'
import { formatTimeForDisplay } from '../utils/booking-helpers'
import { getTodayIstanbul, createIstanbulDate } from '@/lib/timezone'

interface UseTimeSlotsProps {
  selectedDate: string
  userType?: 'customer' | 'admin'
  autoLoad?: boolean
  refreshInterval?: number // Auto-refresh interval in seconds
  onError?: (error: any) => void
  onSlotsLoaded?: (slots: TimeSlot[]) => void
  onFirstAvailableTime?: (time: string | null) => void
}

interface UseTimeSlotsReturn {
  // State
  state: TimeSlotsState
  
  // Actions
  loadTimeSlots: (date?: string) => Promise<boolean>
  selectTime: (time: string) => void
  clearSelection: () => void
  refresh: () => Promise<boolean>
  startAutoRefresh: () => void
  stopAutoRefresh: () => void
  
  // Computed values
  availableSlots: TimeSlot[]
  bookedSlots: TimeSlot[]
  blockedSlots: TimeSlot[]
  allSlots: TimeSlot[]
  
  // Helpers
  getSlotByTime: (time: string) => TimeSlot | undefined
  isTimeAvailable: (time: string) => boolean
  isTimeSelected: (time: string) => boolean
  getNextAvailableTime: (fromTime?: string) => string | null
  getPreviousAvailableTime: (fromTime?: string) => string | null
  
  // Validation
  hasAvailableSlots: boolean
  isValidSelection: boolean
  
  // Meta info
  totalSlots: number
  loadedAt: Date | null
  isAutoRefreshing: boolean
}

const DEFAULT_REFRESH_INTERVAL = 300 // 5 minutes
const WORKING_HOURS_START = '11:30'
const WORKING_HOURS_END = '18:30'
const SLOT_DURATION = 30 // minutes

export function useTimeSlots({
  selectedDate,
  userType = 'customer',
  autoLoad = true,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  onError,
  onSlotsLoaded,
  onFirstAvailableTime
}: UseTimeSlotsProps): UseTimeSlotsReturn {

  const [state, setState] = useState<TimeSlotsState>({
    slots: [],
    selectedTime: '',
    isLoading: false,
    error: '',
    firstAvailableTime: null
  })

  const [loadedAt, setLoadedAt] = useState<Date | null>(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  
  // Refs for cleanup
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Generate all possible time slots for the day
  const generateAllTimeSlots = useCallback((): string[] => {
    const slots: string[] = []
    const start = new Date()
    const [startHour, startMinute] = WORKING_HOURS_START.split(':').map(Number)
    start.setHours(startHour, startMinute, 0, 0)
    
    const end = new Date()
    const [endHour, endMinute] = WORKING_HOURS_END.split(':').map(Number)
    end.setHours(endHour, endMinute, 0, 0)

    const current = new Date(start)
    while (current <= end) {
      const timeString = current.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
      slots.push(timeString)
      current.setMinutes(current.getMinutes() + SLOT_DURATION)
    }

    return slots
  }, [])

  // Load time slots from API
  const loadTimeSlots = useCallback(async (date?: string): Promise<boolean> => {
    const targetDate = date || selectedDate
    
    if (!targetDate) {
      setState(prev => ({
        ...prev,
        error: 'تاريخ غير صحيح',
        isLoading: false
      }))
      return false
    }

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: '' 
      }))

      const response = await executeWithRetry(async () => {
        const url = `/api/bookings/available-times?date=${targetDate}&userType=${userType}`
        const res = await fetch(url, {
          signal: abortControllerRef.current?.signal
        })
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })

      const data: AvailableTimesAPIResponse = response

      if (data.success) {
        const allPossibleSlots = generateAllTimeSlots()
        const today = getTodayIstanbul()
        const isToday = targetDate === today
        const now = createIstanbulDate()
        
        // Create TimeSlot objects
        const timeSlots: TimeSlot[] = allPossibleSlots.map(time => {
          const isAvailable = data.availableSlots.includes(time)
          const isBooked = data.bookedSlots.includes(time)
          const isBlocked = data.blockedSlots.includes(time)
          
          // Check if time is in the past (for today only)
          let isPast = false
          if (isToday) {
            const [hours, minutes] = time.split(':').map(Number)
            const timeInMinutes = hours * 60 + minutes
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes()
            isPast = timeInMinutes <= currentTimeInMinutes
          }

          return {
            time,
            label: formatTimeForDisplay(time),
            isAvailable: isAvailable && !isPast,
            isBooked,
            isBlocked,
            isPast
          }
        })

        // Find first available time
        const firstAvailable = timeSlots.find(slot => slot.isAvailable)?.time || null

        setState(prev => ({
          ...prev,
          slots: timeSlots,
          isLoading: false,
          error: '',
          firstAvailableTime: firstAvailable
        }))

        setLoadedAt(new Date())
        onSlotsLoaded?.(timeSlots)
        onFirstAvailableTime?.(firstAvailable)
        
        // Clear selection if selected time is no longer available
        if (state.selectedTime && !timeSlots.find(slot => 
          slot.time === state.selectedTime && slot.isAvailable
        )) {
          setState(prev => ({ ...prev, selectedTime: '' }))
        }

        return true
      } else {
        throw new Error(data.error || 'فشل في تحميل الأوقات المتاحة')
      }

    } catch (error: any) {
      // Ignore aborted requests
      if (error.name === 'AbortError') {
        return false
      }

      await logError('Failed to load time slots:', error)
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'لا يمكن تحميل الأوقات المتاحة'
      }))
      
      onError?.(error)
      return false
    }
  }, [selectedDate, userType, generateAllTimeSlots, state.selectedTime, onError, onSlotsLoaded, onFirstAvailableTime])

  // Auto-load when date changes
  useEffect(() => {
    if (autoLoad && selectedDate) {
      loadTimeSlots(selectedDate)
    }
  }, [selectedDate, autoLoad, loadTimeSlots])

  // Select a time slot
  const selectTime = useCallback((time: string) => {
    const slot = state.slots.find(s => s.time === time)
    if (slot && slot.isAvailable) {
      setState(prev => ({ ...prev, selectedTime: time }))
    }
  }, [state.slots])

  // Clear time selection
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedTime: '' }))
  }, [])

  // Refresh time slots
  const refresh = useCallback(async (): Promise<boolean> => {
    return await loadTimeSlots()
  }, [loadTimeSlots])

  // Start auto-refresh
  const startAutoRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
    }

    setIsAutoRefreshing(true)
    refreshTimerRef.current = setInterval(() => {
      loadTimeSlots()
    }, refreshInterval * 1000)
  }, [refreshInterval, loadTimeSlots])

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
    setIsAutoRefreshing(false)
  }, [])

  // Computed values
  const availableSlots = useMemo(() => 
    state.slots.filter(slot => slot.isAvailable),
    [state.slots]
  )

  const bookedSlots = useMemo(() => 
    state.slots.filter(slot => slot.isBooked),
    [state.slots]
  )

  const blockedSlots = useMemo(() => 
    state.slots.filter(slot => slot.isBlocked),
    [state.slots]
  )

  const allSlots = state.slots

  // Helper functions
  const getSlotByTime = useCallback((time: string): TimeSlot | undefined => {
    return state.slots.find(slot => slot.time === time)
  }, [state.slots])

  const isTimeAvailable = useCallback((time: string): boolean => {
    const slot = getSlotByTime(time)
    return slot?.isAvailable || false
  }, [getSlotByTime])

  const isTimeSelected = useCallback((time: string): boolean => {
    return state.selectedTime === time
  }, [state.selectedTime])

  const getNextAvailableTime = useCallback((fromTime?: string): string | null => {
    const startTime = fromTime || state.selectedTime
    if (!startTime) return state.firstAvailableTime

    const currentIndex = availableSlots.findIndex(slot => slot.time === startTime)
    if (currentIndex >= 0 && currentIndex < availableSlots.length - 1) {
      return availableSlots[currentIndex + 1].time
    }
    
    return null
  }, [availableSlots, state.selectedTime, state.firstAvailableTime])

  const getPreviousAvailableTime = useCallback((fromTime?: string): string | null => {
    const startTime = fromTime || state.selectedTime
    if (!startTime) return null

    const currentIndex = availableSlots.findIndex(slot => slot.time === startTime)
    if (currentIndex > 0) {
      return availableSlots[currentIndex - 1].time
    }
    
    return null
  }, [availableSlots, state.selectedTime])

  // Validation
  const hasAvailableSlots = availableSlots.length > 0
  const isValidSelection = state.selectedTime && isTimeAvailable(state.selectedTime)

  return {
    // State
    state,
    
    // Actions
    loadTimeSlots,
    selectTime,
    clearSelection,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    
    // Computed values
    availableSlots,
    bookedSlots,
    blockedSlots,
    allSlots,
    
    // Helpers
    getSlotByTime,
    isTimeAvailable,
    isTimeSelected,
    getNextAvailableTime,
    getPreviousAvailableTime,
    
    // Validation
    hasAvailableSlots,
    isValidSelection,
    
    // Meta info
    totalSlots: allSlots.length,
    loadedAt,
    isAutoRefreshing
  }
}

// Hook لإدارة فلترة الأوقات
export function useTimeSlotsFilter(slots: TimeSlot[]) {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
  const [timeOfDay, setTimeOfDay] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all')

  const filteredSlots = useMemo(() => {
    let filtered = slots

    if (showOnlyAvailable) {
      filtered = filtered.filter(slot => slot.isAvailable)
    }

    if (timeOfDay !== 'all') {
      filtered = filtered.filter(slot => {
        const [hours] = slot.time.split(':').map(Number)
        
        switch (timeOfDay) {
          case 'morning':
            return hours >= 11 && hours < 14
          case 'afternoon':
            return hours >= 14 && hours < 17
          case 'evening':
            return hours >= 17 && hours <= 18
          default:
            return true
        }
      })
    }

    return filtered
  }, [slots, showOnlyAvailable, timeOfDay])

  return {
    filteredSlots,
    showOnlyAvailable,
    setShowOnlyAvailable,
    timeOfDay,
    setTimeOfDay,
    filterCount: filteredSlots.length,
    totalCount: slots.length
  }
}

// Hook لإحصائيات الأوقات
export function useTimeSlotsStats(slots: TimeSlot[]) {
  return useMemo(() => {
    const stats = {
      total: slots.length,
      available: slots.filter(s => s.isAvailable).length,
      booked: slots.filter(s => s.isBooked).length,
      blocked: slots.filter(s => s.isBlocked).length,
      past: slots.filter(s => s.isPast).length
    }

    return {
      ...stats,
      availabilityPercentage: Math.round((stats.available / stats.total) * 100) || 0,
      bookingPercentage: Math.round((stats.booked / stats.total) * 100) || 0,
      remainingSlots: stats.available,
      nextBusyPeriod: getNextBusyPeriod(slots),
      peakHours: getPeakBookingHours(slots)
    }
  }, [slots])
}

// Helper function to find next busy period
function getNextBusyPeriod(slots: TimeSlot[]): { start: string; end: string } | null {
  let busyStart: string | null = null
  let busyEnd: string | null = null
  
  for (const slot of slots) {
    if ((slot.isBooked || slot.isBlocked) && !slot.isPast) {
      if (!busyStart) {
        busyStart = slot.time
      }
      busyEnd = slot.time
    } else if (busyStart && busyEnd) {
      return { start: busyStart, end: busyEnd }
    } else {
      busyStart = null
      busyEnd = null
    }
  }
  
  return busyStart && busyEnd ? { start: busyStart, end: busyEnd } : null
}

// Helper function to identify peak booking hours
function getPeakBookingHours(slots: TimeSlot[]): string[] {
  const hourCounts: Record<string, number> = {}
  
  slots.filter(s => s.isBooked).forEach(slot => {
    const hour = slot.time.split(':')[0]
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  const maxCount = Math.max(...Object.values(hourCounts))
  return Object.entries(hourCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([hour]) => `${hour}:00`)
}