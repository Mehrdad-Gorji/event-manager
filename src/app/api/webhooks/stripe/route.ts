import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: Request) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        const bookingId = session.metadata?.bookingId

        if (bookingId) {
            try {
                // Check if already processed (idempotency)
                const existingBooking = await prisma.booking.findUnique({
                    where: { id: bookingId },
                })

                if (existingBooking?.paymentStatus === 'PAID') {
                    console.log('Booking already paid:', bookingId)
                    return NextResponse.json({ received: true })
                }

                // Update booking status
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: 'CONFIRMED',
                        paymentStatus: 'PAID',
                        paidAt: new Date(),
                    },
                })

                console.log('Booking confirmed:', bookingId)

                // TODO: Send confirmation email
            } catch (error) {
                console.error('Error processing payment:', error)
                return NextResponse.json(
                    { error: 'Failed to process payment' },
                    { status: 500 }
                )
            }
        }
    }

    if (event.type === 'checkout.session.expired') {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.bookingId

        if (bookingId) {
            // Cancel the pending booking
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CANCELLED',
                    paymentStatus: 'FAILED',
                    cancelledAt: new Date(),
                },
            })

            // Also cancel the ticket
            await prisma.ticket.updateMany({
                where: { bookingId },
                data: { status: 'CANCELLED' },
            })

            console.log('Booking cancelled due to expired session:', bookingId)
        }
    }

    return NextResponse.json({ received: true })
}
