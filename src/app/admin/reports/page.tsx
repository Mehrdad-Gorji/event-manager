'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import { HiDownload } from 'react-icons/hi'

interface EventReport {
    id: string
    title: string
    eventDate: string
    bookedCount: number
    maxCapacity: number
    totalRevenue: number
    status: string
}

export default function ReportsPage() {
    const [events, setEvents] = useState<EventReport[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/admin/events')
            if (res.ok) {
                const data = await res.json()
                setEvents(data)
            }
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalRevenue = events.reduce((sum, e) => sum + (e.totalRevenue || 0), 0)
    const totalBookings = events.reduce((sum, e) => sum + (e.bookedCount || 0), 0)
    const totalCapacity = events.reduce((sum, e) => sum + e.maxCapacity, 0)

    const exportCSV = () => {
        const headers = ['Event', 'Date', 'Booked', 'Capacity', 'Revenue', 'Status']
        const rows = events.map((e) => [
            e.title,
            new Date(e.eventDate).toLocaleDateString(),
            e.bookedCount,
            e.maxCapacity,
            e.totalRevenue || 0,
            e.status,
        ])

        const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `event-report-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Sales and capacity analytics</p>
                </div>
                <Button onClick={exportCSV}>
                    <HiDownload className="h-5 w-5 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">Total Bookings</p>
                        <p className="text-3xl font-bold text-blue-600">{totalBookings}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">Avg. Capacity Used</p>
                        <p className="text-3xl font-bold text-purple-600">
                            {totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Events Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Event</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b dark:border-gray-800">
                                        <th className="pb-3 font-medium text-gray-500">Event</th>
                                        <th className="pb-3 font-medium text-gray-500">Date</th>
                                        <th className="pb-3 font-medium text-gray-500">Bookings</th>
                                        <th className="pb-3 font-medium text-gray-500">Capacity</th>
                                        <th className="pb-3 font-medium text-gray-500">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-800">
                                    {events.map((event) => (
                                        <tr key={event.id}>
                                            <td className="py-4 font-medium">{event.title}</td>
                                            <td className="py-4 text-gray-600">{formatDate(event.eventDate)}</td>
                                            <td className="py-4">{event.bookedCount}</td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                        <div
                                                            className="h-full bg-purple-500 rounded-full"
                                                            style={{ width: `${(event.bookedCount / event.maxCapacity) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {Math.round((event.bookedCount / event.maxCapacity) * 100)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 font-medium text-green-600">
                                                {formatPrice(event.totalRevenue || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
