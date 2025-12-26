'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    HiBell,
    HiX,
    HiCheckCircle,
    HiExclamationCircle,
    HiCalendar,
    HiTicket,
    HiCash,
    HiCog
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

export function NotificationBell() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (session?.user) {
            fetchNotifications()
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000)
            return () => clearInterval(interval)
        }
    }, [session])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
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
            setUnreadCount(prev => Math.max(0, prev - 1))
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
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'BOOKING_CONFIRMED':
                return <HiCheckCircle className="h-5 w-5 text-green-500" />
            case 'BOOKING_CANCELLED':
                return <HiExclamationCircle className="h-5 w-5 text-red-500" />
            case 'EVENT_REMINDER':
                return <HiCalendar className="h-5 w-5 text-purple-500" />
            case 'EVENT_UPDATE':
                return <HiTicket className="h-5 w-5 text-blue-500" />
            case 'PAYMENT_RECEIVED':
                return <HiCash className="h-5 w-5 text-emerald-500" />
            default:
                return <HiCog className="h-5 w-5 text-gray-500" />
        }
    }

    if (!session) return null

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
                <HiBell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {unreadCount} unread
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <HiBell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.isRead ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-medium ${!notification.isRead
                                                        ? 'text-gray-900 dark:text-white'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <HiX className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                                </span>
                                                {notification.link && (
                                                    <Link
                                                        href={notification.link}
                                                        onClick={() => {
                                                            markAsRead(notification.id)
                                                            setIsOpen(false)
                                                        }}
                                                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                                    >
                                                        View Details →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <Link
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
