
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Phase 1 Verification...')

    // 1. Clean up potential previous test data
    const testEmail = 'test-phase1@example.com'
    await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => { })
    // We won't delete events blindly to avoid wiping user data, but we'll create a unique one.

    // 2. Create Event with Tiers and Add-ons
    console.log('📦 Creating Test Event with Tiers and Add-ons...')
    const event = await prisma.event.create({
        data: {
            title: 'Phase 1 Test Event',
            description: 'Testing dynamic pricing',
            eventDate: new Date(),
            startTime: '18:00',
            venueName: 'Test Venue',
            maxCapacity: 100,
            status: 'PUBLISHED',
            adultPrice: 10, // Legacy fallback

            // Phase 1 Features
            ticketTiers: {
                create: [
                    { name: 'VIP Test', price: 50, capacity: 10 },
                    { name: 'General Test', price: 20, capacity: 50 }
                ]
            },
            addOns: {
                create: [
                    { name: 'Parking Test', price: 15, stock: 20 },
                    { name: 'Meal Test', price: 25 }
                ]
            }
        },
        include: {
            ticketTiers: true,
            addOns: true
        }
    })

    console.log(`✅ Event Created: ${event.id}`)
    console.log(`   - Tiers: ${event.ticketTiers.length}`)
    console.log(`   - Add-ons: ${event.addOns.length}`)

    // 3. Create a Booking with Items
    console.log('🎫 Creating Booking with Phase 1 Items...')

    const vipTier = event.ticketTiers.find(t => t.name === 'VIP Test')!
    const parkingAddon = event.addOns.find(a => a.name === 'Parking Test')!

    const booking = await prisma.booking.create({
        data: {
            bookingNumber: `TEST-${Date.now()}`,
            eventId: event.id,
            guestName: 'Test User',
            guestEmail: testEmail,
            status: 'CONFIRMED',
            subtotal: 0, // Simplified for test
            total: 0,
            items: {
                create: [
                    {
                        ticketTierId: vipTier.id,
                        quantity: 2,
                        unitPrice: vipTier.price,
                        totalPrice: Number(vipTier.price) * 2
                    },
                    {
                        addOnId: parkingAddon.id,
                        quantity: 1,
                        unitPrice: parkingAddon.price,
                        totalPrice: Number(parkingAddon.price) * 1
                    }
                ]
            }
        },
        include: {
            items: true
        }
    })

    console.log(`✅ Booking Created: ${booking.id}`)
    console.log(`   - Items: ${booking.items.length}`)
    const tierItem = booking.items.find(i => i.ticketTierId === vipTier.id)
    const addonItem = booking.items.find(i => i.addOnId === parkingAddon.id)

    if (tierItem && addonItem) {
        console.log('✅ Booking Items Verified correctly linked.')
    } else {
        console.error('❌ Failed to link Booking Items!')
        process.exit(1)
    }

    // 4. Cleanup
    console.log('🧹 Cleaning up test data...')
    await prisma.bookingItem.deleteMany({ where: { bookingId: booking.id } })
    await prisma.booking.delete({ where: { id: booking.id } })
    await prisma.ticketTier.deleteMany({ where: { eventId: event.id } })
    await prisma.eventAddOn.deleteMany({ where: { eventId: event.id } })
    await prisma.event.delete({ where: { id: event.id } })

    console.log('✨ Phase 1 Verification Successful!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
