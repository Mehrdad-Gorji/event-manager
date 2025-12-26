import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List gallery images for an event
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('eventId')

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
        }

        const images = await prisma.eventGalleryImage.findMany({
            where: { eventId },
            orderBy: [
                { isHero: 'desc' },
                { sortOrder: 'asc' },
                { createdAt: 'asc' }
            ]
        })

        return NextResponse.json(images)
    } catch (error) {
        console.error('Error fetching gallery:', error)
        return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
    }
}

// POST - Add image to gallery
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { eventId, imageUrl, caption, isHero } = body

        if (!eventId || !imageUrl) {
            return NextResponse.json({ error: 'Event ID and image URL are required' }, { status: 400 })
        }

        // Get current max sort order
        const lastImage = await prisma.eventGalleryImage.findFirst({
            where: { eventId },
            orderBy: { sortOrder: 'desc' }
        })

        const sortOrder = (lastImage?.sortOrder || 0) + 1

        // If setting as hero, unset other heroes
        if (isHero) {
            await prisma.eventGalleryImage.updateMany({
                where: { eventId, isHero: true },
                data: { isHero: false }
            })
        }

        const image = await prisma.eventGalleryImage.create({
            data: {
                eventId,
                imageUrl,
                caption: caption || null,
                sortOrder,
                isHero: isHero || false
            }
        })

        return NextResponse.json(image, { status: 201 })
    } catch (error) {
        console.error('Error adding gallery image:', error)
        return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
    }
}

// DELETE - Remove image from gallery
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const imageId = searchParams.get('id')

        if (!imageId) {
            return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
        }

        await prisma.eventGalleryImage.delete({
            where: { id: imageId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting gallery image:', error)
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
    }
}
