'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HiHeart, HiCalendar, HiLocationMarker, HiTrash } from 'react-icons/hi'
import { format } from 'date-fns'

interface WishlistEvent {
    id: string
    event: {
        id: string
        title: string
        description: string | null
        coverImage: string | null
        eventDate: string
        startTime: string
        venueName: string
        adultPrice: number
        status: string
    }
    createdAt: string
}

export function WishlistPage() {
    const [wishlist, setWishlist] = useState<WishlistEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchWishlist()
    }, [])

    const fetchWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist')
            if (res.ok) {
                const data = await res.json()
                setWishlist(data)
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const removeFromWishlist = async (eventId: string) => {
        try {
            const res = await fetch(`/api/wishlist?eventId=${eventId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setWishlist(prev => prev.filter(item => item.event.id !== eventId))
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg">
                        <HiHeart className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            My Wishlist
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {wishlist.length} saved event{wishlist.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {wishlist.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                        <HiHeart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Your wishlist is empty
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Start exploring events and save your favorites!
                        </p>
                        <Link
                            href="/events"
                            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                                    {item.event.coverImage && (
                                        <img
                                            src={item.event.coverImage}
                                            alt={item.event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <button
                                        onClick={() => removeFromWishlist(item.event.id)}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                                        title="Remove from wishlist"
                                    >
                                        <HiTrash className="h-5 w-5" />
                                    </button>
                                    {item.event.status !== 'PUBLISHED' && (
                                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-yellow-500 text-white text-sm font-medium">
                                            {item.event.status}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                        {item.event.title}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <HiCalendar className="h-4 w-4 text-purple-500" />
                                            <span>
                                                {format(new Date(item.event.eventDate), 'EEE, MMM d, yyyy')} at{' '}
                                                {item.event.startTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                            <HiLocationMarker className="h-4 w-4 text-purple-500" />
                                            <span className="line-clamp-1">{item.event.venueName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                            €{Number(item.event.adultPrice).toFixed(2)}
                                        </div>
                                        <Link
                                            href={`/events/${item.event.id}`}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                                        >
                                            View Event
                                        </Link>
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
