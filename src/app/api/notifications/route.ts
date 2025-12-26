import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Get notifications for current user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const unreadOnly = searchParams.get('unread') === 'true'

        const where: { userId: string; isRead?: boolean } = { userId: session.user.id }
        if (unreadOnly) where.isRead = false

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        return NextResponse.json(notifications)
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }
}

// POST - Create a notification
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, type, title, message, link } = body

        if (!userId || !type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link: link || null
            }
        })

        return NextResponse.json(notification, { status: 201 })
    } catch (error) {
        console.error('Error creating notification:', error)
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, notificationIds, markAll } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        if (markAll) {
            await prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true }
            })
        } else if (notificationIds && notificationIds.length > 0) {
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId
                },
                data: { isRead: true }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating notifications:', error)
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }
}
