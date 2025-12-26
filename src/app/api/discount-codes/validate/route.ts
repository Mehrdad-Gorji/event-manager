import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Validate discount code for booking
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, eventId, subtotal } = body

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 })
        }

        const discountCode = await prisma.discountCode.findUnique({
            where: { code: code.toUpperCase() }
        })

        if (!discountCode) {
            return NextResponse.json({ valid: false, error: 'Invalid discount code' }, { status: 200 })
        }

        // Check if active
        if (!discountCode.isActive) {
            return NextResponse.json({ valid: false, error: 'This code is no longer active' }, { status: 200 })
        }

        // Check event restriction
        if (discountCode.eventId && discountCode.eventId !== eventId) {
            return NextResponse.json({ valid: false, error: 'This code is not valid for this event' }, { status: 200 })
        }

        // Check date validity
        const now = new Date()
        if (discountCode.validFrom > now) {
            return NextResponse.json({ valid: false, error: 'This code is not yet valid' }, { status: 200 })
        }
        if (discountCode.validUntil && discountCode.validUntil < now) {
            return NextResponse.json({ valid: false, error: 'This code has expired' }, { status: 200 })
        }

        // Check usage limit
        if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
            return NextResponse.json({ valid: false, error: 'This code has reached its usage limit' }, { status: 200 })
        }

        // Check minimum purchase
        if (discountCode.minPurchase && subtotal < Number(discountCode.minPurchase)) {
            return NextResponse.json({
                valid: false,
                error: `Minimum purchase of €${discountCode.minPurchase} required`
            }, { status: 200 })
        }

        // Calculate discount
        let discountAmount = 0
        if (discountCode.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * Number(discountCode.discountValue)) / 100
            // Apply max discount cap if exists
            if (discountCode.maxDiscount) {
                discountAmount = Math.min(discountAmount, Number(discountCode.maxDiscount))
            }
        } else {
            discountAmount = Number(discountCode.discountValue)
        }

        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal)

        return NextResponse.json({
            valid: true,
            discountCode: {
                id: discountCode.id,
                code: discountCode.code,
                discountType: discountCode.discountType,
                discountValue: Number(discountCode.discountValue),
                description: discountCode.description
            },
            discountAmount: Math.round(discountAmount * 100) / 100
        })
    } catch (error) {
        console.error('Error validating discount code:', error)
        return NextResponse.json({ error: 'Failed to validate discount code' }, { status: 500 })
    }
}
