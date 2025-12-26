import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkInSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { qrToken, personsEntering } = checkInSchema.parse(body)

        // Get session for staff user (optional)
        const session = await getServerSession(authOptions)
        const staffUserId = session?.user?.id

        // Find ticket by QR token
        const ticket = await prisma.ticket.findUnique({
            where: { qrToken },
            include: {
                booking: {
                    include: {
                        event: true,
                        tickets: true, // Include all tickets for this booking
                    },
                },
            },
        })

        if (!ticket) {
            return NextResponse.json(
                { error: 'INVALID_QR', message: 'Invalid or expired ticket' },
                { status: 404 }
            )
        }

        // Check booking status
        if (ticket.booking.status === 'CANCELLED') {
            return NextResponse.json(
                {
                    error: 'BOOKING_CANCELLED',
                    message: 'This booking has been cancelled',
                },
                { status: 403 }
            )
        }

        if (ticket.booking.status === 'REFUNDED') {
            return NextResponse.json(
                {
                    error: 'BOOKING_REFUNDED',
                    message: 'This booking has been refunded and is not valid for entry',
                },
                { status: 403 }
            )
        }

        if (ticket.booking.status !== 'CONFIRMED') {
            return NextResponse.json(
                {
                    error: 'BOOKING_NOT_CONFIRMED',
                    message: 'This booking has not been confirmed yet',
                },
                { status: 403 }
            )
        }

        // Check if this is a MASTER/GROUP ticket
        const isMasterTicket = ticket.ticketType === 'GROUP'

        if (isMasterTicket) {
            // MASTER TICKET: Check in all persons at once
            // Calculate total remaining across ALL tickets in the booking
            const allTickets = ticket.booking.tickets
            const individualTickets = allTickets.filter(t => t.ticketType === 'INDIVIDUAL')
            const masterTicket = allTickets.find(t => t.ticketType === 'GROUP')

            // Count how many individuals have already checked in
            const individualsCheckedIn = individualTickets.filter(t => t.status === 'USED' || t.checkedInCount >= t.totalPersons).length
            const totalIndividuals = individualTickets.length
            const remainingIndividuals = totalIndividuals - individualsCheckedIn

            // If master ticket is already fully used
            if (masterTicket && masterTicket.status === 'USED' && masterTicket.checkedInCount >= masterTicket.totalPersons) {
                return NextResponse.json(
                    {
                        error: 'FULLY_CHECKED_IN',
                        message: 'All persons for this booking have already checked in via master ticket',
                        checkedIn: masterTicket.checkedInCount,
                        total: masterTicket.totalPersons,
                    },
                    { status: 410 }
                )
            }

            // Check how many to check in
            const personsToCheckIn = personsEntering || remainingIndividuals || ticket.totalPersons - ticket.checkedInCount

            // Perform master check-in: update master ticket AND all individual tickets
            const operations: any[] = []

            // Update master ticket
            const newMasterCheckedIn = Math.min(ticket.checkedInCount + personsToCheckIn, ticket.totalPersons)
            const isMasterComplete = newMasterCheckedIn >= ticket.totalPersons

            operations.push(
                prisma.ticket.update({
                    where: { id: ticket.id },
                    data: {
                        checkedInCount: newMasterCheckedIn,
                        status: isMasterComplete ? 'USED' : 'VALID',
                    },
                })
            )

            // Also mark individual tickets as checked in (up to personsToCheckIn)
            let individualsToUpdate = personsToCheckIn
            for (const indTicket of individualTickets) {
                if (individualsToUpdate <= 0) break
                if (indTicket.status !== 'USED' && indTicket.checkedInCount < indTicket.totalPersons) {
                    operations.push(
                        prisma.ticket.update({
                            where: { id: indTicket.id },
                            data: {
                                checkedInCount: indTicket.totalPersons,
                                status: 'USED',
                            },
                        })
                    )
                    individualsToUpdate--
                }
            }

            // Create check-in record
            operations.push(
                prisma.checkIn.create({
                    data: {
                        ticketId: ticket.id,
                        staffUserId,
                        personsEntered: personsToCheckIn,
                    },
                })
            )

            await prisma.$transaction(operations)

            return NextResponse.json({
                success: true,
                isMasterTicket: true,
                booking: {
                    bookingNumber: ticket.booking.bookingNumber,
                    guestName: ticket.booking.guestName,
                    eventTitle: ticket.booking.event.title,
                },
                ticket: {
                    type: 'MASTER',
                    totalPersons: ticket.totalPersons,
                    previouslyCheckedIn: ticket.checkedInCount,
                    nowCheckedIn: newMasterCheckedIn,
                    remaining: ticket.totalPersons - newMasterCheckedIn,
                    status: isMasterComplete ? 'completed' : 'partial',
                },
                message: `✅ Master ticket scanned! ${personsToCheckIn} person(s) checked in.`,
            })
        }

        // INDIVIDUAL TICKET: Standard check-in for one person
        if (ticket.status === 'USED' || ticket.checkedInCount >= ticket.totalPersons) {
            return NextResponse.json(
                {
                    error: 'ALREADY_CHECKED_IN',
                    message: 'This individual ticket has already been used',
                    seatId: ticket.seatId,
                },
                { status: 410 }
            )
        }

        // Perform individual check-in
        const newCheckedInCount = ticket.checkedInCount + 1
        const isComplete = newCheckedInCount >= ticket.totalPersons

        const [updatedTicket] = await prisma.$transaction([
            prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    checkedInCount: newCheckedInCount,
                    status: isComplete ? 'USED' : 'VALID',
                },
            }),
            prisma.checkIn.create({
                data: {
                    ticketId: ticket.id,
                    staffUserId,
                    personsEntered: 1,
                },
            }),
        ])

        return NextResponse.json({
            success: true,
            isMasterTicket: false,
            booking: {
                bookingNumber: ticket.booking.bookingNumber,
                guestName: ticket.booking.guestName,
                eventTitle: ticket.booking.event.title,
            },
            ticket: {
                type: 'INDIVIDUAL',
                seatId: ticket.seatId,
                totalPersons: ticket.totalPersons,
                previouslyCheckedIn: ticket.checkedInCount,
                nowCheckedIn: newCheckedInCount,
                remaining: ticket.totalPersons - newCheckedInCount,
                status: isComplete ? 'completed' : 'partial',
            },
        })
    } catch (error) {
        console.error('Check-in error:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
        }
        return NextResponse.json(
            { error: 'Check-in failed' },
            { status: 500 }
        )
    }
}
