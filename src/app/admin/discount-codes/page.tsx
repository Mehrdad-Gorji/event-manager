'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { HiArrowLeft, HiPlus, HiTrash, HiTicket, HiTag } from 'react-icons/hi'

interface DiscountCode {
    id: string
    code: string
    description: string | null
    discountType: 'PERCENTAGE' | 'FIXED'
    discountValue: number
    minPurchase: number | null
    maxDiscount: number | null
    usageLimit: number | null
    usedCount: number
    validFrom: string
    validUntil: string | null
    eventId: string | null
    isActive: boolean
    event?: { id: string, title: string } | null
}

export default function DiscountCodesPage() {
    const [codes, setCodes] = useState<DiscountCode[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [events, setEvents] = useState<{ id: string, title: string }[]>([])

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minPurchase: '',
        maxDiscount: '',
        usageLimit: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        eventId: ''
    })

    useEffect(() => {
        fetchCodes()
        fetchEvents()
    }, [])

    const fetchCodes = async () => {
        try {
            const res = await fetch('/api/admin/discount-codes')
            const data = await res.json()
            setCodes(data)
        } catch (error) {
            console.error('Failed to fetch codes:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events')
            const data = await res.json()
            setEvents(data.data || [])
        } catch (error) {
            console.error('Failed to fetch events:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/admin/discount-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setShowForm(false)
                setFormData({
                    code: '', description: '', discountType: 'PERCENTAGE',
                    discountValue: '', minPurchase: '', maxDiscount: '',
                    usageLimit: '', validFrom: new Date().toISOString().split('T')[0],
                    validUntil: '', eventId: ''
                })
                fetchCodes()
            } else {
                const error = await res.json()
                alert(error.error || 'Failed to create code')
            }
        } catch (error) {
            console.error('Error creating code:', error)
            alert('Failed to create code')
        }
    }

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData({ ...formData, code })
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
                        <HiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <HiTag className="w-6 h-6 text-purple-600" />
                            Discount Codes
                        </h1>
                        <p className="text-gray-500">Manage promotional codes and discounts</p>
                    </div>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <HiPlus className="w-4 h-4 mr-2" />
                    New Code
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Create Discount Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Code *</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g., SUMMER20"
                                        required
                                    />
                                    <Button type="button" variant="outline" onClick={generateRandomCode}>
                                        Generate
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g., Summer sale discount"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Discount Type *</label>
                                <select
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount (€)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '(€)'}
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 10.00'}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Min. Purchase (€)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.minPurchase}
                                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Max. Discount (€)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.maxDiscount}
                                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                    placeholder="Optional (for % discounts)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    placeholder="Unlimited"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Limit to Event</label>
                                <select
                                    value={formData.eventId}
                                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="">All Events</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Valid From</label>
                                <Input
                                    type="date"
                                    value={formData.validFrom}
                                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Valid Until</label>
                                <Input
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                    placeholder="No expiry"
                                />
                            </div>

                            <div className="md:col-span-2 flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Code</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Codes List */}
            <Card>
                <CardContent className="p-0">
                    {codes.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <HiTag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No discount codes yet</p>
                            <p className="text-sm">Create your first code to get started</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left p-4 font-medium">Code</th>
                                    <th className="text-left p-4 font-medium">Discount</th>
                                    <th className="text-left p-4 font-medium">Usage</th>
                                    <th className="text-left p-4 font-medium">Valid Until</th>
                                    <th className="text-left p-4 font-medium">Event</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {codes.map(code => (
                                    <tr key={code.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-mono font-bold text-purple-600">{code.code}</div>
                                            {code.description && (
                                                <div className="text-sm text-gray-500">{code.description}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="font-semibold">
                                                {code.discountType === 'PERCENTAGE'
                                                    ? `${code.discountValue}%`
                                                    : formatPrice(code.discountValue)
                                                }
                                            </span>
                                            {code.maxDiscount && (
                                                <div className="text-xs text-gray-500">Max: {formatPrice(code.maxDiscount)}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="font-medium">{code.usedCount}</span>
                                            <span className="text-gray-500">
                                                {code.usageLimit ? ` / ${code.usageLimit}` : ' uses'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {code.validUntil ? formatDate(code.validUntil) : 'No expiry'}
                                        </td>
                                        <td className="p-4 text-sm">
                                            {code.event ? (
                                                <Link href={`/admin/events/${code.event.id}`} className="text-purple-600 hover:underline">
                                                    {code.event.title}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-500">All events</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <Badge className={code.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                                                {code.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
