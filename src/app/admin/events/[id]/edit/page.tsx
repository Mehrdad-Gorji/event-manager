'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TicketTierManager, TicketTier } from '@/components/event/ticket-tier-manager'
import { AddOnManager, EventAddOn } from '@/components/event/addon-manager'

interface EventData {
    id: string
    title: string
    description: string | null
    rules: string | null
    coverImage: string | null
    eventDate: string
    startTime: string
    endTime: string | null
    doorsOpenTime: string | null
    maxCapacity: number
    adultPrice: number
    vipPrice: number | null
    childPrice: number | null
    serviceFeePercent: number
    taxPercent: number
    venueName: string
    venueAddress: string | null
    reEntryAllowed: boolean
    status: string
    venueLayoutId: string | null
    ticketTiers: TicketTier[]
    addOns: EventAddOn[]
}

export default function EditEventPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [event, setEvent] = useState<EventData | null>(null)
    const [layouts, setLayouts] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        if (params.id) {
            fetchEvent()
            fetchLayouts()
        }
    }, [params.id])

    const fetchLayouts = async () => {
        try {
            const res = await fetch('/api/admin/venues')
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) setLayouts(data)
            }
        } catch (error) {
            console.error('Failed to fetch layouts', error)
        }
    }

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/admin/events/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setEvent({
                    ...data,
                    eventDate: new Date(data.eventDate).toISOString().split('T')[0],
                    adultPrice: Number(data.adultPrice),
                    vipPrice: data.vipPrice ? Number(data.vipPrice) : null,
                    childPrice: data.childPrice ? Number(data.childPrice) : null,
                    serviceFeePercent: Number(data.serviceFeePercent),
                    taxPercent: Number(data.taxPercent),
                    venueLayoutId: data.venueLayoutId || null,
                    ticketTiers: data.ticketTiers?.map((t: any) => ({
                        ...t,
                        price: Number(t.price)
                    })) || [],
                    addOns: data.addOns?.map((a: any) => ({
                        ...a,
                        price: Number(a.price)
                    })) || [],
                })
            }
        } catch (error) {
            console.error('Error fetching event:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!event) return

        setSaving(true)
        try {
            const res = await fetch(`/api/admin/events/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
            })

            if (res.ok) {
                router.push('/admin/events')
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to save event')
            }
        } catch (error) {
            alert('Failed to save event')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!event) return
        const { name, value, type } = e.target
        setEvent({
            ...event,
            [name]:
                type === 'number'
                    ? parseFloat(value) || 0
                    : type === 'checkbox'
                        ? (e.target as HTMLInputElement).checked
                        : value,
        })
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-gray-200 rounded w-1/3" />
                    <div className="h-64 bg-gray-200 rounded" />
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Event not found</p>
                <Button onClick={() => router.push('/admin/events')} className="mt-4">
                    Back to Events
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Edit Event
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Update event details
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                        event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {event.status}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Event Title"
                            name="title"
                            value={event.title}
                            onChange={handleChange}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={event.description || ''}
                                onChange={handleChange}
                                rows={4}
                                className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Cover Image
                            </label>
                            <div className="flex items-center gap-4">
                                {event.coverImage && (
                                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={event.coverImage}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setEvent({ ...event, coverImage: '' })}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return

                                            const formData = new FormData()
                                            formData.append('file', file)

                                            try {
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: formData,
                                                })
                                                if (!res.ok) throw new Error('Upload failed')
                                                const data = await res.json()
                                                setEvent((prev) => prev ? ({ ...prev, coverImage: data.url }) : null)
                                            } catch (error) {
                                                alert('Failed to upload image')
                                            }
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Upload an image (JPG, PNG, GIF). Max 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Status
                            </label>
                            <select
                                name="status"
                                value={event.status}
                                onChange={handleChange}
                                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900"
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Date & Time */}
                <Card>
                    <CardHeader>
                        <CardTitle>Date & Time</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Event Date"
                            name="eventDate"
                            type="date"
                            value={event.eventDate}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Start Time"
                            name="startTime"
                            type="time"
                            value={event.startTime}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="End Time"
                            name="endTime"
                            type="time"
                            value={event.endTime || ''}
                            onChange={handleChange}
                        />
                        <Input
                            label="Doors Open"
                            name="doorsOpenTime"
                            type="time"
                            value={event.doorsOpenTime || ''}
                            onChange={handleChange}
                        />
                    </CardContent>
                </Card>

                {/* Venue */}
                <Card>
                    <CardHeader>
                        <CardTitle>Venue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Venue Name"
                            name="venueName"
                            value={event.venueName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Venue Address"
                            name="venueAddress"
                            value={event.venueAddress || ''}
                            onChange={handleChange}
                        />
                        <Input
                            label="Maximum Capacity"
                            name="maxCapacity"
                            type="number"
                            value={event.maxCapacity}
                            onChange={handleChange}
                            required
                            min={1}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Seating Layout (Optional)
                            </label>
                            <select
                                name="venueLayoutId"
                                value={event.venueLayoutId || ''}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
                            >
                                <option value="">No Layout (General Admission)</option>
                                {layouts.map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Select a visual layout for seat selection.</p>
                        </div>

                    </CardContent>
                </Card>

                {/* Pricing & Tickets */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tickets & Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <TicketTierManager
                            tiers={event.ticketTiers}
                            onChange={(tiers) => setEvent({ ...event, ticketTiers: tiers })}
                        />

                        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                            <Input
                                label="Service Fee (%)"
                                name="serviceFeePercent"
                                type="number"
                                value={event.serviceFeePercent}
                                onChange={handleChange}
                                min={0}
                                max={100}
                                step={0.1}
                            />
                            <Input
                                label="Tax (%)"
                                name="taxPercent"
                                type="number"
                                value={event.taxPercent}
                                onChange={handleChange}
                                min={0}
                                max={100}
                                step={0.1}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Add-ons */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add-ons & Extras</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddOnManager
                            addOns={event.addOns}
                            onChange={(addOns) => setEvent({ ...event, addOns: addOns })}
                        />
                    </CardContent>
                </Card>

                {/* Rules */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rules & Policies</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Event Rules
                            </label>
                            <textarea
                                name="rules"
                                value={event.rules || ''}
                                onChange={handleChange}
                                rows={3}
                                className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900"
                            />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="reEntryAllowed"
                                checked={event.reEntryAllowed}
                                onChange={(e) => setEvent({ ...event, reEntryAllowed: e.target.checked })}
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Allow re-entry
                            </span>
                        </label>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/events')}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
