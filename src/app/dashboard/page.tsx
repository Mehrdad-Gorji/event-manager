'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
    HiUser,
    HiTicket,
    HiHeart,
    HiCalendar,
    HiCog,
    HiLogout,
    HiBell,
    HiCheckCircle,
    HiClock,
    HiXCircle
} from 'react-icons/hi'
import { format } from 'date-fns'
import { signOut } from 'next-auth/react'

interface Booking {
    id: string
    bookingNumber: string
    status: string
    total: number
    createdAt: string
    event: {
        id: string
        title: string
        eventDate: string
        venueName: string
    }
}

interface StatCard {
    icon: typeof HiTicket
    label: string
    value: string | number
    color: string
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [wishlistCount, setWishlistCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (session?.user) {
            fetchUserData()
        }
    }, [session])

    const fetchUserData = async () => {
        try {
            // Fetch bookings
            const bookingsRes = await fetch('/api/bookings/user')
            if (bookingsRes.ok) {
                const data = await bookingsRes.json()
                setBookings(data)
            }

            // Fetch wishlist count
            const wishlistRes = await fetch('/api/wishlist')
            if (wishlistRes.ok) {
                const data = await wishlistRes.json()
                setWishlistCount(data.length)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-md">
                    <HiUser className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign In Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please sign in to access your dashboard
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    const upcomingBookings = bookings.filter(
        b => b.status === 'CONFIRMED' && new Date(b.event.eventDate) >= new Date()
    )
    const pastBookings = bookings.filter(
        b => new Date(b.event.eventDate) < new Date()
    )

    const stats: StatCard[] = [
        {
            icon: HiTicket,
            label: 'Total Bookings',
            value: bookings.length,
            color: 'from-purple-500 to-indigo-500'
        },
        {
            icon: HiCalendar,
            label: 'Upcoming Events',
            value: upcomingBookings.length,
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: HiHeart,
            label: 'Wishlist Items',
            value: wishlistCount,
            color: 'from-red-500 to-pink-500'
        },
        {
            icon: HiCheckCircle,
            label: 'Attended Events',
            value: pastBookings.length,
            color: 'from-blue-500 to-cyan-500'
        }
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return <HiCheckCircle className="h-5 w-5 text-green-500" />
            case 'PENDING':
                return <HiClock className="h-5 w-5 text-yellow-500" />
            case 'CANCELLED':
                return <HiXCircle className="h-5 w-5 text-red-500" />
            default:
                return null
        }
    }

    const menuItems = [
        { icon: HiTicket, label: 'My Bookings', href: '/my-bookings' },
        { icon: HiHeart, label: 'Wishlist', href: '/wishlist' },
        { icon: HiCalendar, label: 'Calendar', href: '/calendar' },
        { icon: HiBell, label: 'Notifications', href: '/notifications' },
        { icon: HiCog, label: 'Settings', href: '/settings' }
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm text-white text-3xl font-bold">
                            {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Welcome back, {session.user?.name || 'User'}!
                            </h1>
                            <p className="text-purple-100 mt-1">
                                {session.user?.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                        >
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Quick Menu */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Quick Menu
                            </h2>
                            <div className="space-y-2">
                                {menuItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {item.label}
                                        </span>
                                    </Link>
                                ))}

                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                        <HiLogout className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-red-600">
                                        Sign Out
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Recent Bookings
                                </h2>
                                <Link
                                    href="/my-bookings"
                                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                                >
                                    View All
                                </Link>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <HiTicket className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        No bookings yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Start exploring events and make your first booking!
                                    </p>
                                    <Link
                                        href="/events"
                                        className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                                    >
                                        Browse Events
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.slice(0, 5).map((booking) => (
                                        <Link
                                            key={booking.id}
                                            href={`/my-bookings?booking=${booking.bookingNumber}`}
                                            className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {getStatusIcon(booking.status)}
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                            #{booking.bookingNumber}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                                        {booking.event.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <HiCalendar className="h-4 w-4" />
                                                            {format(new Date(booking.event.eventDate), 'MMM d, yyyy')}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            {booking.event.venueName}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                        €{Number(booking.total).toFixed(2)}
                                                    </div>
                                                    <div className={`text-xs font-medium mt-1 ${booking.status === 'CONFIRMED'
                                                            ? 'text-green-600'
                                                            : booking.status === 'PENDING'
                                                                ? 'text-yellow-600'
                                                                : 'text-red-600'
                                                        }`}>
                                                        {booking.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
