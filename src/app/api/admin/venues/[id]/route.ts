
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateVenueLayoutSchema } from '@/lib/validations'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const layout = await prisma.venueLayout.findUnique({
            where: { id },
            include: {
                events: {
                    select: { id: true, title: true }
                }
            }
        })

        if (!layout) {
            return NextResponse.json({ error: 'Layout not found' }, { status: 404 })
        }

        return NextResponse.json(layout)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch layout' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const validated = updateVenueLayoutSchema.parse(body)

        const layout = await prisma.venueLayout.update({
            where: { id },
            data: {
                ...validated,
                elements: validated.elements ? (validated.elements as any) : undefined
            }
        })

        return NextResponse.json(layout)
    } catch (error) {
        console.error('Error updating layout:', error)
        return NextResponse.json({ error: 'Failed to update layout' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Check usage
        const usageCount = await prisma.event.count({
            where: { venueLayoutId: id }
        })

        if (usageCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete layout used by events' },
                { status: 400 }
            )
        }

        await prisma.venueLayout.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete layout' }, { status: 500 })
    }
}
