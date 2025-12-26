// Test script to create a booking directly in the database
import { PrismaClient, TicketType, TicketStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestBooking() {
    const eventId = 'cmjl6o5im0000bzvrpp1dve5t'

    // Get event with ticket tiers and addons
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            ticketTiers: true,
            addOns: true
        }
    })

    if (!event) {
        console.error('Event not found!')
        return
    }

    console.log('Event:', event.title)
    console.log('Ticket Tiers:', event.ticketTiers.map(t => ({ id: t.id, name: t.name, price: Number(t.price) })))
    console.log('Add-ons:', event.addOns.map(a => ({ id: a.id, name: a.name, price: Number(a.price) })))

    // Find tier IDs
    const vipTier = event.ticketTiers.find(t => t.name.includes('VIP'))
    const regularTier = event.ticketTiers.find(t => t.name.includes('Regular'))
    const child6to12 = event.ticketTiers.find(t => t.name.includes('6-12'))
    const child3to5 = event.ticketTiers.find(t => t.name.includes('3-5'))
    const infant = event.ticketTiers.find(t => t.name.includes('Infant'))

    const parkingAddon = event.addOns.find(a => a.name.includes('Parking'))
    const dogAddon = event.addOns.find(a => a.name.includes('Dog'))
    const dinnerAddon = event.addOns.find(a => a.name.includes('Dinner'))

    // Calculate totals
    const items = [
        { tier: vipTier, quantity: 2, seatId: 'vip-table-1' },
        { tier: regularTier, quantity: 3, seatId: 'table-1' },
        { tier: child6to12, quantity: 2, seatId: null },
        { tier: child3to5, quantity: 1, seatId: null },
        { tier: infant, quantity: 1, seatId: null },
    ]

    const addons = [
        { addon: parkingAddon, quantity: 2 },
        { addon: dogAddon, quantity: 1 },
        { addon: dinnerAddon, quantity: 1 },
    ]

    let subtotal = 0
    const bookingItems: any[] = []

    for (const item of items) {
        if (item.tier) {
            const price = Number(item.tier.price)
            subtotal += price * item.quantity
            bookingItems.push({
                ticketTierId: item.tier.id,
                quantity: item.quantity,
                unitPrice: item.tier.price,
                totalPrice: price * item.quantity,
                seatId: item.seatId
            })
        }
    }

    for (const item of addons) {
        if (item.addon) {
            const price = Number(item.addon.price)
            subtotal += price * item.quantity
            bookingItems.push({
                addOnId: item.addon.id,
                quantity: item.quantity,
                unitPrice: item.addon.price,
                totalPrice: price * item.quantity
            })
        }
    }

    const serviceFee = (subtotal * 5) / 100  // 5%
    const tax = ((subtotal + serviceFee) * 19) / 100  // 19%
    const total = subtotal + serviceFee + tax

    console.log('\n--- Booking Summary ---')
    console.log('Subtotal:', subtotal)
    console.log('Service Fee (5%):', serviceFee)
    console.log('Tax (19%):', tax)
    console.log('Total:', total)

    // Generate booking number and QR tokens
    const bookingNumber = `EVT-${Date.now().toString(36).toUpperCase()}`

    const ticketsToCreate: {
        ticketType: TicketType;
        qrToken: string;
        totalPersons: number;
        seatId: string | null;
        status: TicketStatus;
    }[] = []

    for (const item of items) {
        if (item.tier) {
            for (let i = 0; i < item.quantity; i++) {
                ticketsToCreate.push({
                    ticketType: TicketType.INDIVIDUAL,
                    qrToken: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    totalPersons: 1,
                    seatId: item.seatId,
                    status: TicketStatus.VALID
                })
            }
        }
    }

    // Create booking
    const booking = await prisma.booking.create({
        data: {
            bookingNumber,
            eventId,
            adultCount: 0,
            childCount: 0,
            vipCount: 0,
            guestEmail: 'max.mustermann@example.com',
            guestPhone: '+49 123 456789',
            guestName: 'Max Mustermann',
            subtotal,
            serviceFee,
            tax,
            total,
            status: 'CONFIRMED',  // Mark as confirmed for testing
            paymentStatus: 'PAID',  // Mark as paid for testing
            paidAt: new Date(),
            items: {
                create: bookingItems
            },
            tickets: {
                create: ticketsToCreate
            }
        },
        include: {
            tickets: true,
            items: true
        }
    })

    console.log('\n✅ Booking Created Successfully!')
    console.log('Booking Number:', booking.bookingNumber)
    console.log('Booking ID:', booking.id)
    console.log('Total Amount: €' + Number(booking.total).toFixed(2))
    console.log('\n--- Tickets with QR Codes (Barcodes) ---')
    booking.tickets.forEach((ticket: any, index: number) => {
        console.log(`Ticket ${index + 1}: ${ticket.qrToken} (Seat: ${ticket.seatId || 'General'})`)
    })

    console.log('\n--- Booking Items ---')
    for (const item of booking.items) {
        if (item.ticketTierId) {
            const tier = event.ticketTiers.find(t => t.id === item.ticketTierId)
            console.log(`- ${tier?.name}: ${item.quantity} x €${Number(item.unitPrice).toFixed(2)} = €${Number(item.totalPrice).toFixed(2)}`)
        } else if (item.addOnId) {
            const addon = event.addOns.find(a => a.id === item.addOnId)
            console.log(`- ${addon?.name}: ${item.quantity} x €${Number(item.unitPrice).toFixed(2)} = €${Number(item.totalPrice).toFixed(2)}`)
        }
    }

    console.log('\n🎫 These QR codes can be used for check-in at the event!')

    await prisma.$disconnect()
}

createTestBooking()
    .catch(console.error)
    .finally(() => process.exit())
