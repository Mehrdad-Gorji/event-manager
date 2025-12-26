import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEventSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Check if user is admin
async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'
}

export async function GET() {
    // Temporarily disabled for testing
    // if (!(await isAdmin())) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    try {
        const events = await prisma.event.findMany({
            orderBy: { eventDate: 'desc' },
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
                        total: true,
                    },
                },
            },
        })

        const eventsWithStats = events.map((event) => {
            const bookedCount = event.bookings.reduce(
                (sum, b) => sum + b.adultCount + b.childCount,
                0
            )
            const totalRevenue = event.bookings.reduce(
                (sum, b) => sum + Number(b.total),
                0
            )
            return {
                ...event,
                bookedCount,
                remainingCapacity: event.maxCapacity - bookedCount,
                totalRevenue,
                adultPrice: Number(event.adultPrice),
                childPrice: event.childPrice ? Number(event.childPrice) : null,
            }
        })

        return NextResponse.json(eventsWithStats)
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    // Temporarily disabled for testing - enable in production
    // if (!(await isAdmin())) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    try {
        const body = await request.json()
        console.log('Received body:', body)

        const validatedData = createEventSchema.parse(body)
        console.log('Validated data:', validatedData)

        const event = await prisma.event.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                rules: validatedData.rules,
                coverImage: validatedData.coverImage || null,
                eventDate: new Date(validatedData.eventDate),
                startTime: validatedData.startTime,
                endTime: validatedData.endTime,
                doorsOpenTime: validatedData.doorsOpenTime,
                maxCapacity: validatedData.maxCapacity,
                adultPrice: validatedData.adultPrice,
                childPrice: validatedData.childPrice,
                serviceFeePercent: validatedData.serviceFeePercent,
                taxPercent: validatedData.taxPercent,
                venueName: validatedData.venueName,
                venueAddress: validatedData.venueAddress,
                reEntryAllowed: validatedData.reEntryAllowed,
                venueLayoutId: validatedData.venueLayoutId || undefined,
                status: 'DRAFT',
                // Create relations
                ticketTiers: {
                    create: validatedData.ticketTiers
                },
                addOns: {
                    create: validatedData.addOns
                }
            },
        })

        return NextResponse.json(event, { status: 201 })
    } catch (error) {
        console.error('Error creating event:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input data', details: error }, { status: 400 })
        }
        return NextResponse.json(
            { error: 'Failed to create event', details: String(error) },
            { status: 500 }
        )
    }
}
