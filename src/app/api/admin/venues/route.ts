
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createVenueLayoutSchema } from '@/lib/validations'

export async function GET() {
    try {
        const layouts = await prisma.venueLayout.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                events: {
                    select: { id: true, title: true }
                }
            }
        })
        return NextResponse.json(layouts)
    } catch (error) {
        console.error('Error fetching venue layouts:', error)
        return NextResponse.json({ error: 'Failed to fetch layouts' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validated = createVenueLayoutSchema.parse(body)

        const layout = await prisma.venueLayout.create({
            data: {
                name: validated.name,
                description: validated.description,
                canvasWidth: validated.canvasWidth,
                canvasHeight: validated.canvasHeight,
                width: validated.width,
                depth: validated.depth,
                elements: validated.elements as any // Prisma Json type workaround
            }
        })

        return NextResponse.json(layout)
    } catch (error) {
        console.error('Error creating venue layout:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to create layout' }, { status: 500 })
    }
}
