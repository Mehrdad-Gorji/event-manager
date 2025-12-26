import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all discount codes
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('eventId')
        const active = searchParams.get('active')

        const where: any = {}
        if (eventId) where.eventId = eventId
        if (active === 'true') where.isActive = true

        const discountCodes = await prisma.discountCode.findMany({
            where,
            include: {
                event: {
                    select: { id: true, title: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(discountCodes)
    } catch (error) {
        console.error('Error fetching discount codes:', error)
        return NextResponse.json({ error: 'Failed to fetch discount codes' }, { status: 500 })
    }
}

// POST - Create new discount code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            code,
            description,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            usageLimit,
            validFrom,
            validUntil,
            eventId,
            isActive
        } = body

        // Check if code already exists
        const existing = await prisma.discountCode.findUnique({
            where: { code: code.toUpperCase() }
        })

        if (existing) {
            return NextResponse.json({ error: 'Code already exists' }, { status: 400 })
        }

        const discountCode = await prisma.discountCode.create({
            data: {
                code: code.toUpperCase(),
                description,
                discountType: discountType || 'PERCENTAGE',
                discountValue: parseFloat(discountValue),
                minPurchase: minPurchase ? parseFloat(minPurchase) : null,
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                validFrom: validFrom ? new Date(validFrom) : new Date(),
                validUntil: validUntil ? new Date(validUntil) : null,
                eventId: eventId || null,
                isActive: isActive !== false
            }
        })

        return NextResponse.json(discountCode, { status: 201 })
    } catch (error) {
        console.error('Error creating discount code:', error)
        return NextResponse.json({ error: 'Failed to create discount code' }, { status: 500 })
    }
}
