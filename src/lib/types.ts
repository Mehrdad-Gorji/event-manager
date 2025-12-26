import { Event, Booking, Ticket, User } from '@prisma/client'

// Event types
export interface EventWithStats extends Event {
    _count?: {
        bookings: number
    }
    bookedCount?: number
    remainingCapacity?: number
}

export interface EventListItem {
    id: string
    title: string
    description: string | null
    coverImage: string | null
    eventDate: Date
    startTime: string
    venueName: string
    status: string
    adultPrice: number
    childPrice: number | null
    maxCapacity: number
    remainingCapacity: number
}

// Booking types
export interface BookingWithRelations extends Booking {
    event: Event
    user?: User | null
    tickets: Ticket[]
}

export interface BookingCalculation {
    adultCount: number
    childCount: number
    adultPrice: number
    childPrice: number
    subtotal: number
    serviceFee: number
    tax: number
    total: number
}

// Check-in types
export interface CheckInResult {
    success: boolean
    message: string
    booking?: {
        bookingNumber: string
        guestName: string | null
        eventTitle: string
    }
    ticket?: {
        totalPersons: number
        previouslyCheckedIn: number
        nowCheckedIn: number
        remaining: number
        status: 'partial' | 'completed'
    }
    error?: string
}

export interface CheckInStatus {
    booking: {
        bookingNumber: string
        status: string
    }
    totalPersons: number
    checkedInCount: number
    remaining: number
    checkInHistory: {
        time: Date
        count: number
        staffName: string | null
    }[]
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

// Dashboard types
export interface DashboardStats {
    todaySales: number
    todayBookings: number
    todayCheckIns: number
    capacityPercentage: number
}

export interface SalesReport {
    eventId: string
    eventTitle: string
    totalBookings: number
    totalRevenue: number
    adultCount: number
    childCount: number
}
