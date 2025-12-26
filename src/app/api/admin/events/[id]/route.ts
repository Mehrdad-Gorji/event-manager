import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateEventSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Temporarily disabled for testing
    // if (!(await isAdmin())) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    try {
        const { id } = await params

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                bookings: {
                    include: {
                        tickets: true,
                    },
                },
                ticketTiers: true,
                addOns: true,
            },
        })

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error fetching event:', error)
        return NextResponse.json(
            { error: 'Failed to fetch event' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Temporarily disabled for testing
    // if (!(await isAdmin())) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    try {
        const { id } = await params
        const body = await request.json()
        const validatedData = updateEventSchema.parse(body)

        const { ticketTiers, addOns, ...rest } = validatedData

        const event = await prisma.event.update({
            where: { id },
            data: {
                ...rest,
                venueLayoutId: validatedData.venueLayoutId,
                eventDate: validatedData.eventDate
                    ? new Date(validatedData.eventDate)
                    : undefined,
                ticketTiers: ticketTiers ? {
                    deleteMany: {},
                    create: ticketTiers.map(t => ({
                        ...t,
                        price: Number(t.price)
                    }))
                } : undefined,
                addOns: addOns ? {
                    deleteMany: {},
                    create: addOns.map(a => ({
                        ...a,
                        price: Number(a.price)
                    }))
                } : undefined,
            },
        })

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error updating event:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
        }
        return NextResponse.json(
            { error: 'Failed to update event' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Temporarily disabled for testing
    // if (!(await isAdmin())) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    try {
        const { id } = await params

        // Check if event has confirmed bookings
        const bookings = await prisma.booking.count({
            where: {
                eventId: id,
                status: 'CONFIRMED',
            },
        })

        if (bookings > 0) {
            return NextResponse.json(
                { error: 'Cannot delete event with confirmed bookings' },
                { status: 400 }
            )
        }

        await prisma.event.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting event:', error)
        return NextResponse.json(
            { error: 'Failed to delete event' },
            { status: 500 }
        )
    }
}
