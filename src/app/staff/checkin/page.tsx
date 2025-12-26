'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HiCamera, HiCheck, HiX, HiMinus, HiPlus } from 'react-icons/hi'

interface CheckInResult {
    success?: boolean
    error?: string
    message?: string
    booking?: {
        bookingNumber: string
        guestName: string | null
        eventTitle: string
    }
    ticket?: {
        totalPersons: number
        previouslyCheckedIn: number
        nowCheckedIn: number
        remaining: number
        status: 'partial' | 'completed'
    }
    remaining?: number
    checkedIn?: number
    total?: number
}

export default function StaffCheckInPage() {
    const [qrToken, setQrToken] = useState('')
    const [personsEntering, setPersonsEntering] = useState(1)
    const [result, setResult] = useState<CheckInResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [showScanner, setShowScanner] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Camera scanner - simplified version
    const startScanner = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setShowScanner(true)
            }
        } catch (err) {
            console.error('Camera error:', err)
            alert('Could not access camera. Please use manual entry.')
        }
    }

    const stopScanner = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
            tracks.forEach((track) => track.stop())
            videoRef.current.srcObject = null
        }
        setShowScanner(false)
    }

    useEffect(() => {
        return () => stopScanner()
    }, [])

    const handleScan = async () => {
        if (!qrToken.trim()) {
            setResult({ error: 'EMPTY_TOKEN', message: 'Please enter a QR token' })
            return
        }

        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/checkin/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrToken: qrToken.trim(), personsEntering }),
            })

            const data = await res.json()

            if (res.ok) {
                setResult(data)
                // Reset for next scan
                setQrToken('')
                setPersonsEntering(1)
            } else {
                setResult(data)
            }
        } catch (err) {
            setResult({ error: 'NETWORK_ERROR', message: 'Network error. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const getResultColor = () => {
        if (!result) return ''
        if (result.success) return 'border-green-500 bg-green-50 dark:bg-green-900/20'
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="text-center pt-8 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Check-In Scanner
                    </h1>
                    <p className="text-gray-500 mt-1">Scan tickets or enter code manually</p>
                </div>

                {/* Scanner / Manual Input */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        {showScanner ? (
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full rounded-lg"
                                />
                                <Button
                                    onClick={stopScanner}
                                    variant="destructive"
                                    className="absolute top-2 right-2"
                                    size="sm"
                                >
                                    <HiX className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={startScanner}
                                variant="outline"
                                className="w-full h-40 flex flex-col items-center justify-center border-dashed"
                            >
                                <HiCamera className="h-12 w-12 text-gray-400 mb-2" />
                                <span>Tap to Scan QR Code</span>
                            </Button>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">
                                    Or enter manually
                                </span>
                            </div>
                        </div>

                        <Input
                            placeholder="Enter QR token or booking number"
                            value={qrToken}
                            onChange={(e) => setQrToken(e.target.value)}
                            className="text-center font-mono"
                        />

                        {/* Persons Counter */}
                        <div className="flex items-center justify-between py-4 border-t border-b">
                            <span className="font-medium">Persons entering:</span>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setPersonsEntering(Math.max(1, personsEntering - 1))}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                >
                                    <HiMinus className="h-5 w-5" />
                                </button>
                                <span className="text-2xl font-bold w-8 text-center">
                                    {personsEntering}
                                </span>
                                <button
                                    onClick={() => setPersonsEntering(personsEntering + 1)}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                >
                                    <HiPlus className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleScan}
                            className="w-full"
                            size="lg"
                            disabled={loading || !qrToken.trim()}
                        >
                            {loading ? 'Checking...' : 'Check In'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Result Display */}
                {result && (
                    <Card className={`border-2 ${getResultColor()}`}>
                        <CardContent className="p-6">
                            {result.success ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-green-500 text-white">
                                            <HiCheck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-green-700 dark:text-green-400">
                                                Check-In Successful!
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {result.booking?.eventTitle}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Booking</span>
                                            <span className="font-mono font-medium">
                                                {result.booking?.bookingNumber}
                                            </span>
                                        </div>
                                        {result.booking?.guestName && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Guest</span>
                                                <span className="font-medium">{result.booking.guestName}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Just entered</span>
                                            <span className="font-bold text-green-600">
                                                +{result.ticket?.nowCheckedIn! - result.ticket?.previouslyCheckedIn!}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total checked in</span>
                                            <span className="font-medium">
                                                {result.ticket?.nowCheckedIn} / {result.ticket?.totalPersons}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Remaining</span>
                                            <Badge
                                                variant={result.ticket?.remaining === 0 ? 'success' : 'warning'}
                                            >
                                                {result.ticket?.remaining} left
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-red-500 text-white">
                                        <HiX className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-red-700 dark:text-red-400">
                                            {result.error?.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-sm text-gray-600">{result.message}</p>
                                        {result.remaining !== undefined && (
                                            <p className="text-sm font-medium mt-1">
                                                Remaining: {result.remaining}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
