// Test script to create a booking with Master Ticket
import { PrismaClient, TicketType, TicketStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function createBookingWithMasterTicket() {
    const eventId = 'cmjl6o5im0000bzvrpp1dve5t'

    // Get event with ticket tiers
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

    console.log('Creating booking with Master Ticket...\n')

    const vipTier = event.ticketTiers.find(t => t.name.includes('VIP'))

    if (!vipTier) {
        console.error('VIP Tier not found!')
        return
    }

    // Create booking for VIP Table 2
    const bookingNumber = `EVT-MASTER-TEST`
    const seats = [
        'vip-t2-s1', 'vip-t2-s2', 'vip-t2-s3', 'vip-t2-s4'
    ]

    const totalPersons = seats.length
    const subtotal = totalPersons * Number(vipTier.price)
    const serviceFee = (subtotal * 5) / 100
    const tax = ((subtotal + serviceFee) * 19) / 100
    const total = subtotal + serviceFee + tax

    // Create tickets - FIRST is Master Ticket, then Individual tickets
    const ticketsData = [
        // Master Ticket
        {
            ticketType: TicketType.GROUP,
            qrToken: `MASTER-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            totalPersons: totalPersons,
            checkedInCount: 0,
            seatId: null, // Master has no specific seat
            status: TicketStatus.VALID
        },
        // Individual Tickets
        ...seats.map(seatId => ({
            ticketType: TicketType.INDIVIDUAL,
            qrToken: `IND-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            totalPersons: 1,
            checkedInCount: 0,
            seatId: seatId,
            status: TicketStatus.VALID
        }))
    ]

    const booking = await prisma.booking.create({
        data: {
            bookingNumber,
            eventId,
            adultCount: 0,
            childCount: 0,
            vipCount: 0,
            guestEmail: 'master.test@example.com',
            guestPhone: '+49 555 555555',
            guestName: 'Test Family with Master',
            subtotal,
            serviceFee,
            tax,
            total,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paidAt: new Date(),
            items: {
                create: seats.map(seatId => ({
                    ticketTierId: vipTier.id,
                    quantity: 1,
                    unitPrice: vipTier.price,
                    totalPrice: Number(vipTier.price),
                    seatId
                }))
            },
            tickets: {
                create: ticketsData
            }
        },
        include: { tickets: true, items: true }
    })

    console.log(`✅ Booking Created: ${booking.bookingNumber}`)
    console.log(`   Guest: Test Family with Master`)
    console.log(`   Total: €${Number(booking.total).toFixed(2)}`)
    console.log('')
    console.log('📋 Tickets:')
    booking.tickets.forEach((t, i) => {
        if (t.ticketType === 'GROUP') {
            console.log(`   👑 MASTER TICKET: ${t.qrToken}`)
            console.log(`      Can check in: ${t.totalPersons} persons`)
        } else {
            console.log(`   🎫 Individual #${i}: ${t.qrToken}`)
            console.log(`      Seat: ${t.seatId}`)
        }
    })
    console.log('')
    console.log(`View at: http://localhost:3000/my-bookings?number=${booking.bookingNumber}`)

    await prisma.$disconnect()
}

createBookingWithMasterTicket()
    .catch(console.error)
    .finally(() => process.exit())
