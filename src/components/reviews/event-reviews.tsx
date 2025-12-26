'use client'

import { useState, useEffect } from 'react'
import { HiStar, HiUser, HiCheckBadge } from 'react-icons/hi2'
import { format } from 'date-fns'

interface Review {
    id: string
    rating: number
    title: string | null
    comment: string | null
    isVerified: boolean
    createdAt: string
    guestName: string | null
    user: {
        name: string | null
        image: string | null
    } | null
}

interface EventReviewsProps {
    eventId: string
}

export function EventReviews({ eventId }: EventReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [averageRating, setAverageRating] = useState(0)

    useEffect(() => {
        fetchReviews()
    }, [eventId])

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?eventId=${eventId}`)
            if (res.ok) {
                const data = await res.json()
                setReviews(data)

                if (data.length > 0) {
                    const avg = data.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.length
                    setAverageRating(avg)
                }
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
        const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <HiStar
                        key={star}
                        className={`${sizeClass} ${star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                    />
                ))}
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Reviews Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Reviews
                    </h3>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-3 mt-2">
                            {renderStars(Math.round(averageRating), 'lg')}
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {averageRating.toFixed(1)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Rating Distribution */}
            {reviews.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter(r => r.rating === rating).length
                            const percentage = (count / reviews.length) * 100

                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-12">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
                                        <HiStar className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                                        {count}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <HiStar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                        No reviews yet. Be the first to review this event!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                                        {review.user?.image ? (
                                            <img
                                                src={review.user.image}
                                                alt=""
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            (review.user?.name?.charAt(0) || review.guestName?.charAt(0) || 'U')
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {review.user?.name || review.guestName || 'Anonymous'}
                                            </span>
                                            {review.isVerified && (
                                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                                    <HiCheckBadge className="h-3 w-3" />
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                </div>
                                {renderStars(review.rating)}
                            </div>

                            {review.title && (
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {review.title}
                                </h4>
                            )}

                            {review.comment && (
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
