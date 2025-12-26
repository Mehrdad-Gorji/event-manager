import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PATCH - Mark notification as read
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        await prisma.notification.updateMany({
            where: {
                id,
                userId: session.user.id
            },
            data: { isRead: body.isRead ?? true }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating notification:', error)
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }
}

// DELETE - Delete notification
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        await prisma.notification.deleteMany({
            where: {
                id,
                userId: session.user.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting notification:', error)
        return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
    }
}
