'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'
import {
    HiArrowLeft,
    HiPencil,
    HiCalendar,
    HiClock,
    HiLocationMarker,
    HiUsers,
    HiTicket,
    HiCurrencyDollar,
    HiEye,
    HiTrash
} from 'react-icons/hi'

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
    adultPrice: number
    childPrice: number | null
    vipPrice: number | null
    serviceFeePercent: number
    taxPercent: number
    ticketTiers: {
        id: string
        name: string
        price: number
        capacity: number | null
        description: string | null
        sectionMatcher: string | null
    }[]
    addOns: {
        id: string
        name: string
        price: number
        stock: number | null
        description: string | null
    }[]
    venueLayout?: {
        id: string
        name: string
    }
}

export default function AdminEventDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [event, setEvent] = useState<EventDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
            setEvent(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return
        }

        try {
            const res = await fetch(`/api/events/${params.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete event')
            router.push('/admin/events')
        } catch (err) {
            alert('Failed to delete event')
        }
    }

    const statusColors: Record<string, string> = {
        DRAFT: 'bg-gray-500',
        PUBLISHED: 'bg-green-500',
        SOLDOUT: 'bg-red-500',
        CANCELLED: 'bg-red-700',
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="p-8">
                <div className="text-center py-12">
                    <p className="text-red-500 text-lg">{error || 'Event not found'}</p>
                    <Link href="/admin/events" className="mt-4 inline-block text-purple-600 hover:underline">
                        ← Back to Events
                    </Link>
                </div>
            </div>
        )
    }

    const bookedCount = event.maxCapacity - event.remainingCapacity

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/events" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <HiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{event.title}</h1>
                        <p className="text-gray-500">{formatDate(event.eventDate)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={`${statusColors[event.status]} text-white`}>
                        {event.status}
                    </Badge>
                    <Link href={`/events/${event.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                            <HiEye className="w-4 h-4 mr-2" />
                            View Public
                        </Button>
                    </Link>
                    <Link href={`/admin/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <HiPencil className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <HiTrash className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Cover Image */}
            {event.coverImage && (
                <div className="relative h-64 w-full rounded-xl overflow-hidden mb-6">
                    <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <HiCalendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-semibold">{formatDate(event.eventDate)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <HiClock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-semibold">{formatTime(event.startTime)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <HiUsers className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                                <p className="text-sm text-gray-500">Capacity</p>
                                <p className="font-semibold">{bookedCount}/{event.maxCapacity}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <HiTicket className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                                <p className="text-sm text-gray-500">Available</p>
                                <p className="font-semibold text-green-600">{event.remainingCapacity}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Description */}
                    {event.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Ticket Tiers */}
                    {event.ticketTiers && event.ticketTiers.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket Tiers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {event.ticketTiers.map(tier => (
                                        <div key={tier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{tier.name}</p>
                                                {tier.description && (
                                                    <p className="text-sm text-gray-500">{tier.description}</p>
                                                )}
                                                {tier.sectionMatcher && (
                                                    <Badge variant="outline" className="mt-1">
                                                        Section: {tier.sectionMatcher}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-purple-600">{formatPrice(tier.price)}</p>
                                                {tier.capacity && (
                                                    <p className="text-sm text-gray-500">Capacity: {tier.capacity}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Add-ons */}
                    {event.addOns && event.addOns.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Add-ons</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {event.addOns.map(addon => (
                                        <div key={addon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{addon.name}</p>
                                                {addon.description && (
                                                    <p className="text-sm text-gray-500">{addon.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-purple-600">{formatPrice(addon.price)}</p>
                                                {addon.stock !== null && (
                                                    <p className="text-sm text-gray-500">Stock: {addon.stock}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rules */}
                    {event.rules && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Rules</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 whitespace-pre-line">{event.rules}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Venue Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HiLocationMarker className="w-5 h-5 text-purple-600" />
                                Venue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{event.venueName}</p>
                            {event.venueAddress && (
                                <p className="text-sm text-gray-500 mt-1">{event.venueAddress}</p>
                            )}
                            {event.venueLayout && (
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-sm text-gray-500">Layout</p>
                                    <Link
                                        href={`/admin/venues/builder/${event.venueLayout.id}`}
                                        className="text-purple-600 hover:underline text-sm"
                                    >
                                        {event.venueLayout.name} →
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HiCurrencyDollar className="w-5 h-5 text-purple-600" />
                                Legacy Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Adult</span>
                                <span className="font-medium">{formatPrice(event.adultPrice)}</span>
                            </div>
                            {event.childPrice !== null && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Child</span>
                                    <span className="font-medium">{formatPrice(event.childPrice)}</span>
                                </div>
                            )}
                            {event.vipPrice !== null && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">VIP</span>
                                    <span className="font-medium">{formatPrice(event.vipPrice)}</span>
                                </div>
                            )}
                            <div className="pt-2 border-t mt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Service Fee</span>
                                    <span>{event.serviceFeePercent}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax</span>
                                    <span>{event.taxPercent}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Booking Mode</span>
                                <Badge variant="outline">{event.bookingMode}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Re-entry Allowed</span>
                                <span>{event.reEntryAllowed ? '✓ Yes' : '✗ No'}</span>
                            </div>
                            {event.doorsOpenTime && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Doors Open</span>
                                    <span>{formatTime(event.doorsOpenTime)}</span>
                                </div>
                            )}
                            {event.endTime && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">End Time</span>
                                    <span>{formatTime(event.endTime)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
