'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { BookingForm, BookingData } from '@/components/booking/booking-form'
import { EventReviews } from '@/components/event/event-reviews'
import { EventGallery } from '@/components/event/event-gallery'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'
import { HiLocationMarker, HiClock, HiUsers, HiInformationCircle, HiTicket, HiCalendar, HiArrowLeft } from 'react-icons/hi'

interface EventDetails {
    id: string
    title: string
    description: string | null
    rules: string | null
    coverImage: string | null
    eventDate: string
    startTime: string
    endTime: string | null
    doorsOpenTime: string | null
    venueName: string
    venueAddress: string | null
    bookingMode: string
    reEntryAllowed: boolean
    status: string
    maxCapacity: number
    remainingCapacity: number

    // Legacy pricing
    adultPrice: number
    childPrice: number | null
    vipPrice: number | null

    // New Advanced Pricing
    ticketTiers: {
        id: string
        name: string
        price: number
        capacity: number | null
        description: string | null
    }[]
    addOns: {
        id: string
        name: string
        price: number
        stock: number | null
        description: string | null
    }[]

    serviceFeePercent: number
    taxPercent: number
}

export default function EventDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [event, setEvent] = useState<EventDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [bookingLoading, setBookingLoading] = useState(false)

    useEffect(() => {
        if (params.id) {
            fetchEvent()
        }
    }, [params.id])

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/events/${params.id}`)
            if (!res.ok) {
                if (res.status === 404) throw new Error('Event not found')
                throw new Error('Failed to fetch event')
            }
            const data = await res.json()
            setEvent({
                ...data,
                ticketTiers: data.ticketTiers || [],
                addOns: data.addOns || []
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleBooking = async (data: BookingData) => {
        setBookingLoading(true)
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'Booking failed')
            }

            if (result.paymentUrl) {
                window.location.href = result.paymentUrl
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Booking failed')
        } finally {
            setBookingLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-[500px] bg-white/10 rounded-3xl" />
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-8 bg-white/10 rounded-xl w-3/4" />
                                <div className="h-4 bg-white/10 rounded-xl w-full" />
                                <div className="h-4 bg-white/10 rounded-xl w-2/3" />
                            </div>
                            <div className="h-96 bg-white/10 rounded-3xl" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-5xl">😢</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        {error || 'Event not found'}
                    </h1>
                    <button
                        onClick={() => router.push('/events')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                        Back to events
                    </button>
                </div>
            </div>
        )
    }

    const statusBadge = {
        PUBLISHED: { label: 'Available', variant: 'success' as const, glow: 'shadow-green-500/50' },
        SOLDOUT: { label: 'Sold Out', variant: 'error' as const, glow: 'shadow-red-500/50' },
        CANCELLED: { label: 'Cancelled', variant: 'error' as const, glow: 'shadow-red-500/50' },
    }

    const status = statusBadge[event.status as keyof typeof statusBadge]
    const canBook = event.status === 'PUBLISHED' && event.remainingCapacity > 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Hero Section */}
            <div className="relative h-[500px] lg:h-[600px] overflow-hidden">
                {/* Background Image */}
                {event.coverImage ? (
                    <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-900">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-1000" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[200px] opacity-10">🎉</span>
                        </div>
                    </div>
                )}

                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => router.push('/events')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full transition-all duration-300 border border-white/20"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {status && (
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg ${status.glow}`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${status.variant === 'success' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                    {status.label}
                                </span>
                            )}
                            {!event.reEntryAllowed && (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-200">
                                    No Re-entry
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                            {event.title}
                        </h1>

                        {/* Quick Info Pills */}
                        <div className="flex flex-wrap gap-4 mt-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 border border-white/10">
                                <HiCalendar className="w-5 h-5 text-purple-300" />
                                <span>{formatDate(event.eventDate)}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 border border-white/10">
                                <HiClock className="w-5 h-5 text-purple-300" />
                                <span>{formatTime(event.startTime)}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 border border-white/10">
                                <HiLocationMarker className="w-5 h-5 text-purple-300" />
                                <span>{event.venueName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-20 relative z-10">
                <div className="space-y-6">

                    {/* Event Details */}

                    {/* Info Cards Grid */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        {/* Date Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
                                    <HiCalendar className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-sm text-purple-300 font-medium">Date</p>
                                <p className="text-lg font-bold text-white mt-1">{formatDate(event.eventDate)}</p>
                            </div>
                        </div>

                        {/* Time Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
                                    <HiClock className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-sm text-indigo-300 font-medium">Time</p>
                                <p className="text-lg font-bold text-white mt-1">{formatTime(event.startTime)}</p>
                                {event.doorsOpenTime && (
                                    <p className="text-sm text-white/50 mt-0.5">Doors: {formatTime(event.doorsOpenTime)}</p>
                                )}
                            </div>
                        </div>

                        {/* Availability Card */}
                        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-green-500/30">
                                    <HiUsers className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-sm text-green-300 font-medium">Availability</p>
                                <p className="text-lg font-bold text-white mt-1">{event.remainingCapacity} spots</p>
                                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${(event.remainingCapacity / event.maxCapacity) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Venue Card */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                                <HiLocationMarker className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{event.venueName}</h3>
                                {event.venueAddress && (
                                    <p className="text-white/60 mt-1">{event.venueAddress}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    {event.description && (
                        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
                                About This Event
                            </h2>
                            <p className="text-white/70 leading-relaxed whitespace-pre-line">
                                {event.description}
                            </p>
                        </div>
                    )}

                    {/* Pricing Section */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
                            Ticket Pricing
                        </h2>
                        <div className="space-y-3">
                            {event.ticketTiers && event.ticketTiers.length > 0 ? (
                                event.ticketTiers.map((tier, index) => (
                                    <div
                                        key={tier.id}
                                        className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.01] ${index === 0
                                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30'
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${index === 0
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                                                : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                                }`}>
                                                <HiTicket className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <span className={`font-semibold ${index === 0 ? 'text-amber-200' : 'text-white'}`}>
                                                    {tier.name}
                                                </span>
                                                {tier.description && (
                                                    <p className="text-sm text-white/50">{tier.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-xl font-bold ${index === 0 ? 'text-amber-300' : 'text-white'}`}>
                                            {formatPrice(tier.price)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                                <HiTicket className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold text-white">Adult Ticket</span>
                                        </div>
                                        <span className="text-xl font-bold text-white">{formatPrice(event.adultPrice)}</span>
                                    </div>
                                    {event.vipPrice !== null && Number(event.vipPrice) > 0 && (
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                                    <HiTicket className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="font-semibold text-amber-200">VIP Ticket</span>
                                            </div>
                                            <span className="text-xl font-bold text-amber-300">{formatPrice(Number(event.vipPrice))}</span>
                                        </div>
                                    )}
                                    {event.childPrice !== null && Number(event.childPrice) > 0 && (
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                                    <HiTicket className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="font-semibold text-white">Child Ticket</span>
                                            </div>
                                            <span className="text-xl font-bold text-white">{formatPrice(Number(event.childPrice))}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Booking Form - Below Pricing */}
                    <div>
                        {canBook ? (
                            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                                    <h2 className="text-lg font-bold text-white text-center">🎟️ Book Your Tickets</h2>
                                </div>
                                <div className="p-1">
                                    <BookingForm
                                        event={event}
                                        onSubmit={handleBooking}
                                        isLoading={bookingLoading}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <span className="text-4xl">😔</span>
                                </div>
                                <p className="text-xl font-bold text-white mb-2">
                                    {event.status === 'SOLDOUT' ? 'Sold Out' : 'Not Available'}
                                </p>
                                <p className="text-white/60">
                                    {event.status === 'SOLDOUT'
                                        ? 'This event is fully booked.'
                                        : 'This event is not available for booking.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Rules Section */}
                    {event.rules && (
                        <div className="rounded-2xl bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                                    <HiInformationCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-amber-200 mb-2">
                                        Event Rules & Information
                                    </h3>
                                    <p className="text-amber-100/70 text-sm whitespace-pre-line leading-relaxed">
                                        {event.rules}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Event Gallery */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                        <EventGallery eventId={event.id} />
                    </div>

                    {/* Event Reviews */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                        <EventReviews eventId={event.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
