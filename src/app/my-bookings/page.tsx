'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TicketDisplay } from '@/components/ticket/ticket-display'
import { MasterTicketDisplay } from '@/components/ticket/master-ticket-display'
import { formatDate, formatPrice } from '@/lib/utils'
import { HiSearch, HiTicket, HiChevronDown, HiChevronUp, HiQrcode, HiLocationMarker, HiClock, HiUsers, HiShoppingCart } from 'react-icons/hi'

interface TicketInfo {
    id: string
    type?: string // GROUP (master) or INDIVIDUAL
    qrToken: string
    totalPersons: number
    checkedInCount: number
    seatId?: string | null
    status?: string
}

interface BookingItem {
    id: string
    ticketTierId: string | null
    addOnId: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
    seatId?: string | null
    ticketTier?: { name: string } | null
    addOn?: { name: string } | null
}

interface BookingDetails {
    id: string
    bookingNumber: string
    status: string
    paymentStatus: string
    event: {
        id: string
        title: string
        eventDate: string
        startTime: string
        venueName: string
        venueAddress?: string
    }
    adultCount: number
    childCount: number
    subtotal: number
    serviceFee: number
    tax: number
    total: number
    guestName: string | null
    guestEmail: string | null
    tickets: TicketInfo[]
    items?: BookingItem[]
}

export default function MyBookingsPage() {
    const [bookingNumber, setBookingNumber] = useState('')
    const [booking, setBooking] = useState<BookingDetails | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showAllTickets, setShowAllTickets] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bookingNumber.trim()) return

        setLoading(true)
        setError(null)
        setBooking(null)

        try {
            const res = await fetch(`/api/bookings?number=${bookingNumber.trim()}`)
            if (!res.ok) {
                if (res.status === 404) throw new Error('Booking not found')
                throw new Error('Failed to fetch booking')
            }
            const data = await res.json()
            setBooking(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const statusBadge = {
        PENDING: { label: 'Pending', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-800' },
        CONFIRMED: { label: 'Confirmed', variant: 'success' as const, color: 'bg-green-100 text-green-800' },
        CANCELLED: { label: 'Cancelled', variant: 'error' as const, color: 'bg-red-100 text-red-800' },
        REFUNDED: { label: 'Refunded', variant: 'default' as const, color: 'bg-gray-100 text-gray-800' },
    }

    const ticketItems = booking?.items?.filter(item => item.ticketTierId) || []
    const addonItems = booking?.items?.filter(item => item.addOnId) || []

    // Separate master ticket from individual tickets
    const masterTicket = booking?.tickets?.find(t => t.type === 'GROUP') || null
    const individualTickets = booking?.tickets?.filter(t => t.type === 'INDIVIDUAL') || []

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                        <HiTicket className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        My Bookings
                    </h1>
                    <p className="text-purple-200">
                        Enter your booking number to view your tickets
                    </p>
                </div>

                {/* Search Form */}
                <Card className="mb-8 bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <Input
                                placeholder="e.g. EVT-MJL7WWXB"
                                value={bookingNumber}
                                onChange={(e) => setBookingNumber(e.target.value)}
                                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            />
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                            >
                                {loading ? (
                                    'Searching...'
                                ) : (
                                    <>
                                        <HiSearch className="h-5 w-5 mr-2" />
                                        Find Booking
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Error */}
                {error && (
                    <Card className="border-red-500/50 bg-red-900/20 backdrop-blur-xl mb-8">
                        <CardContent className="p-6 text-center">
                            <p className="text-red-400 font-medium">{error}</p>
                            <p className="text-sm text-red-300/70 mt-2">
                                Please check your booking number and try again.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Booking Result */}
                {booking && (
                    <div className="space-y-6">
                        {/* Main Info Card */}
                        <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">{booking.event.title}</h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge[booking.status as keyof typeof statusBadge]?.color || 'bg-gray-100 text-gray-800'}`}>
                                        {statusBadge[booking.status as keyof typeof statusBadge]?.label || booking.status}
                                    </span>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Event Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center text-white/80">
                                            <HiClock className="h-5 w-5 mr-3 text-purple-400" />
                                            <div>
                                                <p className="font-medium text-white">{formatDate(booking.event.eventDate)}</p>
                                                <p className="text-sm text-white/60">Starts at {booking.event.startTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-white/80">
                                            <HiLocationMarker className="h-5 w-5 mr-3 text-purple-400" />
                                            <div>
                                                <p className="font-medium text-white">{booking.event.venueName}</p>
                                                {booking.event.venueAddress && (
                                                    <p className="text-sm text-white/60">{booking.event.venueAddress}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-white/80">
                                            <HiUsers className="h-5 w-5 mr-3 text-purple-400" />
                                            <div>
                                                <p className="font-medium text-white">{booking.guestName}</p>
                                                <p className="text-sm text-white/60">{booking.guestEmail}</p>
                                            </div>
                                        </div>

                                        {/* Reserved Seats/Tables Summary */}
                                        {booking.tickets.some(t => t.seatId) && (
                                            <div className="mt-4 pt-4 border-t border-white/20">
                                                <h4 className="text-sm font-medium text-purple-300 mb-3">📍 Your Reserved Seats</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* Group seats by type */}
                                                    {(() => {
                                                        const vipSeats = booking.tickets.filter(t => t.seatId?.toLowerCase().includes('vip'))
                                                        const tableSeats = booking.tickets.filter(t => t.seatId?.toLowerCase().includes('table') && !t.seatId?.toLowerCase().includes('vip'))
                                                        const otherSeats = booking.tickets.filter(t => t.seatId && !t.seatId.toLowerCase().includes('vip') && !t.seatId.toLowerCase().includes('table'))

                                                        return (
                                                            <>
                                                                {vipSeats.length > 0 && (
                                                                    <div className="bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/50 rounded-xl p-3 flex items-center gap-2">
                                                                        <span className="text-2xl">👑</span>
                                                                        <div>
                                                                            <p className="text-xs text-amber-300">VIP Tables</p>
                                                                            <p className="font-bold text-white">
                                                                                {[...new Set(vipSeats.map(s => s.seatId?.replace(/[^0-9]/g, '')))].join(', ')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {tableSeats.length > 0 && (
                                                                    <div className="bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-blue-500/50 rounded-xl p-3 flex items-center gap-2">
                                                                        <span className="text-2xl">🪑</span>
                                                                        <div>
                                                                            <p className="text-xs text-blue-300">Tables</p>
                                                                            <p className="font-bold text-white">
                                                                                {[...new Set(tableSeats.map(s => s.seatId?.replace(/[^0-9]/g, '')))].join(', ')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {otherSeats.length > 0 && (
                                                                    <div className="bg-gradient-to-br from-purple-500/30 to-indigo-600/30 border border-purple-500/50 rounded-xl p-3 flex items-center gap-2">
                                                                        <span className="text-2xl">💺</span>
                                                                        <div>
                                                                            <p className="text-xs text-purple-300">Seats</p>
                                                                            <p className="font-bold text-white">
                                                                                {otherSeats.map(s => s.seatId).join(', ')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Summary */}
                                    <div className="bg-white/5 rounded-xl p-4 space-y-2">
                                        <h3 className="font-semibold text-white mb-3">Price Summary</h3>
                                        <div className="flex justify-between text-white/70">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(booking.subtotal)}</span>
                                        </div>
                                        {booking.serviceFee > 0 && (
                                            <div className="flex justify-between text-white/70">
                                                <span>Service Fee</span>
                                                <span>{formatPrice(booking.serviceFee)}</span>
                                            </div>
                                        )}
                                        {booking.tax > 0 && (
                                            <div className="flex justify-between text-white/70">
                                                <span>Tax</span>
                                                <span>{formatPrice(booking.tax)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/20">
                                            <span>Total</span>
                                            <span className="text-green-400">{formatPrice(booking.total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Purchased Items */}
                                {(ticketItems.length > 0 || addonItems.length > 0) && (
                                    <div className="mt-6 pt-6 border-t border-white/20">
                                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                            <HiShoppingCart className="h-5 w-5 text-purple-400" />
                                            Purchased Items
                                        </h3>
                                        <div className="space-y-4">
                                            {/* Tickets with Seat Info */}
                                            {ticketItems.length > 0 && (
                                                <div className="bg-white/5 rounded-xl p-4">
                                                    <h4 className="text-sm font-medium text-purple-300 mb-3">🎫 Tickets & Seats</h4>
                                                    <div className="space-y-3">
                                                        {ticketItems.map((item, idx) => (
                                                            <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                                                                <div className="flex items-center gap-3">
                                                                    {/* Seat/Table Icon */}
                                                                    {item.seatId?.toLowerCase().includes('vip') ? (
                                                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-lg">
                                                                            👑
                                                                        </div>
                                                                    ) : item.seatId?.toLowerCase().includes('table') ? (
                                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-lg">
                                                                            🪑
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-lg">
                                                                            🎫
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium text-white">{item.ticketTier?.name || 'Ticket'}</p>
                                                                        <p className="text-xs text-white/60">
                                                                            {item.seatId ? (() => {
                                                                                // Parse new format: vip-t1-s3, t1-s4
                                                                                const vipMatch = item.seatId.match(/^vip-t(\d+)-s(\d+)$/i)
                                                                                if (vipMatch) {
                                                                                    return <span className="text-amber-400">📍 VIP Table {vipMatch[1]}, Seat {vipMatch[2]}</span>
                                                                                }
                                                                                const tableMatch = item.seatId.match(/^t(\d+)-s(\d+)$/i)
                                                                                if (tableMatch) {
                                                                                    return <span className="text-blue-400">📍 Table {tableMatch[1]}, Seat {tableMatch[2]}</span>
                                                                                }
                                                                                // Legacy format
                                                                                return <span className="text-green-400">📍 {item.seatId}</span>
                                                                            })() : (
                                                                                <span className="text-white/50">General Admission</span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-medium text-white">{formatPrice(Number(item.totalPrice))}</p>
                                                                    <p className="text-xs text-white/60">×{item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Add-ons */}
                                            {addonItems.length > 0 && (
                                                <div className="bg-white/5 rounded-xl p-4">
                                                    <h4 className="text-sm font-medium text-purple-300 mb-3">🎁 Add-ons & Extras</h4>
                                                    <div className="space-y-2">
                                                        {addonItems.map((item, idx) => (
                                                            <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-lg">
                                                                        {item.addOn?.name?.includes('Parking') ? '🚗' :
                                                                            item.addOn?.name?.includes('Dog') ? '🐕' :
                                                                                item.addOn?.name?.includes('Dinner') ? '🍽️' :
                                                                                    item.addOn?.name?.includes('VIP') ? '⭐' : '🎁'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-white">{item.addOn?.name || 'Add-on'}</p>
                                                                        <p className="text-xs text-white/60">×{item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="font-medium text-white">{formatPrice(Number(item.totalPrice))}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tickets Section */}
                        {booking.status === 'CONFIRMED' && booking.tickets.length > 0 && (
                            <div className="space-y-6">
                                {/* MASTER TICKET */}
                                {masterTicket && (
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                                            <span className="text-2xl">👑</span>
                                            Master Ticket (Group Entry)
                                        </h2>
                                        <p className="text-amber-200 text-sm mb-4">
                                            Use this master ticket to check in your entire group at once. Perfect if someone forgets their individual ticket!
                                        </p>
                                        <MasterTicketDisplay
                                            ticket={masterTicket}
                                            booking={{
                                                bookingNumber: booking.bookingNumber,
                                                guestName: booking.guestName,
                                                adultCount: booking.adultCount,
                                                childCount: booking.childCount,
                                            }}
                                            event={booking.event}
                                            individualTicketsCount={individualTickets.length}
                                        />
                                    </div>
                                )}

                                {/* INDIVIDUAL TICKETS */}
                                {individualTickets.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                <HiQrcode className="h-6 w-6 text-purple-400" />
                                                Individual Tickets ({individualTickets.length})
                                            </h2>
                                            {individualTickets.length > 2 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowAllTickets(!showAllTickets)}
                                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                                >
                                                    {showAllTickets ? (
                                                        <>
                                                            <HiChevronUp className="h-5 w-5 mr-2" />
                                                            Show Less
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiChevronDown className="h-5 w-5 mr-2" />
                                                            Show All Tickets
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>

                                        <p className="text-purple-200 text-sm">
                                            Each person has their own ticket with a unique QR code and seat assignment.
                                        </p>

                                        {/* Ticket Grid */}
                                        <div className={`grid ${showAllTickets || individualTickets.length <= 2 ? 'md:grid-cols-2' : ''} gap-6`}>
                                            {(showAllTickets ? individualTickets : individualTickets.slice(0, 2)).map((ticket, index) => (
                                                <div key={ticket.id} className="relative">
                                                    {/* Ticket Number Badge */}
                                                    <div className="absolute -top-3 -left-3 z-10 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                        {index + 1}
                                                    </div>
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

                                        {/* Summary of All Tickets */}
                                        {!showAllTickets && booking.tickets.length > 1 && (
                                            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                                                <CardContent className="p-4">
                                                    <p className="text-white/70 text-center mb-3">
                                                        + {booking.tickets.length - 1} more ticket(s)
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 justify-center">
                                                        {booking.tickets.slice(1).map((ticket, idx) => (
                                                            <div
                                                                key={ticket.id}
                                                                className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80"
                                                            >
                                                                #{idx + 2}: {ticket.seatId || 'General'}
                                                                {ticket.checkedInCount > 0 && <span className="text-green-400 ml-1">✓</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 justify-center">
                            <Link href="/events">
                                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                    Browse More Events
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* No Result Yet */}
                {!booking && !error && !loading && (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiSearch className="h-8 w-8 text-purple-300" />
                            </div>
                            <p className="text-white/70">Your booking number was sent to your email after purchase.</p>
                            <p className="text-sm text-white/50 mt-2">Format: EVT-XXXXXXXX</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
