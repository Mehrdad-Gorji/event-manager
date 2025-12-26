import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get user's wishlist
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Please login to view your wishlist' },
                { status: 401 }
            )
        }

        const wishlist = await prisma.wishlist.findMany({
            where: { userId: session.user.id },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        coverImage: true,
                        eventDate: true,
                        startTime: true,
                        venueName: true,
                        adultPrice: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(wishlist)
    } catch (error) {
        console.error('Get wishlist error:', error)
        return NextResponse.json(
            { error: 'Failed to get wishlist' },
            { status: 500 }
        )
    }
}

// POST - Add event to wishlist
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Please login to add to wishlist' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { eventId } = body

        if (!eventId) {
            return NextResponse.json(
                { error: 'Event ID is required' },
                { status: 400 }
            )
        }

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        })

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            )
        }

        // Check if already in wishlist
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId
                }
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Event already in wishlist' },
                { status: 400 }
            )
        }

        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: session.user.id,
                eventId
            }
        })

        return NextResponse.json({
            message: 'Event added to wishlist!',
            id: wishlistItem.id
        })
    } catch (error) {
        console.error('Add to wishlist error:', error)
        return NextResponse.json(
            { error: 'Failed to add to wishlist' },
            { status: 500 }
        )
    }
}

// DELETE - Remove event from wishlist
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Please login to manage wishlist' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('eventId')

        if (!eventId) {
            return NextResponse.json(
                { error: 'Event ID is required' },
                { status: 400 }
            )
        }

        await prisma.wishlist.delete({
            where: {
                userId_eventId: {
                    userId: session.user.id,
                    eventId
                }
            }
        })

        return NextResponse.json({
            message: 'Event removed from wishlist'
        })
    } catch (error) {
        console.error('Remove from wishlist error:', error)
        return NextResponse.json(
            { error: 'Failed to remove from wishlist' },
            { status: 500 }
        )
    }
}
