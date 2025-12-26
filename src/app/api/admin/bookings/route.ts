import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'
}

export async function GET() {
    // For now, allow access without auth for testing
    // In production, uncomment: if (!(await isAdmin())) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    try {
        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        eventDate: true,
                    },
                },
            },
        })

        return NextResponse.json(bookings)
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }
}
