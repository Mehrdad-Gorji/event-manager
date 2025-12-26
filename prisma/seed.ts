import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
    console.log('🌱 Seeding database...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@eventbook.com' },
        update: {},
        create: {
            email: 'admin@eventbook.com',
            name: 'Admin User',
            passwordHash: adminPassword,
            role: 'ADMIN',
            isActive: true,
        },
    })
    console.log('✅ Admin user created:', admin.email)

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 10)
    const staff = await prisma.user.upsert({
        where: { email: 'staff@eventbook.com' },
        update: {},
        create: {
            email: 'staff@eventbook.com',
            name: 'Staff Member',
            passwordHash: staffPassword,
            role: 'STAFF',
            isActive: true,
        },
    })
    console.log('✅ Staff user created:', staff.email)

    // Create sample events
    const events = [
        {
            title: 'New Year Gala 2025',
            description: 'Ring in the new year with an unforgettable evening of fine dining, live music, and dancing.',
            rules: 'Dress code: Black tie or formal attire. No outside food or beverages.',
            eventDate: new Date('2025-12-31'),
            startTime: '20:00',
            endTime: '02:00',
            doorsOpenTime: '19:30',
            maxCapacity: 300,
            adultPrice: 150,
            childPrice: 75,
            serviceFeePercent: 5,
            taxPercent: 10,
            venueName: 'Grand Ballroom',
            venueAddress: '123 Elegance Avenue, Downtown',
            status: 'PUBLISHED' as const,
            reEntryAllowed: false,
        },
        {
            title: 'Jazz Night Under the Stars',
            description: 'An enchanting evening of smooth jazz performances in our beautiful outdoor garden venue.',
            eventDate: new Date('2025-02-14'),
            startTime: '19:00',
            endTime: '23:00',
            doorsOpenTime: '18:30',
            maxCapacity: 150,
            adultPrice: 80,
            childPrice: null,
            serviceFeePercent: 5,
            taxPercent: 10,
            venueName: 'Garden Terrace',
            venueAddress: '456 Melody Lane',
            status: 'PUBLISHED' as const,
            reEntryAllowed: true,
        },
    ]

    for (const eventData of events) {
        const event = await prisma.event.create({
            data: eventData,
        })
        console.log('✅ Event created:', event.title)
    }

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
