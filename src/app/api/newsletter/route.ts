import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, name } = body

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Check if already subscribed
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        })

        if (existing) {
            if (existing.isActive) {
                return NextResponse.json(
                    { error: 'Email is already subscribed' },
                    { status: 400 }
                )
            } else {
                // Reactivate subscription
                await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: {
                        isActive: true,
                        unsubscribedAt: null,
                        name: name || existing.name
                    }
                })
                return NextResponse.json({
                    message: 'Successfully resubscribed to newsletter!'
                })
            }
        }

        // Create new subscriber
        await prisma.newsletterSubscriber.create({
            data: {
                email,
                name
            }
        })

        return NextResponse.json({
            message: 'Successfully subscribed to newsletter!'
        })
    } catch (error) {
        console.error('Newsletter subscription error:', error)
        return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
        )
    }
}

// DELETE - Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        })

        if (!subscriber) {
            return NextResponse.json(
                { error: 'Email not found' },
                { status: 404 }
            )
        }

        await prisma.newsletterSubscriber.update({
            where: { email },
            data: {
                isActive: false,
                unsubscribedAt: new Date()
            }
        })

        return NextResponse.json({
            message: 'Successfully unsubscribed from newsletter'
        })
    } catch (error) {
        console.error('Newsletter unsubscribe error:', error)
        return NextResponse.json(
            { error: 'Failed to unsubscribe' },
            { status: 500 }
        )
    }
}

// GET - Get all subscribers (admin only)
export async function GET() {
    try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
            orderBy: { subscribedAt: 'desc' }
        })

        return NextResponse.json(subscribers)
    } catch (error) {
        console.error('Get subscribers error:', error)
        return NextResponse.json(
            { error: 'Failed to get subscribers' },
            { status: 500 }
        )
    }
}
