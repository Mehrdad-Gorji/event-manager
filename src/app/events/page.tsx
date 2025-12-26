'use client'

import { useEffect, useState } from 'react'
import { EventCard } from '@/components/events/event-card'

interface Event {
    id: string
    title: string
    description: string | null
    coverImage: string | null
    eventDate: string
    startTime: string
    venueName: string
    status: string
    adultPrice: number
    remainingCapacity: number
    maxCapacity: number
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events?status=PUBLISHED')
            if (!res.ok) throw new Error('Failed to fetch events')
            const data = await res.json()
            setEvents(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm animate-pulse">
                            <div className="h-48 bg-gray-200 dark:bg-gray-800" />
                            <div className="p-5 space-y-3">
                                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchEvents}
                        className="mt-4 text-purple-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Upcoming Events
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Discover and book tickets for amazing events
                </p>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No events available at the moment.</p>
                    <p className="text-gray-400 text-sm mt-2">Check back later for new events!</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    )
}
