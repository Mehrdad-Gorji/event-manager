import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice } from '@/lib/utils'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('eventId')
        const format = searchParams.get('format') || 'json' // json or csv

        const where: any = {}
        if (eventId) where.eventId = eventId

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                event: {
                    select: { title: true, eventDate: true, venueName: true }
                },
                tickets: true,
                items: {
                    include: {
                        ticketTier: true,
                        addOn: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        if (format === 'csv') {
            // Generate CSV
            const headers = [
                'Booking Number',
                'Event',
                'Event Date',
                'Guest Name',
                'Guest Email',
                'Guest Phone',
                'Adults',
                'Children',
                'VIP',
                'Subtotal',
                'Service Fee',
                'Tax',
                'Total',
                'Payment Status',
                'Booking Status',
                'Created At'
            ]

            const rows = bookings.map(b => [
                b.bookingNumber,
                b.event.title,
                formatDate(b.event.eventDate.toISOString()),
                b.guestName || '',
                b.guestEmail || '',
                b.guestPhone || '',
                b.adultCount,
                b.childCount,
                b.vipCount,
                Number(b.subtotal).toFixed(2),
                Number(b.serviceFee).toFixed(2),
                Number(b.tax).toFixed(2),
                Number(b.total).toFixed(2),
                b.paymentStatus,
                b.status,
                formatDate(b.createdAt.toISOString())
            ])

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n')

            return new Response(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="bookings-export-${Date.now()}.csv"`
                }
            })
        }

        // Return JSON by default
        return NextResponse.json({
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((sum, b) => sum + Number(b.total), 0),
            exportDate: new Date().toISOString(),
            bookings: bookings.map(b => ({
                bookingNumber: b.bookingNumber,
                event: b.event.title,
                eventDate: b.event.eventDate,
                venue: b.event.venueName,
                guest: {
                    name: b.guestName,
                    email: b.guestEmail,
                    phone: b.guestPhone
                },
                tickets: {
                    adult: b.adultCount,
                    child: b.childCount,
                    vip: b.vipCount
                },
                ticketDetails: b.tickets.map(t => ({
                    qrToken: t.qrToken,
                    type: t.ticketType,
                    persons: t.totalPersons,
                    checkedIn: t.checkedInCount,
                    status: t.status
                })),
                items: b.items.map(i => ({
                    name: i.ticketTier?.name || i.addOn?.name || 'Item',
                    quantity: i.quantity,
                    unitPrice: Number(i.unitPrice),
                    totalPrice: Number(i.totalPrice)
                })),
                pricing: {
                    subtotal: Number(b.subtotal),
                    serviceFee: Number(b.serviceFee),
                    tax: Number(b.tax),
                    total: Number(b.total)
                },
                paymentStatus: b.paymentStatus,
                status: b.status,
                createdAt: b.createdAt
            }))
        })
    } catch (error) {
        console.error('Error exporting bookings:', error)
        return NextResponse.json({ error: 'Failed to export bookings' }, { status: 500 })
    }
}
