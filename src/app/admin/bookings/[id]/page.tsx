'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import {
    HiArrowLeft,
    HiMail,
    HiPhone,
    HiUser,
    HiCalendar,
    HiTicket,
    HiCheckCircle,
    HiXCircle,
    HiClock,
    HiQrcode
} from 'react-icons/hi'

interface BookingDetails {
    id: string
    bookingNumber: string
    status: string
    paymentStatus: string
    guestName: string | null
    guestEmail: string | null
    guestPhone: string | null
    adultCount: number
    childCount: number
    vipCount: number
    subtotal: string
    serviceFee: string
    tax: string
    total: string
    createdAt: string
    event: {
        id: string
        title: string
        eventDate: string
        startTime: string
        venueName: string
    }
    tickets: {
        id: string
        qrToken: string
        ticketType: string
        status: string
        totalPersons: number
        checkedInCount: number
    }[]
    items: {
        id: string
        quantity: number
        unitPrice: string
        totalPrice: string
        ticketTier?: { name: string }
        addOn?: { name: string }
    }[]
}

export default function BookingDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [booking, setBooking] = useState<BookingDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchBooking()
        }
    }, [params.id])

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/admin/bookings/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setBooking(data)
            }
        } catch (error) {
            console.error('Error fetching booking:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/bookings/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                fetchBooking()
            }
        } catch (error) {
            console.error('Error updating booking:', error)
        }
    }

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
        PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: HiClock },
        CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: HiCheckCircle },
        CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: HiXCircle },
        REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: HiXCircle },
    }

    if (loading) {
        return (
            <div className="p-8 animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">Booking not found</p>
                <Button onClick={() => router.push('/admin/bookings')} className="mt-4">
                    Back to Bookings
                </Button>
            </div>
        )
    }

    const StatusIcon = statusConfig[booking.status]?.icon || HiClock

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/bookings" className="p-2 hover:bg-gray-100 rounded-lg">
                        <HiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <HiTicket className="w-6 h-6 text-purple-600" />
                            {booking.bookingNumber}
                        </h1>
                        <p className="text-gray-500">Booking Details</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusConfig[booking.status]?.color}`}>
                    <StatusIcon className="w-5 h-5" />
                    {statusConfig[booking.status]?.label}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HiUser className="w-5 h-5 text-purple-600" />
                            Guest Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <HiUser className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{booking.guestName || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <HiMail className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{booking.guestEmail || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <HiPhone className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{booking.guestPhone || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Event Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HiCalendar className="w-5 h-5 text-purple-600" />
                            Event Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Event</p>
                            <Link href={`/admin/events/${booking.event.id}`} className="font-medium text-purple-600 hover:underline">
                                {booking.event.title}
                            </Link>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date & Time</p>
                            <p className="font-medium">{formatDate(booking.event.eventDate)} at {booking.event.startTime}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Venue</p>
                            <p className="font-medium">{booking.event.venueName}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HiQrcode className="w-5 h-5 text-purple-600" />
                        Tickets ({booking.tickets?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {booking.tickets && booking.tickets.length > 0 ? (
                        <div className="space-y-3">
                            {booking.tickets.map((ticket, index) => (
                                <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <span className="font-bold text-purple-600">{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{ticket.ticketType}</p>
                                            <p className="text-sm text-gray-500 font-mono">{ticket.qrToken}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={ticket.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}>
                                            {ticket.status}
                                        </Badge>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {ticket.checkedInCount}/{ticket.totalPersons} checked in
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No tickets generated</p>
                    )}
                </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Items */}
                        {booking.items && booking.items.length > 0 && (
                            <div className="pb-3 border-b">
                                {booking.items.map(item => (
                                    <div key={item.id} className="flex justify-between py-1">
                                        <span>
                                            {item.ticketTier?.name || item.addOn?.name || 'Item'} x{item.quantity}
                                        </span>
                                        <span>{formatPrice(Number(item.totalPrice))}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Legacy counts */}
                        {(booking.adultCount > 0 || booking.childCount > 0 || booking.vipCount > 0) && (
                            <div className="pb-3 border-b">
                                {booking.adultCount > 0 && (
                                    <div className="flex justify-between py-1">
                                        <span>Adults x{booking.adultCount}</span>
                                    </div>
                                )}
                                {booking.childCount > 0 && (
                                    <div className="flex justify-between py-1">
                                        <span>Children x{booking.childCount}</span>
                                    </div>
                                )}
                                {booking.vipCount > 0 && (
                                    <div className="flex justify-between py-1">
                                        <span>VIP x{booking.vipCount}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{formatPrice(Number(booking.subtotal))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Service Fee</span>
                            <span>{formatPrice(Number(booking.serviceFee))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span>{formatPrice(Number(booking.tax))}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-3 border-t">
                            <span>Total</span>
                            <span className="text-purple-600">{formatPrice(Number(booking.total))}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    {booking.status === 'PENDING' && (
                        <Button onClick={() => updateStatus('CONFIRMED')} className="bg-green-600 hover:bg-green-700">
                            <HiCheckCircle className="w-4 h-4 mr-2" />
                            Confirm Booking
                        </Button>
                    )}
                    {booking.status !== 'CANCELLED' && booking.status !== 'REFUNDED' && (
                        <Button onClick={() => updateStatus('CANCELLED')} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                            <HiXCircle className="w-4 h-4 mr-2" />
                            Cancel Booking
                        </Button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                        <Button onClick={() => updateStatus('REFUNDED')} variant="outline">
                            Refund
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => window.print()}>
                        Print
                    </Button>
                </CardContent>
            </Card>

            {/* Metadata */}
            <div className="text-sm text-gray-500 text-center">
                Booked on {formatDate(booking.createdAt)} • Payment: {booking.paymentStatus}
            </div>
        </div>
    )
}
