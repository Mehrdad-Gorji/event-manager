'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import {
    HiArrowLeft,
    HiCurrencyDollar,
    HiTicket,
    HiShoppingCart,
    HiTrendingUp,
    HiCalendar
} from 'react-icons/hi'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'

interface AnalyticsData {
    summary: {
        totalRevenue: number
        totalBookings: number
        totalTickets: number
        averageOrderValue: number
        period: number
    }
    dailyData: { date: string, revenue: number, bookings: number }[]
    topEvents: { id: string, title: string, revenue: number, bookings: number }[]
    tierBreakdown: { name: string, revenue: number }[]
    addOnBreakdown: { name: string, quantity: number, revenue: number }[]
    recentBookings: { id: string, bookingNumber: string, eventTitle: string, total: number, createdAt: string }[]
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState(30)

    useEffect(() => {
        fetchAnalytics()
    }, [period])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/analytics?period=${period}`)
            const json = await res.json()
            setData(json)
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !data) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
                    </div>
                    <div className="h-80 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
                        <HiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <HiTrendingUp className="w-6 h-6 text-purple-600" />
                            Sales Analytics
                        </h1>
                        <p className="text-gray-500">Track your revenue and bookings</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {[7, 30, 90].map(days => (
                        <Button
                            key={days}
                            variant={period === days ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod(days)}
                        >
                            {days} Days
                        </Button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <HiCurrencyDollar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-purple-100 text-sm">Total Revenue</p>
                                <p className="text-2xl font-bold">{formatPrice(data.summary.totalRevenue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <HiShoppingCart className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-cyan-100 text-sm">Total Bookings</p>
                                <p className="text-2xl font-bold">{data.summary.totalBookings}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <HiTicket className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm">Tickets Sold</p>
                                <p className="text-2xl font-bold">{data.summary.totalTickets}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <HiTrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-amber-100 text-sm">Avg. Order Value</p>
                                <p className="text-2xl font-bold">{formatPrice(data.summary.averageOrderValue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `€${value}`}
                                />
                                <Tooltip
                                    formatter={(value) => [`€${Number(value ?? 0).toFixed(2)}`, 'Revenue']}
                                    labelFormatter={(date) => formatDate(String(date))}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8b5cf6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Events */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Events by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topEvents} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" tickFormatter={(value) => `€${value}`} />
                                    <YAxis
                                        type="category"
                                        dataKey="title"
                                        width={150}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip formatter={(value) => [`€${Number(value ?? 0).toFixed(2)}`, 'Revenue']} />
                                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Ticket Tier Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Ticket Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            {data.tierBreakdown.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.tierBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="revenue"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                        >
                                            {data.tierBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`€${Number(value ?? 0).toFixed(2)}`, 'Revenue']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No ticket tier data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add-on Sales */}
            {data.addOnBreakdown.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Add-on Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {data.addOnBreakdown.map(addon => (
                                <div key={addon.name} className="p-4 bg-gray-50 rounded-xl">
                                    <p className="font-medium text-gray-900">{addon.name}</p>
                                    <p className="text-2xl font-bold text-purple-600">{formatPrice(addon.revenue)}</p>
                                    <p className="text-sm text-gray-500">{addon.quantity} sold</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Bookings */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.recentBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-3 font-medium">Booking #</th>
                                        <th className="text-left p-3 font-medium">Event</th>
                                        <th className="text-left p-3 font-medium">Amount</th>
                                        <th className="text-left p-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentBookings.map(booking => (
                                        <tr key={booking.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <Link href={`/admin/bookings/${booking.id}`} className="text-purple-600 hover:underline font-mono">
                                                    {booking.bookingNumber}
                                                </Link>
                                            </td>
                                            <td className="p-3">{booking.eventTitle}</td>
                                            <td className="p-3 font-semibold">{formatPrice(booking.total)}</td>
                                            <td className="p-3 text-gray-500">{formatDate(booking.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No bookings in this period
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
