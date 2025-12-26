import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        const ticket = await prisma.ticket.findUnique({
            where: { qrToken: token },
            include: {
                booking: {
                    select: {
                        bookingNumber: true,
                        status: true,
                        guestName: true,
                    },
                },
                checkIns: {
                    orderBy: { scannedAt: 'desc' },
                    include: {
                        staffUser: {
                            select: { name: true },
                        },
                    },
                },
            },
        })

        if (!ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            booking: {
                bookingNumber: ticket.booking.bookingNumber,
                status: ticket.booking.status,
                guestName: ticket.booking.guestName,
            },
            totalPersons: ticket.totalPersons,
            checkedInCount: ticket.checkedInCount,
            remaining: ticket.totalPersons - ticket.checkedInCount,
            ticketStatus: ticket.status,
            checkInHistory: ticket.checkIns.map((c) => ({
                time: c.scannedAt,
                count: c.personsEntered,
                staffName: c.staffUser?.name || 'Unknown',
                isCorrection: c.isCorrection,
            })),
        })
    } catch (error) {
        console.error('Error fetching check-in status:', error)
        return NextResponse.json(
            { error: 'Failed to fetch status' },
            { status: 500 }
        )
    }
}
