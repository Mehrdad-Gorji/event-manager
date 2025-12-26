'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'

export interface TicketTier {
    id?: string
    name: string
    price: number
    capacity: number | null
    description: string
    sectionMatcher?: string // New field
}

interface TicketTierManagerProps {
    tiers: TicketTier[]
    onChange: (tiers: TicketTier[]) => void
}

export function TicketTierManager({ tiers, onChange }: TicketTierManagerProps) {
    const addTier = () => {
        onChange([
            ...tiers,
            { name: '', price: 0, capacity: null, description: '', sectionMatcher: '' }
        ])
    }

    const removeTier = (index: number) => {
        onChange(tiers.filter((_, i) => i !== index))
    }

    const updateTier = (index: number, field: keyof TicketTier, value: any) => {
        const newTiers = [...tiers]
        newTiers[index] = { ...newTiers[index], [field]: value }
        onChange(newTiers)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Ticket Tiers</h3>
                <Button type="button" onClick={addTier} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tier
                </Button>
            </div>

            {tiers.length === 0 && (
                <p className="text-sm text-gray-500 italic">No ticket tiers defined. (Standard pricing will apply if empty)</p>
            )}

            <div className="space-y-3">
                {tiers.map((tier, index) => (
                    <div key={index} className="flex gap-3 items-start p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    placeholder="Tier Name (e.g. VIP, Early Bird)"
                                    value={tier.name}
                                    onChange={(e) => updateTier(index, 'name', e.target.value)}
                                    required
                                />
                                <Input
                                    type="number"
                                    placeholder="Price (€)"
                                    value={tier.price}
                                    onChange={(e) => updateTier(index, 'price', parseFloat(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    type="number"
                                    placeholder="Capacity (Optional)"
                                    value={tier.capacity || ''}
                                    onChange={(e) => updateTier(index, 'capacity', e.target.value ? parseInt(e.target.value) : null)}
                                    min={1}
                                />
                                <Input
                                    placeholder="Description (Optional)"
                                    value={tier.description || ''}
                                    onChange={(e) => updateTier(index, 'description', e.target.value)}
                                />
                            </div>
                            <div>
                                <Input
                                    placeholder="Venue Section ID (Matches Seat Section)"
                                    value={tier.sectionMatcher || ''}
                                    onChange={(e) => updateTier(index, 'sectionMatcher', e.target.value)}
                                    className="text-xs"
                                />
                                <p className="text-[10px] text-gray-500 mt-1 ml-1">
                                    If using a Visual Layout, enter the "Section" name here to link this price to those seats.
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeTier(index)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
