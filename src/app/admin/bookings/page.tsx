'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { HiDownload, HiEye } from 'react-icons/hi'

interface Booking {
    id: string
    bookingNumber: string
    status: string
    guestName: string | null
    guestEmail: string | null
    adultCount: number
    childCount: number
    total: string
    createdAt: string
    event: {
        id: string
        title: string
        eventDate: string
    }
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/admin/bookings')
            if (res.ok) {
                const data = await res.json()
                setBookings(data)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const statusBadge = {
        PENDING: { label: 'Pending', variant: 'warning' as const },
        CONFIRMED: { label: 'Confirmed', variant: 'success' as const },
        CANCELLED: { label: 'Cancelled', variant: 'error' as const },
        REFUNDED: { label: 'Refunded', variant: 'default' as const },
    }

    const exportCSV = () => {
        // Helper to escape CSV values
        const escapeCSV = (value: any): string => {
            const str = String(value ?? '')
            // If contains semicolon, newline, or quote, wrap in quotes and escape quotes
            if (str.includes(';') || str.includes('\n') || str.includes('"') || str.includes(',')) {
                return `"${str.replace(/"/g, '""')}"`
            }
            return str
        }

        const headers = ['Booking #', 'Event', 'Event Date', 'Guest Name', 'Guest Email', 'Adults', 'Children', 'Total (EUR)', 'Status', 'Booking Date']
        const rows = bookings.map((b) => [
            b.bookingNumber,
            b.event.title,
            new Date(b.event.eventDate).toLocaleDateString('de-DE'),
            b.guestName || 'N/A',
            b.guestEmail || 'N/A',
            b.adultCount,
            b.childCount,
            Number(b.total).toFixed(2),
            b.status,
            new Date(b.createdAt).toLocaleDateString('de-DE'),
        ])

        // Build CSV with proper escaping - use semicolon for European Excel
        const csvContent = [
            headers.map(escapeCSV).join(';'),
            ...rows.map(row => row.map(escapeCSV).join(';'))
        ].join('\r\n')

        // Add BOM for UTF-8 Excel compatibility
        const BOM = '\uFEFF'
        const fullContent = BOM + csvContent

        // Create filename
        const filename = `bookings-${new Date().toISOString().slice(0, 10)}.csv`

        // Use data URI approach for better browser compatibility
        const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(fullContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all reservations</p>
                </div>
                <Button onClick={exportCSV} variant="outline">
                    <HiDownload className="h-5 w-5 mr-2" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No bookings yet
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr className="text-left">
                                        <th className="px-6 py-4 font-medium text-gray-500">Booking #</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Event</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Guest</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Persons</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Total</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                                        <th className="px-6 py-4 font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-800">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="px-6 py-4 font-mono text-sm">{booking.bookingNumber}</td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium">{booking.event.title}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(booking.event.eventDate)}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium">{booking.guestName || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500">{booking.guestEmail}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{booking.adultCount + booking.childCount}</td>
                                            <td className="px-6 py-4 font-medium">{formatPrice(Number(booking.total))}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={statusBadge[booking.status as keyof typeof statusBadge]?.variant}>
                                                    {statusBadge[booking.status as keyof typeof statusBadge]?.label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/bookings/${booking.id}`}>
                                                    <Button variant="ghost" size="icon" title="View details">
                                                        <HiEye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
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
