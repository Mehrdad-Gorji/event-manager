// Test script to create multiple bookings with shared tables
import { PrismaClient, TicketType, TicketStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function createMultipleBookings() {
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

    console.log('Creating bookings for shared table scenario...\n')

    const vipTier = event.ticketTiers.find(t => t.name.includes('VIP'))
    const regularTier = event.ticketTiers.find(t => t.name.includes('Regular'))
    const dinnerAddon = event.addOns.find(a => a.name.includes('Dinner'))

    if (!vipTier || !regularTier) {
        console.error('Tiers not found!')
        return
    }

    // === BOOKING 1: Family A - 5 seats at VIP Table 1 ===
    const booking1Number = `EVT-FAMILY-A`
    const booking1Items = [
        { seat: 'vip-t1-s1', tier: vipTier },
        { seat: 'vip-t1-s2', tier: vipTier },
        { seat: 'vip-t1-s3', tier: vipTier },
        { seat: 'vip-t1-s4', tier: vipTier },
        { seat: 'vip-t1-s5', tier: vipTier },
    ]

    let subtotal1 = booking1Items.length * Number(vipTier.price)
    const serviceFee1 = (subtotal1 * 5) / 100
    const tax1 = ((subtotal1 + serviceFee1) * 19) / 100
    const total1 = subtotal1 + serviceFee1 + tax1

    const booking1 = await prisma.booking.create({
        data: {
            bookingNumber: booking1Number,
            eventId,
            adultCount: 0,
            childCount: 0,
            vipCount: 0,
            guestEmail: 'family.a@example.com',
            guestPhone: '+49 111 111111',
            guestName: 'Schmidt Family',
            subtotal: subtotal1,
            serviceFee: serviceFee1,
            tax: tax1,
            total: total1,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paidAt: new Date(),
            items: {
                create: booking1Items.map(item => ({
                    ticketTierId: item.tier.id,
                    quantity: 1,
                    unitPrice: item.tier.price,
                    totalPrice: Number(item.tier.price),
                    seatId: item.seat
                }))
            },
            tickets: {
                create: booking1Items.map(item => ({
                    ticketType: TicketType.INDIVIDUAL,
                    qrToken: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    totalPersons: 1,
                    seatId: item.seat,
                    status: TicketStatus.VALID
                }))
            }
        },
        include: { tickets: true, items: true }
    })

    console.log(`✅ Booking 1 Created: ${booking1.bookingNumber}`)
    console.log(`   Guest: Schmidt Family`)
    console.log(`   Seats: VIP Table 1, Seats 1-5 (vip-t1-s1 to vip-t1-s5)`)
    console.log(`   Total: €${Number(booking1.total).toFixed(2)}`)
    console.log('')

    // === BOOKING 2: Couple B - 3 seats at VIP Table 1 (sharing with Family A) ===
    const booking2Number = `EVT-COUPLE-B`
    const booking2Items = [
        { seat: 'vip-t1-s6', tier: vipTier },
        { seat: 'vip-t1-s7', tier: vipTier },
        { seat: 'vip-t1-s8', tier: vipTier },
    ]

    let subtotal2 = booking2Items.length * Number(vipTier.price) + (dinnerAddon ? Number(dinnerAddon.price) * 3 : 0)
    const serviceFee2 = (subtotal2 * 5) / 100
    const tax2 = ((subtotal2 + serviceFee2) * 19) / 100
    const total2 = subtotal2 + serviceFee2 + tax2

    const booking2ItemsWithAddon = [
        ...booking2Items.map(item => ({
            ticketTierId: item.tier.id,
            quantity: 1,
            unitPrice: item.tier.price,
            totalPrice: Number(item.tier.price),
            seatId: item.seat
        })),
        ...(dinnerAddon ? [{
            addOnId: dinnerAddon.id,
            quantity: 3,
            unitPrice: dinnerAddon.price,
            totalPrice: Number(dinnerAddon.price) * 3
        }] : [])
    ]

    const booking2 = await prisma.booking.create({
        data: {
            bookingNumber: booking2Number,
            eventId,
            adultCount: 0,
            childCount: 0,
            vipCount: 0,
            guestEmail: 'couple.b@example.com',
            guestPhone: '+49 222 222222',
            guestName: 'Müller Couple',
            subtotal: subtotal2,
            serviceFee: serviceFee2,
            tax: tax2,
            total: total2,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paidAt: new Date(),
            items: {
                create: booking2ItemsWithAddon
            },
            tickets: {
                create: booking2Items.map(item => ({
                    ticketType: TicketType.INDIVIDUAL,
                    qrToken: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    totalPersons: 1,
                    seatId: item.seat,
                    status: TicketStatus.VALID
                }))
            }
        },
        include: { tickets: true, items: true }
    })

    console.log(`✅ Booking 2 Created: ${booking2.bookingNumber}`)
    console.log(`   Guest: Müller Couple`)
    console.log(`   Seats: VIP Table 1, Seats 6-8 (vip-t1-s6 to vip-t1-s8)`)
    console.log(`   Add-on: 3x Dinner Package`)
    console.log(`   Total: €${Number(booking2.total).toFixed(2)}`)
    console.log('')

    // === BOOKING 3: Group C - 4 seats at Regular Table 1 ===
    const booking3Number = `EVT-GROUP-C`
    const booking3Items = [
        { seat: 't1-s1', tier: regularTier },
        { seat: 't1-s2', tier: regularTier },
        { seat: 't1-s3', tier: regularTier },
        { seat: 't1-s4', tier: regularTier },
    ]

    let subtotal3 = booking3Items.length * Number(regularTier.price)
    const serviceFee3 = (subtotal3 * 5) / 100
    const tax3 = ((subtotal3 + serviceFee3) * 19) / 100
    const total3 = subtotal3 + serviceFee3 + tax3

    const booking3 = await prisma.booking.create({
        data: {
            bookingNumber: booking3Number,
            eventId,
            adultCount: 0,
            childCount: 0,
            vipCount: 0,
            guestEmail: 'group.c@example.com',
            guestPhone: '+49 333 333333',
            guestName: 'Weber Friends',
            subtotal: subtotal3,
            serviceFee: serviceFee3,
            tax: tax3,
            total: total3,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paidAt: new Date(),
            items: {
                create: booking3Items.map(item => ({
                    ticketTierId: item.tier.id,
                    quantity: 1,
                    unitPrice: item.tier.price,
                    totalPrice: Number(item.tier.price),
                    seatId: item.seat
                }))
            },
            tickets: {
                create: booking3Items.map(item => ({
                    ticketType: TicketType.INDIVIDUAL,
                    qrToken: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    totalPersons: 1,
                    seatId: item.seat,
                    status: TicketStatus.VALID
                }))
            }
        },
        include: { tickets: true, items: true }
    })

    console.log(`✅ Booking 3 Created: ${booking3.bookingNumber}`)
    console.log(`   Guest: Weber Friends`)
    console.log(`   Seats: Table 1, Seats 1-4 (t1-s1 to t1-s4)`)
    console.log(`   Total: €${Number(booking3.total).toFixed(2)}`)
    console.log('')

    // === BOOKING 4: Solo D - 2 seats at Regular Table 1 (remaining seats) ===
    const booking4Number = `EVT-SOLO-D`
    const booking4Items = [
        { seat: 't1-s5', tier: regularTier },
        { seat: 't1-s6', tier: regularTier },
    ]

    let subtotal4 = booking4Items.length * Number(regularTier.price)
    const serviceFee4 = (subtotal4 * 5) / 100
    const tax4 = ((subtotal4 + serviceFee4) * 19) / 100
    const total4 = subtotal4 + serviceFee4 + tax4

    const booking4 = await prisma.booking.create({
        data: {
            bookingNumber: booking4Number,
            eventId,
            adultCount: 0,
            childCount: 0,
            vipCount: 0,
            guestEmail: 'solo.d@example.com',
            guestPhone: '+49 444 444444',
            guestName: 'Hans Solo',
            subtotal: subtotal4,
            serviceFee: serviceFee4,
            tax: tax4,
            total: total4,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paidAt: new Date(),
            items: {
                create: booking4Items.map(item => ({
                    ticketTierId: item.tier.id,
                    quantity: 1,
                    unitPrice: item.tier.price,
                    totalPrice: Number(item.tier.price),
                    seatId: item.seat
                }))
            },
            tickets: {
                create: booking4Items.map(item => ({
                    ticketType: TicketType.INDIVIDUAL,
                    qrToken: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    totalPersons: 1,
                    seatId: item.seat,
                    status: TicketStatus.VALID
                }))
            }
        },
        include: { tickets: true, items: true }
    })

    console.log(`✅ Booking 4 Created: ${booking4.bookingNumber}`)
    console.log(`   Guest: Hans Solo`)
    console.log(`   Seats: Table 1, Seats 5-6 (t1-s5 to t1-s6)`)
    console.log(`   Total: €${Number(booking4.total).toFixed(2)}`)
    console.log('')

    // Summary
    console.log('='.repeat(50))
    console.log('SUMMARY: Shared Table Scenario')
    console.log('='.repeat(50))
    console.log('')
    console.log('VIP Table 1 (8 seats):')
    console.log('  - Seats 1-5: Schmidt Family (EVT-FAMILY-A)')
    console.log('  - Seats 6-8: Müller Couple (EVT-COUPLE-B)')
    console.log('')
    console.log('Regular Table 1 (6 seats):')
    console.log('  - Seats 1-4: Weber Friends (EVT-GROUP-C)')
    console.log('  - Seats 5-6: Hans Solo (EVT-SOLO-D)')
    console.log('')
    console.log('Now VIP Table 1 and Regular Table 1 are fully booked!')
    console.log('')

    // Get all booked seat IDs
    const allBookings = await prisma.booking.findMany({
        where: { eventId, status: 'CONFIRMED' },
        include: { tickets: true }
    })

    const bookedSeats = allBookings.flatMap(b => b.tickets.map(t => t.seatId).filter(Boolean))
    console.log('All booked seat IDs:', bookedSeats.join(', '))

    await prisma.$disconnect()
}

createMultipleBookings()
    .catch(console.error)
    .finally(() => process.exit())
