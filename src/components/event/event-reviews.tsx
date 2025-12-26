'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HiStar, HiCheckBadge, HiUser } from 'react-icons/hi2'

interface Review {
    id: string
    rating: number
    title: string | null
    comment: string | null
    isVerified: boolean
    createdAt: string
    author: string
}

interface ReviewStats {
    totalReviews: number
    averageRating: number
    ratingDistribution: { stars: number, count: number }[]
}

interface EventReviewsProps {
    eventId: string
}

export function EventReviews({ eventId }: EventReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState<ReviewStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        rating: 5,
        title: '',
        comment: '',
        guestName: '',
        guestEmail: '',
        bookingNumber: ''
    })

    useEffect(() => {
        fetchReviews()
    }, [eventId])

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?eventId=${eventId}&approved=true`)
            const data = await res.json()
            setReviews(data.reviews || [])
            setStats(data.stats || null)
        } catch (error) {
            console.error('Failed to fetch reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    ...formData
                })
            })

            if (res.ok) {
                alert('Thank you! Your review has been submitted and will appear after approval.')
                setShowForm(false)
                setFormData({ rating: 5, title: '', comment: '', guestName: '', guestEmail: '', bookingNumber: '' })
            } else {
                const error = await res.json()
                alert(error.error || 'Failed to submit review')
            }
        } catch (error) {
            alert('Failed to submit review')
        } finally {
            setSubmitting(false)
        }
    }

    const StarRating = ({ rating, size = 'md', interactive = false, onChange }: {
        rating: number
        size?: 'sm' | 'md' | 'lg'
        interactive?: boolean
        onChange?: (rating: number) => void
    }) => {
        const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => onChange?.(star)}
                        className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
                    >
                        <HiStar
                            className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                    </button>
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <HiStar className="w-5 h-5 text-yellow-400" />
                    Reviews
                </CardTitle>
                <Button size="sm" onClick={() => setShowForm(!showForm)}>
                    Write a Review
                </Button>
            </CardHeader>
            <CardContent>
                {/* Stats */}
                {stats && stats.totalReviews > 0 && (
                    <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900">{stats.averageRating}</div>
                            <StarRating rating={Math.round(stats.averageRating)} />
                            <div className="text-sm text-gray-500 mt-1">{stats.totalReviews} reviews</div>
                        </div>
                        <div className="flex-1">
                            {stats.ratingDistribution.reverse().map(({ stars, count }) => (
                                <div key={stars} className="flex items-center gap-2 text-sm">
                                    <span className="w-8">{stars}★</span>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-gray-500">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Review Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl mb-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Your Rating *</label>
                            <StarRating
                                rating={formData.rating}
                                size="lg"
                                interactive
                                onChange={(r) => setFormData({ ...formData, rating: r })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Your Name *"
                                value={formData.guestName}
                                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                                required
                            />
                            <Input
                                type="email"
                                placeholder="Your Email *"
                                value={formData.guestEmail}
                                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                                required
                            />
                        </div>

                        <Input
                            placeholder="Booking Number (optional - for verified badge)"
                            value={formData.bookingNumber}
                            onChange={(e) => setFormData({ ...formData, bookingNumber: e.target.value })}
                        />

                        <Input
                            placeholder="Review Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />

                        <textarea
                            className="w-full p-3 border rounded-lg resize-none"
                            rows={4}
                            placeholder="Share your experience..."
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        />

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Reviews List */}
                {reviews.length === 0 && !showForm ? (
                    <div className="text-center py-8 text-gray-500">
                        <HiStar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>No reviews yet</p>
                        <p className="text-sm">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="border-b pb-4 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <HiUser className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{review.author}</span>
                                                {review.isVerified && (
                                                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                        <HiCheckBadge className="w-3 h-3" />
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            <StarRating rating={review.rating} size="sm" />
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                                {review.comment && <p className="text-gray-600">{review.comment}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
