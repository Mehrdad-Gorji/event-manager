import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                ticketTiers: true,
                addOns: true,
                venueLayout: true,
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'PENDING'] },
                    },
                    include: {
                        items: true // We need items to count booked seats
                    }
                },
            },
        })

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        // Calculate booked counts
        let bookedCount = 0
        const bookedSeatIds: string[] = []

        event.bookings.forEach(booking => {
            // Legacy count
            bookedCount += booking.adultCount + booking.childCount + booking.vipCount

            // Item count & Seat IDs
            booking.items.forEach(item => {
                // If it's a ticket (has tierId or just generic item count if we move fully to items)
                // For capacity, we assume 1 item = 1 person unless specified otherwise
                bookedCount += item.quantity

                if (item.seatId) {
                    bookedSeatIds.push(item.seatId)
                }
            })
        })

        const eventData = {
            id: event.id,
            title: event.title,
            description: event.description,
            rules: event.rules,
            coverImage: event.coverImage,
            eventDate: event.eventDate,
            startTime: event.startTime,
            endTime: event.endTime,
            doorsOpenTime: event.doorsOpenTime,
            venueName: event.venueName,
            venueAddress: event.venueAddress,
            bookingMode: event.bookingMode,
            reEntryAllowed: event.reEntryAllowed,
            status: event.status,
            maxCapacity: event.maxCapacity,
            remainingCapacity: Math.max(0, event.maxCapacity - bookedCount),

            // Legacy Pricing
            adultPrice: Number(event.adultPrice),
            childPrice: event.childPrice ? Number(event.childPrice) : null,
            vipPrice: event.vipPrice ? Number(event.vipPrice) : null,

            serviceFeePercent: Number(event.serviceFeePercent),
            taxPercent: Number(event.taxPercent),

            // New Features
            ticketTiers: event.ticketTiers.map(t => ({
                ...t,
                price: Number(t.price)
            })),
            addOns: event.addOns.map(a => ({
                ...a,
                price: Number(a.price)
            })),
            venueLayout: event.venueLayout,
            bookedSeatIds: bookedSeatIds
        }

        return NextResponse.json(eventData)
    } catch (error) {
        console.error('Error fetching event:', error)
        return NextResponse.json(
            { error: 'Failed to fetch event' },
            { status: 500 }
        )
    }
}
