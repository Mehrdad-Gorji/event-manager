import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Create a new contact message
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, subject, message } = body

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        const contactMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                subject,
                message
            }
        })

        return NextResponse.json({
            message: 'Message sent successfully!',
            id: contactMessage.id
        })
    } catch (error) {
        console.error('Contact message error:', error)
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        )
    }
}

// GET - Get all contact messages (admin only)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const unreadOnly = searchParams.get('unread') === 'true'

        const messages = await prisma.contactMessage.findMany({
            where: unreadOnly ? { isRead: false } : undefined,
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Get contact messages error:', error)
        return NextResponse.json(
            { error: 'Failed to get messages' },
            { status: 500 }
        )
    }
}
