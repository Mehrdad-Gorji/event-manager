'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'

export interface EventAddOn {
    id?: string
    name: string
    price: number
    stock: number | null
    description: string
}

interface AddOnManagerProps {
    addOns: EventAddOn[]
    onChange: (addOns: EventAddOn[]) => void
}

export function AddOnManager({ addOns, onChange }: AddOnManagerProps) {
    const addAddOn = () => {
        onChange([
            ...addOns,
            { name: '', price: 0, stock: null, description: '' }
        ])
    }

    const removeAddOn = (index: number) => {
        onChange(addOns.filter((_, i) => i !== index))
    }

    const updateAddOn = (index: number, field: keyof EventAddOn, value: any) => {
        const newAddOns = [...addOns]
        newAddOns[index] = { ...newAddOns[index], [field]: value }
        onChange(newAddOns)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Add-ons</h3>
                <Button type="button" onClick={addAddOn} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Add-on
                </Button>
            </div>

            {addOns.length === 0 && (
                <p className="text-sm text-gray-500 italic">No add-ons defined.</p>
            )}

            <div className="space-y-3">
                {addOns.map((addOn, index) => (
                    <div key={index} className="flex gap-3 items-start p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    placeholder="Add-on Name (e.g. Parking)"
                                    value={addOn.name}
                                    onChange={(e) => updateAddOn(index, 'name', e.target.value)}
                                    required
                                />
                                <Input
                                    type="number"
                                    placeholder="Price (€)"
                                    value={addOn.price}
                                    onChange={(e) => updateAddOn(index, 'price', parseFloat(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    type="number"
                                    placeholder="Stock (Optional)"
                                    value={addOn.stock || ''}
                                    onChange={(e) => updateAddOn(index, 'stock', e.target.value ? parseInt(e.target.value) : null)}
                                    min={1}
                                />
                                <Input
                                    placeholder="Description (Optional)"
                                    value={addOn.description || ''}
                                    onChange={(e) => updateAddOn(index, 'description', e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeAddOn(index)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
