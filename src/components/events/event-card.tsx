'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPrice, formatTime } from '@/lib/utils'
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineUsers } from 'react-icons/hi'

interface EventCardProps {
    event: {
        id: string
        title: string
        description: string | null
        coverImage: string | null
        eventDate: string | Date
        startTime: string
        venueName: string
        status: string
        adultPrice: number
        remainingCapacity: number
        maxCapacity: number
    }
}

export function EventCard({ event }: EventCardProps) {
    const capacityPercent = ((event.maxCapacity - event.remainingCapacity) / event.maxCapacity) * 100

    const statusBadge = {
        PUBLISHED: { label: 'Available', variant: 'success' as const },
        SOLDOUT: { label: 'Sold Out', variant: 'error' as const },
        CANCELLED: { label: 'Cancelled', variant: 'error' as const },
        DRAFT: { label: 'Coming Soon', variant: 'warning' as const },
        COMPLETED: { label: 'Completed', variant: 'default' as const },
    }

    const status = statusBadge[event.status as keyof typeof statusBadge] || statusBadge.DRAFT

    return (
        <Link href={`/events/${event.id}`}>
            <Card className="group overflow-hidden cursor-pointer h-full">
                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
                    {event.coverImage ? (
                        <Image
                            src={event.coverImage}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl opacity-30">🎉</span>
                        </div>
                    )}
                    <div className="absolute top-3 right-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {event.title}
                    </h3>

                    {event.description && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {event.description}
                        </p>
                    )}

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <HiOutlineClock className="h-4 w-4 mr-2 text-purple-500" />
                            <span>{formatDate(event.eventDate)} at {formatTime(event.startTime)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <HiOutlineLocationMarker className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="line-clamp-1">{event.venueName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <HiOutlineUsers className="h-4 w-4 mr-2 text-purple-500" />
                            <span>{event.remainingCapacity} spots left</span>
                        </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="mt-4">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${capacityPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Price */}
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500">From</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            {formatPrice(event.adultPrice)}
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
