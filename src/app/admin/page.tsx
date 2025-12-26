'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { HiCurrencyDollar, HiTicket, HiUsers, HiTrendingUp, HiPlus } from 'react-icons/hi'

interface DashboardStats {
    totalRevenue: number
    totalBookings: number
    totalEvents: number
    upcomingEvents: number
}

interface RecentEvent {
    id: string
    title: string
    eventDate: string
    bookedCount: number
    maxCapacity: number
    totalRevenue: number
    status: string
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalBookings: 0,
        totalEvents: 0,
        upcomingEvents: 0,
    })
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/events')
            if (res.ok) {
                const events = await res.json()

                // Calculate stats from events
                const now = new Date()
                const totalRevenue = events.reduce((sum: number, e: RecentEvent) => sum + (e.totalRevenue || 0), 0)
                const totalBookings = events.reduce((sum: number, e: RecentEvent) => sum + (e.bookedCount || 0), 0)
                const upcomingEvents = events.filter((e: RecentEvent) => new Date(e.eventDate) >= now).length

                setStats({
                    totalRevenue,
                    totalBookings,
                    totalEvents: events.length,
                    upcomingEvents,
                })

                setRecentEvents(events.slice(0, 5))
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatPrice(stats.totalRevenue),
            icon: HiCurrencyDollar,
            color: 'from-green-500 to-emerald-500',
        },
        {
            title: 'Total Bookings',
            value: stats.totalBookings.toString(),
            icon: HiTicket,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'Active Events',
            value: stats.totalEvents.toString(),
            icon: HiUsers,
            color: 'from-purple-500 to-indigo-500',
        },
        {
            title: 'Upcoming Events',
            value: stats.upcomingEvents.toString(),
            icon: HiTrendingUp,
            color: 'from-orange-500 to-amber-500',
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Overview of your event bookings
                    </p>
                </div>
                <Link href="/admin/events/new">
                    <Button>
                        <HiPlus className="h-5 w-5 mr-2" />
                        New Event
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                                        {loading ? '...' : stat.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Events */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Events</CardTitle>
                    <Link href="/admin/events">
                        <Button variant="ghost" size="sm">
                            View All
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : recentEvents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No events yet.</p>
                            <Link href="/admin/events/new" className="text-purple-600 hover:underline">
                                Create your first event
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b dark:border-gray-800">
                                        <th className="pb-3 font-medium text-gray-500">Event</th>
                                        <th className="pb-3 font-medium text-gray-500">Date</th>
                                        <th className="pb-3 font-medium text-gray-500">Capacity</th>
                                        <th className="pb-3 font-medium text-gray-500">Revenue</th>
                                        <th className="pb-3 font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-800">
                                    {recentEvents.map((event) => (
                                        <tr key={event.id}>
                                            <td className="py-4">
                                                <Link
                                                    href={`/admin/events/${event.id}`}
                                                    className="font-medium text-gray-900 dark:text-white hover:text-purple-600"
                                                >
                                                    {event.title}
                                                </Link>
                                            </td>
                                            <td className="py-4 text-gray-600 dark:text-gray-400">
                                                {new Date(event.eventDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                                            <td className="py-4 font-medium">
                                                {formatPrice(event.totalRevenue || 0)}
                                            </td>
                                            <td className="py-4">
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${event.status === 'PUBLISHED'
                                                            ? 'bg-green-100 text-green-700'
                                                            : event.status === 'DRAFT'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {event.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/admin/events/new">
                    <Card className="hover:border-purple-500 transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                                <HiPlus className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-semibold">Create Event</p>
                                <p className="text-sm text-gray-500">Add a new event</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/staff/checkin">
                    <Card className="hover:border-purple-500 transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                                <HiTicket className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="font-semibold">Check-In Mode</p>
                                <p className="text-sm text-gray-500">Scan guest tickets</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/bookings">
                    <Card className="hover:border-purple-500 transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                <HiUsers className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold">View Bookings</p>
                                <p className="text-sm text-gray-500">Manage reservations</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
