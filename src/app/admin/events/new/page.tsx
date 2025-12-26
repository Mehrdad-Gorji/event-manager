'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TicketTierManager, TicketTier } from '@/components/event/ticket-tier-manager'
import { AddOnManager, EventAddOn } from '@/components/event/addon-manager'

export default function NewEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [layouts, setLayouts] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        fetch('/api/admin/venues')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLayouts(data)
            })
            .catch(err => console.error('Failed to fetch layouts', err))
    }, [])

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        rules: '',
        coverImage: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        doorsOpenTime: '',
        maxCapacity: 100,
        // Legacy prices (kept for schema compatibility)
        adultPrice: 0,
        childPrice: 0,
        vipPrice: 0,

        serviceFeePercent: 5,
        taxPercent: 10,
        venueName: '',
        venueAddress: '',
        reEntryAllowed: false,

        venueLayoutId: '',

        ticketTiers: [] as TicketTier[],
        addOns: [] as EventAddOn[],
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Ensure we have at least one ticket tier or fallback to legacy prices if strictly needed
            // For now, we pass everything.
            const res = await fetch('/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                const event = await res.json()
                router.push(`/admin/events/${event.id}/edit`)
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to create event')
            }
        } catch (error) {
            alert('Failed to create event')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === 'number'
                    ? parseFloat(value) || 0
                    : type === 'checkbox'
                        ? (e.target as HTMLInputElement).checked
                        : value,
        }))
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Create New Event
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Fill in the details for your new event
                </p>
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
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="New Year Gala 2025"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900"
                                placeholder="Describe your event..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Cover Image
                            </label>
                            <div className="flex items-center gap-4">
                                {formData.coverImage && (
                                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={formData.coverImage}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, coverImage: '' })}
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
                                                setFormData((prev) => ({ ...prev, coverImage: data.url }))
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
                            value={formData.eventDate}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Start Time"
                            name="startTime"
                            type="time"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="End Time"
                            name="endTime"
                            type="time"
                            value={formData.endTime}
                            onChange={handleChange}
                        />
                        <Input
                            label="Doors Open"
                            name="doorsOpenTime"
                            type="time"
                            value={formData.doorsOpenTime}
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
                            value={formData.venueName}
                            onChange={handleChange}
                            required
                            placeholder="Grand Ballroom"
                        />
                        <Input
                            label="Venue Address"
                            name="venueAddress"
                            value={formData.venueAddress}
                            onChange={handleChange}
                            placeholder="123 Main Street, City"
                        />
                        <Input
                            label="Maximum Capacity"
                            name="maxCapacity"
                            type="number"
                            value={formData.maxCapacity}
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
                                value={formData.venueLayoutId || ''}
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

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Adult Price (€)"
                            name="adultPrice"
                            type="number"
                            value={formData.adultPrice}
                            onChange={handleChange}
                            required
                            min={0}
                            step={0.01}
                        />
                        <Input
                            label="VIP Price (€)"
                            name="vipPrice"
                            type="number"
                            value={formData.vipPrice}
                            onChange={handleChange}
                            min={0}
                            step={0.01}
                        />
                        <Input
                            label="Child Price (€)"
                            name="childPrice"
                            type="number"
                            value={formData.childPrice}
                            onChange={handleChange}
                            min={0}
                            step={0.01}
                        />
                        <Input
                            label="Service Fee (%)"
                            name="serviceFeePercent"
                            type="number"
                            value={formData.serviceFeePercent}
                            onChange={handleChange}
                            min={0}
                            max={100}
                            step={0.1}
                        />
                        <Input
                            label="Tax (%)"
                            name="taxPercent"
                            type="number"
                            value={formData.taxPercent}
                            onChange={handleChange}
                            min={0}
                            max={100}
                            step={0.1}
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
                                value={formData.rules}
                                onChange={handleChange}
                                rows={3}
                                className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900"
                                placeholder="No outside food or drinks. Dress code: formal..."
                            />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="reEntryAllowed"
                                checked={formData.reEntryAllowed}
                                onChange={handleChange}
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
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Event'}
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
