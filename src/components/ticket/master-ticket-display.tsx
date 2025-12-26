'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime } from '@/lib/utils'
import { HiDownload, HiLocationMarker, HiClock, HiUser, HiUserGroup, HiKey } from 'react-icons/hi'

interface MasterTicketDisplayProps {
    ticket: {
        qrToken: string
        totalPersons: number
        checkedInCount: number
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
    individualTicketsCount?: number
}

export function MasterTicketDisplay({ ticket, booking, event, individualTicketsCount }: MasterTicketDisplayProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('')

    useEffect(() => {
        if (ticket.qrToken) {
            QRCode.toDataURL(ticket.qrToken, {
                width: 250,
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
        link.download = `master-ticket-${booking.bookingNumber}.png`
        link.href = qrDataUrl
        link.click()
    }

    const isFullyCheckedIn = ticket.checkedInCount >= ticket.totalPersons
    const remainingPersons = ticket.totalPersons - ticket.checkedInCount

    return (
        <Card className="overflow-hidden max-w-lg mx-auto bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-2 border-amber-500/50 shadow-2xl">
            {/* Header with Crown */}
            <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-5 text-center relative">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <span className="text-4xl">👑</span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-4 flex items-center justify-center gap-2">
                    <HiKey className="h-6 w-6" />
                    MASTER TICKET
                </h2>
                <p className="text-amber-100 text-sm mt-1">
                    This ticket can check in entire group ({ticket.totalPersons} persons)
                </p>
            </div>

            <CardContent className="p-6 space-y-5">
                {/* QR Code - Larger for Master */}
                <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-amber-400">
                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Master Ticket QR Code" className="w-48 h-48" />
                        ) : (
                            <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg" />
                        )}
                    </div>
                </div>

                {/* Group Info */}
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <HiUserGroup className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-amber-300 font-medium">GROUP SIZE</p>
                            <p className="text-4xl font-bold text-white">{ticket.totalPersons}</p>
                            <p className="text-xs text-amber-200">persons</p>
                        </div>
                    </div>
                </div>

                {/* Check-in Status */}
                <div className={`rounded-xl p-4 ${isFullyCheckedIn ? 'bg-green-500/20 border-green-500/50' : 'bg-blue-500/20 border-blue-500/50'} border`}>
                    <div className="flex items-center justify-between">
                        <span className="text-white/80">Check-in Status</span>
                        <span className={`font-bold ${isFullyCheckedIn ? 'text-green-400' : 'text-blue-400'}`}>
                            {isFullyCheckedIn ? (
                                '✅ All Entered'
                            ) : (
                                `${ticket.checkedInCount}/${ticket.totalPersons} entered (${remainingPersons} remaining)`
                            )}
                        </span>
                    </div>
                </div>

                {/* Event Info */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white">
                        {event.title}
                    </h3>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center text-white/80 text-sm">
                        <HiClock className="h-4 w-4 mr-2 text-amber-400" />
                        <span>{formatDate(event.eventDate)} at {formatTime(event.startTime)}</span>
                    </div>

                    <div className="flex items-center text-white/80 text-sm">
                        <HiLocationMarker className="h-4 w-4 mr-2 text-amber-400" />
                        <span>{event.venueName}</span>
                    </div>

                    <div className="flex items-center text-white/80 text-sm">
                        <HiUser className="h-4 w-4 mr-2 text-amber-400" />
                        <span>{booking.guestName || 'Guest'}</span>
                    </div>
                </div>

                {/* Booking Details */}
                <div className="border-t border-white/20 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-white/60">Booking #</span>
                        <span className="font-mono font-medium text-white">{booking.bookingNumber}</span>
                    </div>
                    {individualTicketsCount && (
                        <div className="flex justify-between text-sm">
                            <span className="text-white/60">Individual Tickets</span>
                            <span className="font-medium text-amber-400">{individualTicketsCount} tickets</span>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-sm text-white/70">
                        💡 <strong className="text-amber-400">Pro Tip:</strong> Use this master ticket if any group member forgets their individual ticket.
                        One scan checks in remaining people.
                    </p>
                </div>

                {/* Download Button */}
                <Button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                    disabled={!qrDataUrl}
                >
                    <HiDownload className="h-5 w-5 mr-2" />
                    Download Master Ticket
                </Button>
            </CardContent>
        </Card>
    )
}
