import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Please login to view your bookings' },
                { status: 401 }
            )
        }

        const bookings = await prisma.booking.findMany({
            where: { userId: session.user.id },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        eventDate: true,
                        startTime: true,
                        venueName: true,
                        coverImage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(bookings)
    } catch (error) {
        console.error('Get user bookings error:', error)
        return NextResponse.json(
            { error: 'Failed to get bookings' },
            { status: 500 }
        )
    }
}
