'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime } from '@/lib/utils'
import { HiDownload, HiLocationMarker, HiClock, HiUser, HiViewGrid } from 'react-icons/hi'

interface TicketDisplayProps {
    ticket: {
        qrToken: string
        totalPersons: number
        checkedInCount: number
        seatId?: string | null
        status?: string
    }
    booking: {
        bookingNumber: string
        guestName: string | null
        adultCount: number
        childCount: number
    }
    event: {
        title: string
        eventDate: string | Date
        startTime: string
        venueName: string
        venueAddress?: string | null
    }
    ticketNumber?: number
    ticketType?: string
}

export function TicketDisplay({ ticket, booking, event, ticketNumber, ticketType }: TicketDisplayProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('')

    useEffect(() => {
        if (ticket.qrToken) {
            QRCode.toDataURL(ticket.qrToken, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            }).then(setQrDataUrl)
        }
    }, [ticket.qrToken])

    const handleDownload = () => {
        if (!qrDataUrl) return

        const link = document.createElement('a')
        link.download = `ticket-${booking.bookingNumber}${ticketNumber ? `-${ticketNumber}` : ''}.png`
        link.href = qrDataUrl
        link.click()
    }

    // Parse seat/table info from seatId
    const getSeatDisplayInfo = (seatId: string | null | undefined) => {
        if (!seatId) return null

        // New format: vip-t1-s3 (VIP table-seat format)
        const vipSeatMatch = seatId.match(/^vip-t(\d+)-s(\d+)$/i)
        if (vipSeatMatch) {
            return {
                type: 'VIP Table',
                displayText: `VIP Table ${vipSeatMatch[1]}, Seat ${vipSeatMatch[2]}`,
                icon: '👑',
                color: 'from-amber-500 to-orange-600',
                borderColor: 'border-amber-500/50',
                bgColor: 'bg-amber-500/20'
            }
        }

        // Regular table seat: t1-s4
        const regularSeatMatch = seatId.match(/^t(\d+)-s(\d+)$/i)
        if (regularSeatMatch) {
            return {
                type: 'Table',
                displayText: `Table ${regularSeatMatch[1]}, Seat ${regularSeatMatch[2]}`,
                icon: '🪑',
                color: 'from-blue-500 to-indigo-600',
                borderColor: 'border-blue-500/50',
                bgColor: 'bg-blue-500/20'
            }
        }

        // Legacy: Check for VIP table (whole table)
        if (seatId.toLowerCase().includes('vip-table') || seatId.toLowerCase().includes('vip_table')) {
            const tableNum = seatId.replace(/[^0-9]/g, '')
            return {
                type: 'VIP Table',
                displayText: `VIP Table ${tableNum}`,
                icon: '👑',
                color: 'from-amber-500 to-orange-600',
                borderColor: 'border-amber-500/50',
                bgColor: 'bg-amber-500/20'
            }
        }

        // Legacy: Check for regular table
        if (seatId.toLowerCase().includes('table')) {
            const tableNum = seatId.replace(/[^0-9]/g, '')
            return {
                type: 'Table',
                displayText: `Table ${tableNum}`,
                icon: '🪑',
                color: 'from-blue-500 to-indigo-600',
                borderColor: 'border-blue-500/50',
                bgColor: 'bg-blue-500/20'
            }
        }

        // Check for standalone seat
        if (seatId.toLowerCase().includes('seat')) {
            const seatNum = seatId.replace(/[^0-9\-]/g, '')
            return {
                type: 'Seat',
                displayText: `Seat ${seatNum}`,
                icon: '💺',
                color: 'from-purple-500 to-indigo-600',
                borderColor: 'border-purple-500/50',
                bgColor: 'bg-purple-500/20'
            }
        }

        // Default
        return {
            type: 'Seat',
            displayText: seatId,
            icon: '📍',
            color: 'from-gray-500 to-gray-600',
            borderColor: 'border-gray-500/50',
            bgColor: 'bg-gray-500/20'
        }
    }

    const seatInfo = getSeatDisplayInfo(ticket.seatId)
    const isCheckedIn = ticket.checkedInCount >= ticket.totalPersons

    return (
        <Card className="overflow-hidden max-w-md mx-auto bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white text-center relative">
                {ticketNumber && (
                    <div className="absolute top-2 left-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                        #{ticketNumber}
                    </div>
                )}
                <h2 className="text-xl font-bold">🎫 EVENT TICKET</h2>
                <p className="text-purple-200 text-sm mt-1">Present this QR code at entry</p>
            </div>

            <CardContent className="p-5 space-y-5">
                {/* QR Code */}
                <div className="flex justify-center">
                    <div className="p-3 bg-white rounded-xl shadow-inner border border-gray-100">
                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Ticket QR Code" className="w-40 h-40" />
                        ) : (
                            <div className="w-40 h-40 bg-gray-100 animate-pulse rounded-lg" />
                        )}
                    </div>
                </div>

                {/* Seat/Table Information - PROMINENT DISPLAY */}
                {seatInfo && (
                    <div className={`rounded-xl p-4 ${seatInfo.bgColor} border ${seatInfo.borderColor}`}>
                        <div className="flex items-center justify-center gap-3">
                            <div className={`w-14 h-14 bg-gradient-to-br ${seatInfo.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                                {seatInfo.icon}
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">
                                    {seatInfo.type}
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {seatInfo.displayText}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Seat - General Admission */}
                {!seatInfo && (
                    <div className="rounded-xl p-4 bg-green-500/20 border border-green-500/50">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                                🎉
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">
                                    General Admission
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    No Reserved Seat
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Event Info */}
                <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {event.title}
                    </h3>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <HiClock className="h-4 w-4 mr-2 text-purple-500" />
                        <span>{formatDate(event.eventDate)} at {formatTime(event.startTime)}</span>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <HiLocationMarker className="h-4 w-4 mr-2 text-purple-500" />
                        <span>{event.venueName}</span>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <HiUser className="h-4 w-4 mr-2 text-purple-500" />
                        <span>{booking.guestName || 'Guest'}</span>
                    </div>
                </div>

                {/* Booking Details */}
                <div className="border-t pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Booking #</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">{booking.bookingNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Check-in Status</span>
                        <span className={`font-medium ${isCheckedIn ? 'text-green-600' : 'text-orange-600'}`}>
                            {isCheckedIn ? '✅ Entered' : `⏳ ${ticket.checkedInCount}/${ticket.totalPersons} entered`}
                        </span>
                    </div>
                </div>

                {/* Download Button */}
                <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full"
                    disabled={!qrDataUrl}
                >
                    <HiDownload className="h-5 w-5 mr-2" />
                    Download Ticket
                </Button>
            </CardContent>
        </Card>
    )
}
