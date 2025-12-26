
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Starting E2E Booking Verification ---')

    // 1. Setup: Find the Layout
    const layout = await prisma.venueLayout.findFirst({
        where: { name: 'Grand Ballroom (500 Seats)' }
    })

    if (!layout) {
        console.error('Error: Layout "Grand Ballroom (500 Seats)" not found. Run seed-large-venue.ts first.')
        process.exit(1)
    }
    console.log('✅ Found Layout:', layout.name)

    // 2. Setup: Create Logic Event
    // We cleanup previous test events first
    await prisma.event.deleteMany({ where: { title: 'E2E Stress Test Event' } })

    const event = await prisma.event.create({
        data: {
            title: 'E2E Stress Test Event',
            venueName: 'Grand Hotel',
            eventDate: new Date(Date.now() + 86400000), // Tomorrow
            startTime: '19:00',
            maxCapacity: 500,
            adultPrice: 0,
            status: 'PUBLISHED',
            venueLayoutId: layout.id,
            ticketTiers: {
                create: [
                    { name: 'VIP Gold', price: 200, sectionMatcher: 'VIP' },
                    { name: 'Standard', price: 50, sectionMatcher: 'General' }
                ]
            }
        },
        include: { ticketTiers: true }
    })
    console.log('✅ Created Event:', event.title)

    // 3. Select Seats
    // We need to look at layout.elements (JSON) to find valid IDs
    const elements = layout.elements as any[]
    const vipSeats = elements.filter(e => e.type === 'seat' && e.section === 'VIP')
    const generalSeats = elements.filter(e => e.type === 'seat' && e.section === 'General')

    if (vipSeats.length < 2 || generalSeats.length < 3) {
        console.error('Not enough seats in layout for test.')
        process.exit(1)
    }

    const selectedVip = vipSeats.slice(0, 2)
    const selectedGen = generalSeats.slice(0, 3)
    const allSelected = [...selectedVip, ...selectedGen]

    console.log(`✅ Selected ${selectedVip.length} VIP seats and ${selectedGen.length} General seats`)

    // 4. Construct Booking API Payload
    const vipTier = event.ticketTiers.find(t => t.name === 'VIP Gold')!
    const genTier = event.ticketTiers.find(t => t.name === 'Standard')!

    const items = []

    // Add VIP items
    for (const seat of selectedVip) {
        items.push({
            ticketTierId: vipTier.id,
            quantity: 1,
            seatId: seat.id
        })
    }
    // Add General items
    for (const seat of selectedGen) {
        items.push({
            ticketTierId: genTier.id,
            quantity: 1,
            seatId: seat.id
        })
    }

    const payload = {
        eventId: event.id,
        guestName: 'Test User',
        guestEmail: 'test@example.com',
        adultCount: 5,
        childCount: 0,
        items: items
    }

    console.log('🚀 Sending Booking Request...')

    // Using fetch to localhost
    // Note: ensure server is running on port 3000
    try {
        const res = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await res.json()

        if (!res.ok) {
            console.error('❌ Booking Failed:', JSON.stringify(data, null, 2))
            process.exit(1)
        }

        console.log('✅ Booking Successful! ID:', data.bookingId)

        // 5. Verify Tickets in DB
        const booking = await prisma.booking.findUnique({
            where: { id: data.bookingId },
            include: { tickets: true }
        })

        if (!booking) {
            console.error('❌ Booking not found in DB')
            process.exit(1)
        }

        console.log(`✅ Found ${booking.tickets.length} tickets in DB`)

        // Check Ticket Details
        let vipCount = 0
        let genCount = 0

        // We can check seat IDs against our selected list
        const bookedSeatIds = booking.tickets.map(t => t.seatId)

        for (const seat of selectedVip) {
            if (bookedSeatIds.includes(seat.id)) vipCount++
            else console.error(`❌ Missing ticket for VIP seat ${seat.id}`)
        }
        for (const seat of selectedGen) {
            if (bookedSeatIds.includes(seat.id)) genCount++
            else console.error(`❌ Missing ticket for General seat ${seat.id}`)
        }

        if (vipCount === 2 && genCount === 3) {
            console.log('✅ VERIFICATION PASSED: All 5 seats converted to individual tickets!')
        } else {
            console.error('❌ VERIFICATION FAILED: Ticket/Seat mismatch')
        }

    } catch (err) {
        console.error('❌ Network/Script Error:', err)
    } finally {
        await prisma.$disconnect()
    }
}

main()
