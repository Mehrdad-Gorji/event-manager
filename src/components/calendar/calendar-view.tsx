'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
    HiChevronLeft,
    HiChevronRight,
    HiCalendar,
    HiClock,
    HiLocationMarker
} from 'react-icons/hi'
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday
} from 'date-fns'

interface Event {
    id: string
    title: string
    eventDate: string
    startTime: string
    venueName: string
    coverImage: string | null
    adultPrice: number
    status: string
}

interface CalendarViewProps {
    events?: Event[]
}

export function CalendarView({ events: propEvents }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [events, setEvents] = useState<Event[]>(propEvents || [])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isLoading, setIsLoading] = useState(!propEvents)

    useEffect(() => {
        if (!propEvents) {
            fetchEvents()
        }
    }, [propEvents])

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events')
            if (res.ok) {
                const json = await res.json()
                // Handle both { data: [...] } and direct array formats
                const eventsData = Array.isArray(json) ? json : (json.data || [])
                setEvents(eventsData)
            }
        } catch (error) {
            console.error('Error fetching events:', error)
            setEvents([])
        } finally {
            setIsLoading(false)
        }
    }

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const eventsByDate = useMemo(() => {
        const map = new Map<string, Event[]>()
        events.forEach(event => {
            const dateKey = format(new Date(event.eventDate), 'yyyy-MM-dd')
            const existing = map.get(dateKey) || []
            map.set(dateKey, [...existing, event])
        })
        return map
    }, [events])

    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return []
        const dateKey = format(selectedDate, 'yyyy-MM-dd')
        return eventsByDate.get(dateKey) || []
    }, [selectedDate, eventsByDate])

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
            {/* Calendar Header */}
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                            <HiCalendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            <p className="text-purple-100 text-sm">
                                {events.length} upcoming events
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"
                        >
                            <HiChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all text-sm font-medium"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"
                        >
                            <HiChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 p-6">
                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div
                                key={day}
                                className="py-2 text-center text-sm font-semibold text-gray-500 dark:text-gray-400"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            const dateKey = format(day, 'yyyy-MM-dd')
                            const dayEvents = eventsByDate.get(dateKey) || []
                            const isCurrentMonth = isSameMonth(day, currentMonth)
                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                            const hasEvents = dayEvents.length > 0

                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                    relative aspect-square p-2 rounded-xl transition-all
                    ${isCurrentMonth
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-300 dark:text-gray-600'}
                    ${isSelected
                                            ? 'bg-purple-600 text-white'
                                            : isToday(day)
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                    ${hasEvents && !isSelected ? 'ring-2 ring-purple-300 dark:ring-purple-700' : ''}
                  `}
                                >
                                    <span className={`
                    text-sm font-medium
                    ${isSelected ? 'text-white' : ''}
                  `}>
                                        {format(day, 'd')}
                                    </span>

                                    {hasEvents && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                            {dayEvents.slice(0, 3).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Selected Date Events */}
                <div className="border-l border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {selectedDate
                            ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                            : 'Select a date'
                        }
                    </h3>

                    {selectedDate ? (
                        selectedDateEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateEvents.map(event => (
                                    <Link
                                        key={event.id}
                                        href={`/events/${event.id}`}
                                        className="block p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors line-clamp-1">
                                            {event.title}
                                        </h4>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <HiClock className="h-4 w-4 text-purple-500" />
                                                <span>{event.startTime}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <HiLocationMarker className="h-4 w-4 text-purple-500" />
                                                <span className="line-clamp-1">{event.venueName}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-lg font-bold text-purple-600 dark:text-purple-400">
                                            €{Number(event.adultPrice).toFixed(2)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <HiCalendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No events on this date
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-8">
                            <HiCalendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">
                                Click on a date to see events
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
