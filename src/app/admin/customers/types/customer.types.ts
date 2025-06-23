// types/customer.types.ts
export interface Customer {
  id: number
  name: string
  phone: string
  firstVisit: string
  totalVisits: number
  lastVisit: string
  status: string
  language: string
  notes?: string
  createdAt: string
  totalReservations: number
  availableCoupons: number
  usedCoupons: number
  customerLevel: string
  daysSinceLastVisit: number
  avgDaysBetweenVisits: number
  recentReservations: RecentReservation[]
}

export interface RecentReservation {
  id: number
  date: string
  status: 'confirmed' | 'completed' | 'cancelled'
  totalPrice: number
  services: string[]
}

export interface CustomerFilters {
  searchTerm: string
  statusFilter: string
  visitsFilter: string
  lastVisitFilter: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface CustomerFormData {
  name: string
  phone: string
  notes: string
  status: string
}

export interface PaginationOptions {
  page: number
  limit: number
  total: number
}

export interface CustomersResponse {
  success: boolean
  customers: Customer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    totalCustomers: number
    activeCustomers: number
    vipCustomers: number
    newCustomersThisMonth: number
  }
  error?: string
}

export type CustomerLevel = 'عميل عادي' | 'عميل فضي' | 'عميل ذهبي' | 'عميل VIP'
export type CustomerStatus = 'active' | 'inactive'
export type SortField = 'name' | 'totalVisits' | 'lastVisit' | 'createdAt'
export type PageSize = 50 | 100 | 500 | 'all'