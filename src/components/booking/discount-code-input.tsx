'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { HiTag, HiCheck, HiX } from 'react-icons/hi'

interface DiscountCodeInputProps {
    eventId: string
    subtotal: number
    onApply: (discount: { code: string; amount: number; type: string; value: number }) => void
    onRemove: () => void
    appliedCode?: string
}

export function DiscountCodeInput({ eventId, subtotal, onApply, onRemove, appliedCode }: DiscountCodeInputProps) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleApply = async () => {
        if (!code.trim()) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/discount-codes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code.trim(),
                    eventId,
                    subtotal
                })
            })

            const data = await res.json()

            if (data.valid) {
                onApply({
                    code: data.discountCode.code,
                    amount: data.discountAmount,
                    type: data.discountCode.discountType,
                    value: data.discountCode.discountValue
                })
                setCode('')
            } else {
                setError(data.error || 'Invalid code')
            }
        } catch (err) {
            setError('Failed to validate code')
        } finally {
            setLoading(false)
        }
    }

    if (appliedCode) {
        return (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                    <HiTag className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">{appliedCode}</span>
                    <HiCheck className="w-4 h-4 text-green-600" />
                </div>
                <button
                    onClick={onRemove}
                    className="p-1 hover:bg-green-100 rounded-full transition-colors"
                    title="Remove code"
                >
                    <HiX className="w-4 h-4 text-green-600" />
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <HiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Discount code"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase())
                            setError(null)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        className="pl-10"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleApply}
                    disabled={!code.trim() || loading}
                >
                    {loading ? 'Checking...' : 'Apply'}
                </Button>
            </div>
            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <HiX className="w-4 h-4" />
                    {error}
                </p>
            )}
        </div>
    )
}
