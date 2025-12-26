import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List reviews for an event
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('eventId')
        const approved = searchParams.get('approved')

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
        }

        const where: any = { eventId }

        // For public view, only show approved reviews
        if (approved === 'true') {
            where.isApproved = true
        }

        const reviews = await prisma.eventReview.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, image: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Calculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

        // Rating distribution
        const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
            stars: star,
            count: reviews.filter(r => r.rating === star).length
        }))

        return NextResponse.json({
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                isVerified: r.isVerified,
                createdAt: r.createdAt,
                author: r.user?.name || r.guestName || 'Anonymous'
            })),
            stats: {
                totalReviews: reviews.length,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingDistribution
            }
        })
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
}

// POST - Submit a new review
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { eventId, rating, title, comment, userId, guestName, guestEmail, bookingNumber } = body

        if (!eventId || !rating) {
            return NextResponse.json({ error: 'Event ID and rating are required' }, { status: 400 })
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }

        // Check if user already reviewed this event
        if (userId) {
            const existingReview = await prisma.eventReview.findFirst({
                where: { eventId, userId }
            })
            if (existingReview) {
                return NextResponse.json({ error: 'You have already reviewed this event' }, { status: 400 })
            }
        }

        // Verify purchase if booking number provided
        let isVerified = false
        if (bookingNumber) {
            const booking = await prisma.booking.findFirst({
                where: {
                    bookingNumber,
                    eventId,
                    paymentStatus: 'PAID'
                }
            })
            isVerified = !!booking
        }

        const review = await prisma.eventReview.create({
            data: {
                eventId,
                userId: userId || null,
                guestName: guestName || null,
                guestEmail: guestEmail || null,
                rating,
                title: title || null,
                comment: comment || null,
                isVerified,
                isApproved: false // Requires admin approval
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Review submitted successfully. It will be visible after approval.',
            reviewId: review.id
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating review:', error)
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }
}
