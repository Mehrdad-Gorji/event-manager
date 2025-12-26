import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30' // days
        const eventId = searchParams.get('eventId')

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        // Build where clause
        const where: any = {
            createdAt: { gte: startDate },
            paymentStatus: 'PAID'
        }
        if (eventId) where.eventId = eventId

        // Get all bookings in period
        const bookings = await prisma.booking.findMany({
            where,
            include: {
                event: {
                    select: { id: true, title: true }
                },
                items: {
                    include: {
                        ticketTier: true,
                        addOn: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        // Calculate summary statistics
        const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total), 0)
        const totalBookings = bookings.length
        const totalTickets = bookings.reduce((sum, b) => sum + b.adultCount + b.childCount + b.vipCount, 0)
        const averageOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

        // Revenue by day
        const revenueByDay: { [date: string]: number } = {}
        const bookingsByDay: { [date: string]: number } = {}

        bookings.forEach(booking => {
            const date = booking.createdAt.toISOString().split('T')[0]
            revenueByDay[date] = (revenueByDay[date] || 0) + Number(booking.total)
            bookingsByDay[date] = (bookingsByDay[date] || 0) + 1
        })

        // Fill in missing days
        const dailyData = []
        const currentDate = new Date(startDate)
        while (currentDate <= new Date()) {
            const dateStr = currentDate.toISOString().split('T')[0]
            dailyData.push({
                date: dateStr,
                revenue: revenueByDay[dateStr] || 0,
                bookings: bookingsByDay[dateStr] || 0
            })
            currentDate.setDate(currentDate.getDate() + 1)
        }

        // Revenue by event
        const revenueByEvent: { [eventId: string]: { title: string, revenue: number, bookings: number } } = {}
        bookings.forEach(booking => {
            if (!revenueByEvent[booking.eventId]) {
                revenueByEvent[booking.eventId] = {
                    title: booking.event.title,
                    revenue: 0,
                    bookings: 0
                }
            }
            revenueByEvent[booking.eventId].revenue += Number(booking.total)
            revenueByEvent[booking.eventId].bookings += 1
        })

        const topEvents = Object.entries(revenueByEvent)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        // Revenue by ticket tier
        const revenueByTier: { [name: string]: number } = {}
        bookings.forEach(booking => {
            booking.items.forEach(item => {
                if (item.ticketTier) {
                    const tierName = item.ticketTier.name
                    revenueByTier[tierName] = (revenueByTier[tierName] || 0) + Number(item.totalPrice)
                }
            })
        })

        const tierBreakdown = Object.entries(revenueByTier)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue)

        // Add-on sales
        const addOnSales: { [name: string]: { quantity: number, revenue: number } } = {}
        bookings.forEach(booking => {
            booking.items.forEach(item => {
                if (item.addOn) {
                    const addOnName = item.addOn.name
                    if (!addOnSales[addOnName]) {
                        addOnSales[addOnName] = { quantity: 0, revenue: 0 }
                    }
                    addOnSales[addOnName].quantity += item.quantity
                    addOnSales[addOnName].revenue += Number(item.totalPrice)
                }
            })
        })

        const addOnBreakdown = Object.entries(addOnSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)

        // Recent bookings
        const recentBookings = bookings.slice(-10).reverse().map(b => ({
            id: b.id,
            bookingNumber: b.bookingNumber,
            eventTitle: b.event.title,
            total: Number(b.total),
            createdAt: b.createdAt
        }))

        return NextResponse.json({
            summary: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalBookings,
                totalTickets,
                averageOrderValue: Math.round(averageOrderValue * 100) / 100,
                period: parseInt(period)
            },
            dailyData,
            topEvents,
            tierBreakdown,
            addOnBreakdown,
            recentBookings
        })
    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
