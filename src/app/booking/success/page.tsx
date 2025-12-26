'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TicketDisplay } from '@/components/ticket/ticket-display'
import { Button } from '@/components/ui/button'
import { HiCheckCircle, HiHome } from 'react-icons/hi'

interface BookingDetails {
    id: string
    bookingNumber: string
    status: string
    event: {
        id: string
        title: string
        eventDate: string
        startTime: string
        venueName: string
    }
    adultCount: number
    childCount: number
    total: number
    guestName: string | null
    guestEmail: string | null
    tickets: Array<{
        id: string
        qrToken: string
        totalPersons: number
        checkedInCount: number
        seatId?: string | null
    }>
}

import { Suspense } from 'react'

function BookingSuccessContent() {
    const searchParams = useSearchParams()
    const bookingId = searchParams.get('booking_id')

    const [booking, setBooking] = useState<BookingDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (bookingId) {
            fetchBooking()
        }
    }, [bookingId])

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/bookings?id=${bookingId}`)
            if (!res.ok) throw new Error('Booking not found')
            const data = await res.json()
            setBooking(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                </div>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {error || 'Booking not found'}
                </h1>
                <Link href="/events">
                    <Button>
                        <HiHome className="h-5 w-5 mr-2" />
                        Back to Events
                    </Button>
                </Link>
            </div>
        )
    }

    const ticket = booking.tickets[0]

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <HiCheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Booking Confirmed!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Your tickets have been sent to {booking.guestEmail}
                </p>
            </div>

            {/* Tickets List */}
            <div className="space-y-8">
                {booking.tickets.map((ticket, index) => (
                    <div key={ticket.id}>
                        {booking.tickets.length > 1 && (
                            <p className="text-center text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                                Ticket {index + 1} of {booking.tickets.length}
                            </p>
                        )}
                        <TicketDisplay
                            ticket={ticket}
                            booking={{
                                bookingNumber: booking.bookingNumber,
                                guestName: booking.guestName,
                                adultCount: booking.adultCount,
                                childCount: booking.childCount,
                            }}
                            event={booking.event}
                        />
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/my-bookings">
                    <Button variant="outline" className="w-full sm:w-auto">
                        View All Bookings
                    </Button>
                </Link>
                <Link href="/events">
                    <Button className="w-full sm:w-auto">
                        Browse More Events
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                </div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    )
}
