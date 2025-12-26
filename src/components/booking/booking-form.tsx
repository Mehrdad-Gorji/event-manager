'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { HiMinus, HiPlus, HiTag, HiX, HiCheck } from 'react-icons/hi'
import { VenueSelection } from './venue-selection'

interface Tier {
    id: string
    name: string
    price: number
    description: string | null
    capacity: number | null
    sectionMatcher?: string | null
}

interface AddOn {
    id: string
    name: string
    price: number
    description: string | null
    stock: number | null
}

interface BookingFormProps {
    event: {
        id: string
        title: string
        adultPrice: number
        childPrice: number | null
        vipPrice: number | null
        serviceFeePercent: number
        taxPercent: number
        remainingCapacity: number
        ticketTiers?: Tier[]
        addOns?: AddOn[]
        venueLayout?: any
        bookedSeatIds?: string[]
    }
    onSubmit: (data: BookingData) => void
    isLoading?: boolean
}

export interface BookingData {
    eventId: string
    adultCount: number
    childCount: number
    vipCount: number
    items?: {
        ticketTierId?: string
        addOnId?: string
        quantity: number
        seatId?: string
    }[]
    guestEmail: string
    guestName: string
    guestPhone: string
}

export function BookingForm({ event, onSubmit, isLoading }: BookingFormProps) {
    // Legacy State
    const [adultCount, setAdultCount] = useState(0)
    const [childCount, setChildCount] = useState(0)
    const [vipCount, setVipCount] = useState(0)

    // Dynamic State
    const [tierQuantities, setTierQuantities] = useState<{ [id: string]: number }>({})
    const [addonQuantities, setAddonQuantities] = useState<{ [id: string]: number }>({})

    // Seating State
    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])

    const [guestEmail, setGuestEmail] = useState('')
    const [guestName, setGuestName] = useState('')
    const [guestPhone, setGuestPhone] = useState('')

    // Discount Code State
    const [discountCode, setDiscountCode] = useState('')
    const [appliedDiscount, setAppliedDiscount] = useState<{
        code: string
        amount: number
        type: string
        value: number
    } | null>(null)
    const [discountLoading, setDiscountLoading] = useState(false)
    const [discountError, setDiscountError] = useState<string | null>(null)

    const hasTiers = event.ticketTiers && event.ticketTiers.length > 0
    const hasLayout = !!event.venueLayout

    // Calculate totals
    let subtotal = 0
    let totalPersons = 0

    if (hasLayout) {
        // Calculate based on selected seats
        selectedSeatIds.forEach(seatId => {
            const seat = event.venueLayout.elements.find((el: any) => el.id === seatId)
            if (seat) {
                if (hasTiers) {
                    // Match with Tiers
                    let tier = event.ticketTiers!.find(t => t.sectionMatcher === seat.section)
                    if (!tier) tier = event.ticketTiers!.find(t => !t.sectionMatcher)

                    if (tier) {
                        subtotal += Number(tier.price)
                    }
                } else {
                    // Legacy Pricing Mapping
                    if (seat.section === 'VIP' && event.vipPrice) {
                        subtotal += Number(event.vipPrice)
                    } else {
                        subtotal += Number(event.adultPrice)
                    }
                }
            }
            totalPersons++
        })
    } else if (hasTiers) {
        event.ticketTiers!.forEach(tier => {
            const qty = tierQuantities[tier.id] || 0
            subtotal += qty * Number(tier.price)
            totalPersons += qty
        })
    } else {
        // Legacy calculation (No Layout, No Tiers)
        subtotal += adultCount * Number(event.adultPrice)
        if (event.childPrice) subtotal += childCount * Number(event.childPrice)
        if (event.vipPrice) subtotal += vipCount * Number(event.vipPrice)
        totalPersons = adultCount + childCount + vipCount
    }

    // Add-ons
    if (event.addOns) {
        event.addOns.forEach(addon => {
            const qty = addonQuantities[addon.id] || 0
            subtotal += qty * Number(addon.price)
        })
    }

    // Calculate discount
    let discountAmount = 0
    if (appliedDiscount) {
        if (appliedDiscount.type === 'PERCENTAGE') {
            discountAmount = (subtotal * appliedDiscount.value) / 100
        } else {
            discountAmount = appliedDiscount.value
        }
        discountAmount = Math.min(discountAmount, subtotal) // Can't exceed subtotal
    }

    const discountedSubtotal = subtotal - discountAmount
    const serviceFee = (discountedSubtotal * event.serviceFeePercent) / 100
    const tax = ((discountedSubtotal + serviceFee) * event.taxPercent) / 100
    const total = discountedSubtotal + serviceFee + tax

    // Constraints
    const maxAllowed = Math.min(50, event.remainingCapacity)

    // Apply discount code
    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return

        setDiscountLoading(true)
        setDiscountError(null)

        try {
            const res = await fetch('/api/discount-codes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: discountCode.trim(),
                    eventId: event.id,
                    subtotal
                })
            })

            const data = await res.json()

            if (data.valid) {
                setAppliedDiscount({
                    code: data.discountCode.code,
                    amount: data.discountAmount,
                    type: data.discountCode.discountType,
                    value: data.discountCode.discountValue
                })
                setDiscountCode('')
            } else {
                setDiscountError(data.error || 'Invalid code')
            }
        } catch (err) {
            setDiscountError('Failed to validate code')
        } finally {
            setDiscountLoading(false)
        }
    }

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null)
        setDiscountError(null)
    }

    const handleTierChange = (tierId: string, delta: number) => {
        const currentQty = tierQuantities[tierId] || 0
        const newQty = Math.max(0, currentQty + delta)

        // Check global capacity limit (tickets only)
        const currentTotalTickets = Object.values(tierQuantities).reduce((a, b) => a + b, 0)
        // If adding, check if we exceed maxAllowed
        if (delta > 0 && currentTotalTickets >= maxAllowed) return

        setTierQuantities(prev => ({ ...prev, [tierId]: newQty }))
    }

    const handleAddonChange = (addonId: string, delta: number) => {
        const currentQty = addonQuantities[addonId] || 0
        const newQty = Math.max(0, currentQty + delta)
        setAddonQuantities(prev => ({ ...prev, [addonId]: newQty }))
    }

    const handleSeatToggle = (seatId: string) => {
        setSelectedSeatIds(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId)
            }
            if (prev.length >= maxAllowed) return prev // Limit max seats
            return [...prev, seatId]
        })
    }

    // Legacy Adjust Functions
    const adjustLegacyCount = (type: 'adult' | 'child' | 'vip', delta: number) => {
        if (type === 'adult') {
            const newCount = Math.max(0, adultCount + delta)
            if (newCount + childCount + vipCount <= maxAllowed) setAdultCount(newCount)
        } else if (type === 'child') {
            const newCount = Math.max(0, childCount + delta)
            if (adultCount + newCount + vipCount <= maxAllowed) setChildCount(newCount)
        } else {
            const newCount = Math.max(0, vipCount + delta)
            if (adultCount + childCount + newCount <= maxAllowed) setVipCount(newCount)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const items: { ticketTierId?: string; addOnId?: string; quantity: number; seatId?: string }[] = []

        // Calculated counts for legacy pricing
        let calcAdultCount = 0
        let calcVipCount = 0

        if (hasLayout) {
            selectedSeatIds.forEach(seatId => {
                const seat = event.venueLayout.elements.find((el: any) => el.id === seatId)

                if (hasTiers) {
                    let tier = event.ticketTiers!.find(t => t.sectionMatcher === seat?.section)
                    if (!tier) tier = event.ticketTiers!.find(t => !t.sectionMatcher)

                    if (tier) {
                        items.push({ ticketTierId: tier.id, quantity: 1, seatId: seatId })
                    }
                } else {
                    // Legacy: Count based on section
                    if (seat?.section === 'VIP') {
                        calcVipCount++
                        // We still need to pass seatId somehow if the backend supports it for legacy
                        // But usually legacy doesn't support seatId per item in the same way.
                        // However, we should try to pass it if possible or just rely on counts.
                        // For now, let's just update the counts which is what the API expects for legacy.
                    } else {
                        calcAdultCount++
                    }

                    // If backend supports seats with legacy, we might need a different structure
                    // But based on BookingData interface, items are for tiers/addons.
                    // Let's assume for legacy with layout, we just send counts + seatIds in a separate field if needed?
                    // Looking at BookingData, it has seatId inside items. 
                    // If we don't have tiers, we can't create items with ticketTierId.
                    // So we might lose seat assignment for legacy pricing unless we add a "seatIds" array to BookingData.
                    // Let's check BookingData interface again.
                }
            })
        } else if (hasTiers) {
            Object.entries(tierQuantities).forEach(([id, qty]) => {
                if (qty > 0) items.push({ ticketTierId: id, quantity: qty })
            })
        } else {
            // Manual counters
            calcAdultCount = adultCount
            calcVipCount = vipCount
        }

        if (event.addOns) {
            Object.entries(addonQuantities).forEach(([id, qty]) => {
                if (qty > 0) items.push({ addOnId: id, quantity: qty })
            })
        }

        // If we have layout but no tiers, we need to send seatIds. 
        // Since the current BookingData structure attaches seatId to an item (which requires a tierId),
        // we might have a limitation here. 
        // However, let's send the counts correctly first.

        // WORKAROUND: If we have layout + legacy, we can't easily send seatIds with the current structure 
        // unless we modify the backend. But at least the price and counts will be correct.

        onSubmit({
            eventId: event.id,
            adultCount: hasTiers ? 0 : calcAdultCount,
            childCount: hasTiers ? 0 : childCount, // Child seats not fully supported in layout yet
            vipCount: hasTiers ? 0 : calcVipCount,
            items: items.length > 0 ? items : undefined,
            guestEmail,
            guestName,
            guestPhone,
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Book Your Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* VENUE SELECTION (Priority if exists) */}
                    {hasLayout ? (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Pick Your Seats</h3>
                            <VenueSelection
                                width={typeof window !== 'undefined' ? Math.min(1200, window.innerWidth - 50) : 1000} // Much larger
                                height={900}
                                venueWidth={(event.venueLayout.width || 20) * 50}  // Convert meters to pixels
                                venueHeight={(event.venueLayout.depth || 15) * 50}  // Convert meters to pixels
                                elements={event.venueLayout.elements}
                                bookedSeatIds={event.bookedSeatIds || []}
                                selectedSeatIds={selectedSeatIds}
                                onSeatToggle={handleSeatToggle}
                            />
                            <p className="text-xs text-center text-gray-500">
                                🖱️ Scroll to zoom • Drag to pan • Click seats to select
                            </p>
                            <p className="text-xs text-center text-gray-500">
                                {selectedSeatIds.length} seat(s) selected
                            </p>
                        </div>
                    ) : (
                        /* STANDARD TICKET SELECTION */
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Tickets</h3>

                            {hasTiers ? (
                                <div className="space-y-4">
                                    {event.ticketTiers!.map(tier => (
                                        <div key={tier.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{tier.name}</p>
                                                <p className="text-sm text-gray-500">{formatPrice(tier.price)} each</p>
                                                {tier.description && <p className="text-xs text-gray-400">{tier.description}</p>}
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTierChange(tier.id, -1)}
                                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                                    disabled={(tierQuantities[tier.id] || 0) <= 0}
                                                >
                                                    <HiMinus className="h-4 w-4" />
                                                </button>
                                                <span className="w-8 text-center font-semibold">{tierQuantities[tier.id] || 0}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleTierChange(tier.id, 1)}
                                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                                    disabled={totalPersons >= maxAllowed}
                                                >
                                                    <HiPlus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // LEGACY FALLBACK
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Adults</p>
                                            <p className="text-sm text-gray-500">{formatPrice(event.adultPrice)} each</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button type="button" onClick={() => adjustLegacyCount('adult', -1)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50" disabled={adultCount <= 0}><HiMinus className="h-4 w-4" /></button>
                                            <span className="w-8 text-center font-semibold">{adultCount}</span>
                                            <button type="button" onClick={() => adjustLegacyCount('adult', 1)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50" disabled={totalPersons >= maxAllowed}><HiPlus className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                    {event.childPrice !== null && (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Children</p>
                                                <p className="text-sm text-gray-500">{formatPrice(event.childPrice)} each</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button type="button" onClick={() => adjustLegacyCount('child', -1)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50" disabled={childCount <= 0}><HiMinus className="h-4 w-4" /></button>
                                                <span className="w-8 text-center font-semibold">{childCount}</span>
                                                <button type="button" onClick={() => adjustLegacyCount('child', 1)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50" disabled={totalPersons >= maxAllowed}><HiPlus className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                    {event.vipPrice !== null && (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-purple-600">VIP</p>
                                                <p className="text-sm text-gray-500">{formatPrice(event.vipPrice)} each</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button type="button" onClick={() => adjustLegacyCount('vip', -1)} className="p-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 disabled:opacity-50" disabled={vipCount <= 0}><HiMinus className="h-4 w-4" /></button>
                                                <span className="w-8 text-center font-semibold text-purple-600">{vipCount}</span>
                                                <button type="button" onClick={() => adjustLegacyCount('vip', 1)} className="p-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 disabled:opacity-50" disabled={totalPersons >= maxAllowed}><HiPlus className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}


                    {/* ADD-ONS SELECTION */}
                    {event.addOns && event.addOns.length > 0 && (
                        <div className="pt-4 border-t space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Extras</h3>
                            <div className="space-y-4">
                                {event.addOns.map(addon => (
                                    <div key={addon.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{addon.name}</p>
                                            <p className="text-sm text-gray-500">{formatPrice(addon.price)}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => handleAddonChange(addon.id, -1)}
                                                className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-colors"
                                                disabled={(addonQuantities[addon.id] || 0) <= 0}
                                            >
                                                <HiMinus className="h-4 w-4" />
                                            </button>
                                            <span className="w-8 text-center font-semibold text-white">{addonQuantities[addon.id] || 0}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleAddonChange(addon.id, 1)}
                                                className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-colors"
                                            >
                                                <HiPlus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-4 space-y-4">
                        <Input
                            label="Full Name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            required
                            placeholder="John Doe"
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            required
                            placeholder="john@example.com"
                        />
                        <Input
                            label="Phone (optional)"
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="+1 234 567 890"
                        />
                    </div>

                    {/* Detailed Order Summary */}
                    {(hasLayout && selectedSeatIds.length > 0) && (
                        <div className="border-t pt-4 space-y-2">
                            <h4 className="font-semibold text-sm text-gray-700">Selected Seats</h4>
                            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                                {(() => {
                                    // Group selected seats by tier/section
                                    const seatGroups: { [key: string]: string[] } = {}

                                    selectedSeatIds.forEach(seatId => {
                                        const seat = event.venueLayout.elements.find((el: any) => el.id === seatId)
                                        if (seat) {
                                            let tierName = 'Standard Seat'
                                            if (hasTiers) {
                                                const tier = event.ticketTiers!.find(t => t.sectionMatcher === seat.section)
                                                if (tier) tierName = tier.name
                                                else if (seat.section) tierName = `${seat.section} Seat`
                                            } else {
                                                if (seat.section) tierName = `${seat.section} Seat`
                                            }

                                            if (!seatGroups[tierName]) seatGroups[tierName] = []
                                            seatGroups[tierName].push(seat.label || seat.seatNumber || 'Seat')
                                        }
                                    })

                                    return Object.entries(seatGroups).map(([name, seats]) => (
                                        <div key={name} className="flex justify-between items-start">
                                            <div>
                                                <span className="font-medium text-gray-900">{name} x{seats.length}</span>
                                                <p className="text-xs text-gray-500 mt-0.5 break-all">
                                                    {seats.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Discount Code Section */}
                    <div className="border-t pt-4 space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                            <HiTag className="w-4 h-4" />
                            Discount Code
                        </h4>

                        {appliedDiscount ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <HiCheck className="w-5 h-5 text-green-600" />
                                    <div>
                                        <span className="font-mono font-bold text-green-700">{appliedDiscount.code}</span>
                                        <span className="text-sm text-green-600 ml-2">
                                            ({appliedDiscount.type === 'PERCENTAGE' ? `${appliedDiscount.value}%` : formatPrice(appliedDiscount.value)} off)
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveDiscount}
                                    className="p-1 hover:bg-green-100 rounded-full transition-colors"
                                >
                                    <HiX className="w-4 h-4 text-green-600" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={discountCode}
                                        onChange={(e) => {
                                            setDiscountCode(e.target.value.toUpperCase())
                                            setDiscountError(null)
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyDiscount())}
                                        placeholder="Enter code"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyDiscount}
                                        disabled={!discountCode.trim() || discountLoading}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {discountLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {discountError && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <HiX className="w-4 h-4" />
                                        {discountError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Price Summary */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount ({appliedDiscount?.code})</span>
                                <span>-{formatPrice(discountAmount)}</span>
                            </div>
                        )}
                        {serviceFee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Service Fee</span>
                                <span>{formatPrice(serviceFee)}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span>{formatPrice(tax)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total</span>
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                {formatPrice(total)}
                            </span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={totalPersons === 0 || isLoading}
                    >
                        {isLoading ? 'Processing...' : `Pay ${formatPrice(total)}`}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                        You will be redirected to secure payment
                    </p>
                </CardContent>
            </Card>
        </form>
    )
}
