import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBookingSchema } from '@/lib/validations'
import { generateBookingNumber, generateQRToken } from '@/lib/utils'
import { stripe } from '@/lib/stripe'

import { Prisma, Booking, BookingItem, TicketTier, EventAddOn, Event } from '@prisma/client'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validatedData = createBookingSchema.parse(body)

        // Manual type definition to bypass potential stale auto-generated types in editor
        type FullBooking = Booking & { items: BookingItem[]; tickets?: any[] }
        type FullEvent = Event & {
            ticketTiers: TicketTier[]
            addOns: EventAddOn[]
            bookings: FullBooking[]
        }

        // Get event details with related data
        const event = await prisma.event.findUnique({
            where: { id: validatedData.eventId },
            include: {
                ticketTiers: true,
                addOns: true,
                bookings: {
                    where: { status: { in: ['CONFIRMED', 'PENDING'] } },
                    include: { items: true } // Include items to calculate new capacity logic
                },
            },
        }) as unknown as FullEvent | null

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        if (event.status !== 'PUBLISHED') {
            return NextResponse.json({ error: 'Event is not available for booking' }, { status: 400 })
        }

        let totalPersons = 0
        let subtotal = 0
        const bookingItemsToCreate: any[] = []

        // Extract already booked seat IDs
        const bookedSeatIds = new Set<string>()
        event.bookings.forEach(b => {
            b.items.forEach(i => {
                if (i.seatId) bookedSeatIds.add(i.seatId)
            })
        })

        // Process "Items" (New Logic)
        if (validatedData.items && validatedData.items.length > 0) {
            for (const item of validatedData.items) {
                if (item.ticketTierId) {
                    const tier = event.ticketTiers.find(t => t.id === item.ticketTierId)
                    if (!tier) throw new Error(`Invalid ticket tier: ${item.ticketTierId}`)

                    // Check Seat Availability
                    if (item.seatId) {
                        if (bookedSeatIds.has(item.seatId)) {
                            return NextResponse.json({ error: `Selected seat is no longer available. Please select another.` }, { status: 409 })
                        }
                    }

                    // Check Tier Capacity
                    if (tier.capacity) {
                        const tierBooked = event.bookings.reduce((sum: number, b) => {
                            const foundItem = b.items.find((i) => i.ticketTierId === tier.id)
                            return sum + (foundItem ? foundItem.quantity : 0)
                        }, 0)
                        if (tierBooked + item.quantity > tier.capacity) {
                            return NextResponse.json({ error: `Not enough tickets for ${tier.name}` }, { status: 400 })
                        }
                    }

                    subtotal += Number(tier.price) * item.quantity
                    totalPersons += item.quantity
                    bookingItemsToCreate.push({
                        ticketTierId: tier.id,
                        quantity: item.quantity,
                        unitPrice: tier.price,
                        totalPrice: Number(tier.price) * item.quantity,
                        seatId: item.seatId // Save the seat ID
                    })
                } else if (item.addOnId) {
                    const addon = event.addOns.find(a => a.id === item.addOnId)
                    if (!addon) throw new Error(`Invalid add-on: ${item.addOnId}`)

                    // Check Stock
                    if (addon.stock) {
                        const addonBooked = event.bookings.reduce((sum: number, b) => {
                            const foundItem = b.items.find((i) => i.addOnId === addon.id)
                            return sum + (foundItem ? foundItem.quantity : 0)
                        }, 0)
                        if (addonBooked + item.quantity > addon.stock) {
                            return NextResponse.json({ error: `Not enough stock for ${addon.name}` }, { status: 400 })
                        }
                    }

                    subtotal += Number(addon.price) * item.quantity
                    bookingItemsToCreate.push({
                        addOnId: addon.id,
                        quantity: item.quantity,
                        unitPrice: addon.price,
                        totalPrice: Number(addon.price) * item.quantity
                    })
                }
            }
        }
        // fallback to Legacy Logic
        else {
            totalPersons = validatedData.adultCount + validatedData.childCount + (validatedData.vipCount || 0)
            subtotal =
                validatedData.adultCount * Number(event.adultPrice) +
                validatedData.childCount * (event.childPrice ? Number(event.childPrice) : 0) +
                (validatedData.vipCount || 0) * (event.vipPrice ? Number(event.vipPrice) : 0)
        }

        // Global Capacity Check
        const totalBooked = event.bookings.reduce((sum: number, b) => {
            // Count from legacy fields
            const legacyCount = b.adultCount + b.childCount + b.vipCount
            // Count from items (only tickets count towards event capacity, not addons)
            const itemsCount = b.items.filter((i) => i.ticketTierId !== null).reduce((s: number, i) => s + i.quantity, 0)
            return sum + Math.max(legacyCount, itemsCount) // Use whichever is populated (usually one or other)
        }, 0)

        const remainingCapacity = event.maxCapacity - totalBooked
        if (totalPersons > remainingCapacity) {
            return NextResponse.json(
                {
                    error: 'CAPACITY_EXCEEDED',
                    message: `Only ${remainingCapacity} spots available`,
                    remainingCapacity,
                },
                { status: 400 }
            )
        }

        const serviceFee = (subtotal * Number(event.serviceFeePercent)) / 100
        const tax = ((subtotal + serviceFee) * Number(event.taxPercent)) / 100
        const total = subtotal + serviceFee + tax

        // Generate Tickets
        const ticketsToCreate: any[] = []

        if (bookingItemsToCreate.length > 0) {
            // ALWAYS create a Master Ticket first (for the group/booking owner)
            ticketsToCreate.push({
                ticketType: 'GROUP',
                qrToken: generateQRToken(),
                totalPersons: totalPersons,
                checkedInCount: 0,
                seatId: null, // Master ticket doesn't have a specific seat
                status: 'VALID',
            })

            // Then create individual tickets for each seat/person
            for (const item of bookingItemsToCreate) {
                // Only create tickets for Ticket Tiers (skip Add-ons)
                if (item.ticketTierId) {
                    for (let i = 0; i < item.quantity; i++) {
                        ticketsToCreate.push({
                            ticketType: 'INDIVIDUAL',
                            qrToken: generateQRToken(),
                            totalPersons: 1,
                            seatId: item.seatId || null,
                            status: 'VALID',
                        })
                    }
                }
            }
        } else {
            // Legacy Flow: One group ticket only
            ticketsToCreate.push({
                ticketType: 'GROUP',
                qrToken: generateQRToken(),
                totalPersons: totalPersons,
                checkedInCount: 0,
                status: 'VALID',
            })
        }

        // Create booking
        const bookingNumber = generateBookingNumber()
        // const qrToken = generateQRToken() // No longer needed as global variable

        const booking = await prisma.booking.create({
            data: {
                bookingNumber,
                eventId: validatedData.eventId,
                // store legacy counts if available, for backward compat in UI
                adultCount: validatedData.adultCount,
                childCount: validatedData.childCount,
                vipCount: validatedData.vipCount || 0,

                guestEmail: validatedData.guestEmail,
                guestPhone: validatedData.guestPhone,
                guestName: validatedData.guestName,

                subtotal,
                serviceFee,
                tax,
                total,
                status: 'PENDING',
                paymentStatus: 'PENDING',

                items: {
                    create: bookingItemsToCreate
                },

                tickets: {
                    create: ticketsToCreate
                },
            },
            include: { tickets: true },
        })

        // Create Stripe checkout session
        const lineItems = []

        // Add tickets/items to Stripe
        if (bookingItemsToCreate.length > 0) {
            // We group by item for clean stripe display
            for (const item of bookingItemsToCreate) {
                const name = item.ticketTierId
                    ? event.ticketTiers.find(t => t.id === item.ticketTierId)?.name
                    : event.addOns.find(a => a.id === item.addOnId)?.name

                lineItems.push({
                    price_data: {
                        currency: 'eur',
                        product_data: { name: name || 'Item' },
                        unit_amount: Math.round(Number(item.unitPrice) * 100),
                    },
                    quantity: item.quantity,
                })
            }
        } else {
            // Legacy Stripe Item
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: event.title,
                        description: `${validatedData.adultCount} Adult, ${validatedData.childCount} Child, ${validatedData.vipCount} VIP`,
                    },
                    unit_amount: Math.round(total * 100), // Note: This lumps tax/fee in legacy mode usually, or we should verify logic. 
                    // Previous logic calculated unit_amount as total * 100 and quantity 1.
                },
                quantity: 1,
            })
        }

        // If using itemized stripe items, we need to add Tax/Service Fee as separate line items or include in price?
        // To match previous logic (total * 100), we'll do simplistic approach:
        // Actually, Stripe creates a "Total" charge. 
        // Previous logic: unit_amount = total * 100.
        // My new logic: sum of items * price. This ignores tax/service fee.

        // CORRECTION: Let's simply charge the TOTAL amount as one line item for now to avoid tax calc mismatches in Stripe vs DB
        // unless we clearly separate them. 
        // For simplicity in this phase, I will stick to the "One Line Item for Total" approach 
        // OR add Service Fee/Tax as items.

        const summaryDescription = bookingItemsToCreate.length > 0
            ? 'Event Tickets & Add-ons'
            : `${validatedData.adultCount} Adult(s), ${validatedData.childCount} Child(ren)`

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: event.title,
                            description: summaryDescription
                        },
                        unit_amount: Math.round(total * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?booking_id=${booking.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`,
            metadata: {
                bookingId: booking.id,
                bookingNumber: booking.bookingNumber,
            },
        })

        // Update booking with payment intent
        await prisma.booking.update({
            where: { id: booking.id },
            data: { paymentIntentId: session.id },
        })

        return NextResponse.json({
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            total,
            paymentUrl: session.url,
        })
    } catch (error) {
        console.error('Error creating booking:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
        }
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create booking' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const bookingId = searchParams.get('id')
        const bookingNumber = searchParams.get('number')

        if (!bookingId && !bookingNumber) {
            return NextResponse.json(
                { error: 'Booking ID or number is required' },
                { status: 400 }
            )
        }

        const booking = await prisma.booking.findFirst({
            where: bookingId ? { id: bookingId } : { bookingNumber: bookingNumber! },
            include: {
                event: true,
                tickets: true,
                items: {
                    include: {
                        ticketTier: true,
                        addOn: true,
                    }
                },
            },
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        return NextResponse.json({
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            event: {
                id: booking.event.id,
                title: booking.event.title,
                eventDate: booking.event.eventDate,
                startTime: booking.event.startTime,
                venueName: booking.event.venueName,
                venueAddress: booking.event.venueAddress,
            },
            adultCount: booking.adultCount,
            childCount: booking.childCount,
            subtotal: Number(booking.subtotal),
            serviceFee: Number(booking.serviceFee),
            tax: Number(booking.tax),
            total: Number(booking.total),
            tickets: booking.tickets.map((t) => ({
                id: t.id,
                type: t.ticketType,
                totalPersons: t.totalPersons,
                checkedInCount: t.checkedInCount,
                qrToken: t.qrToken,
                status: t.status,
                seatId: t.seatId,
            })),
            items: booking.items.map((item) => ({
                id: item.id,
                ticketTierId: item.ticketTierId,
                addOnId: item.addOnId,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                totalPrice: Number(item.totalPrice),
                seatId: item.seatId,
                ticketTier: item.ticketTier ? { name: item.ticketTier.name } : null,
                addOn: item.addOn ? { name: item.addOn.name } : null,
            })),
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            createdAt: booking.createdAt,
            paidAt: booking.paidAt,
        })
    } catch (error) {
        console.error('Error fetching booking:', error)
        return NextResponse.json(
            { error: 'Failed to fetch booking' },
            { status: 500 }
        )
    }
}
