'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    HiBell,
    HiCheckCircle,
    HiExclamationCircle,
    HiCalendar,
    HiTicket,
    HiCash,
    HiCog,
    HiTrash,
    HiCheck
} from 'react-icons/hi'
import { format } from 'date-fns'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: string
}

export default function NotificationsPage() {
    const { data: session, status } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        if (session?.user) {
            fetchNotifications()
        }
    }, [session])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true })
            })
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            )
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'POST'
            })
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE'
            })
            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'BOOKING_CONFIRMED':
                return <HiCheckCircle className="h-6 w-6 text-green-500" />
            case 'BOOKING_CANCELLED':
                return <HiExclamationCircle className="h-6 w-6 text-red-500" />
            case 'EVENT_REMINDER':
                return <HiCalendar className="h-6 w-6 text-purple-500" />
            case 'EVENT_UPDATE':
                return <HiTicket className="h-6 w-6 text-blue-500" />
            case 'PAYMENT_RECEIVED':
                return <HiCash className="h-6 w-6 text-emerald-500" />
            default:
                return <HiCog className="h-6 w-6 text-gray-500" />
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
                    <HiBell className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign In Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please sign in to view your notifications
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                            <HiBell className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Notifications
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread'
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                Unread
                            </button>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                            >
                                <HiCheck className="h-5 w-5" />
                                Mark All Read
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                        <HiBell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {filter === 'unread'
                                ? 'You\'re all caught up!'
                                : 'When you receive notifications, they\'ll appear here'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group p-5 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all ${!notification.isRead ? 'ring-2 ring-purple-300 dark:ring-purple-700' : ''
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className={`font-semibold ${!notification.isRead
                                                        ? 'text-gray-900 dark:text-white'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {notification.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-sm text-gray-400 dark:text-gray-500">
                                                        {format(new Date(notification.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                                                    </span>
                                                    {notification.link && (
                                                        <Link
                                                            href={notification.link}
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                                        >
                                                            View Details →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-green-500 transition-all"
                                                        title="Mark as read"
                                                    >
                                                        <HiCheck className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 transition-all"
                                                    title="Delete"
                                                >
                                                    <HiTrash className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
