import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'PUBLISHED'
        const from = searchParams.get('from')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = parseInt(searchParams.get('offset') || '0')

        const where: Record<string, unknown> = {}

        if (status !== 'all') {
            where.status = status
        }

        if (from) {
            where.eventDate = {
                gte: new Date(from),
            }
        }

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                orderBy: { eventDate: 'asc' },
                take: limit,
                skip: offset,
                include: {
                    _count: {
                        select: { bookings: true },
                    },
                    bookings: {
                        where: {
                            status: { in: ['CONFIRMED', 'PENDING'] },
                        },
                        select: {
                            adultCount: true,
                            childCount: true,
                        },
                    },
                },
            }),
            prisma.event.count({ where }),
        ])

        const eventsWithCapacity = events.map((event) => {
            const bookedCount = event.bookings.reduce(
                (sum, b) => sum + b.adultCount + b.childCount,
                0
            )
            return {
                id: event.id,
                title: event.title,
                description: event.description,
                coverImage: event.coverImage,
                eventDate: event.eventDate,
                startTime: event.startTime,
                venueName: event.venueName,
                status: event.status,
                adultPrice: Number(event.adultPrice),
                childPrice: event.childPrice ? Number(event.childPrice) : null,
                maxCapacity: event.maxCapacity,
                remainingCapacity: event.maxCapacity - bookedCount,
            }
        })

        return NextResponse.json({
            data: eventsWithCapacity,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        })
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        )
    }
}
