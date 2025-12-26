'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { HiPlus, HiPencil, HiEye, HiTrash } from 'react-icons/hi'

interface Event {
    id: string
    title: string
    eventDate: string
    startTime: string
    venueName: string
    status: string
    maxCapacity: number
    bookedCount: number
    remainingCapacity: number
    adultPrice: number
    totalRevenue: number
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/admin/events')
            if (res.ok) {
                const data = await res.json()
                setEvents(data)
            }
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return

        try {
            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setEvents(events.filter((e) => e.id !== id))
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete event')
            }
        } catch (error) {
            alert('Failed to delete event')
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            if (res.ok) {
                setEvents(events.map((e) => (e.id === id ? { ...e, status: newStatus } : e)))
            }
        } catch (error) {
            alert('Failed to update status')
        }
    }

    const statusBadge = {
        DRAFT: { label: 'Draft', variant: 'warning' as const },
        PUBLISHED: { label: 'Published', variant: 'success' as const },
        SOLDOUT: { label: 'Sold Out', variant: 'info' as const },
        CANCELLED: { label: 'Cancelled', variant: 'error' as const },
        COMPLETED: { label: 'Completed', variant: 'default' as const },
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Events
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your events
                    </p>
                </div>
                <Link href="/admin/events/new">
                    <Button>
                        <HiPlus className="h-5 w-5 mr-2" />
                        New Event
                    </Button>
                </Link>
            </div>

            {/* Events List */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No events found</p>
                            <Link href="/admin/events/new">
                                <Button>Create Your First Event</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr className="text-left">
                                        <th className="px-6 py-4 font-medium text-gray-500">Event</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Price</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Capacity</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Revenue</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-800">
                                    {events.map((event) => {
                                        const status = statusBadge[event.status as keyof typeof statusBadge]
                                        return (
                                            <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {event.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{event.venueName}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                    {formatDate(event.eventDate)}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {formatPrice(event.adultPrice)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                            <div
                                                                className="h-full bg-purple-500 rounded-full"
                                                                style={{
                                                                    width: `${(event.bookedCount / event.maxCapacity) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {event.bookedCount}/{event.maxCapacity}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-green-600">
                                                    {formatPrice(event.totalRevenue || 0)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={status?.variant}>{status?.label}</Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/events/${event.id}`}>
                                                            <Button variant="ghost" size="icon" title="View">
                                                                <HiEye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/admin/events/${event.id}/edit`}>
                                                            <Button variant="ghost" size="icon" title="Edit">
                                                                <HiPencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Delete"
                                                            onClick={() => handleDelete(event.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <HiTrash className="h-4 w-4" />
                                                        </Button>
                                                        {event.status === 'DRAFT' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleStatusChange(event.id, 'PUBLISHED')}
                                                            >
                                                                Publish
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
