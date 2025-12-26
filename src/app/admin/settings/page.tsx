'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        seatHoldMinutes: 10,
        serviceFeePercent: 5,
        taxPercent: 10,
        maxTicketsPerBooking: 10,
        defaultCurrency: 'EUR',
    })

    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        // In real app, save to database
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Configure system defaults</p>
            </div>

            {/* Booking Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Booking Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        label="Seat Hold Duration (minutes)"
                        type="number"
                        value={settings.seatHoldMinutes}
                        onChange={(e) =>
                            setSettings({ ...settings, seatHoldMinutes: parseInt(e.target.value) })
                        }
                        min={1}
                        max={30}
                    />
                    <Input
                        label="Max Tickets Per Booking"
                        type="number"
                        value={settings.maxTicketsPerBooking}
                        onChange={(e) =>
                            setSettings({ ...settings, maxTicketsPerBooking: parseInt(e.target.value) })
                        }
                        min={1}
                        max={50}
                    />
                </CardContent>
            </Card>

            {/* Pricing Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Pricing Defaults</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        label="Default Service Fee (%)"
                        type="number"
                        value={settings.serviceFeePercent}
                        onChange={(e) =>
                            setSettings({ ...settings, serviceFeePercent: parseFloat(e.target.value) })
                        }
                        min={0}
                        max={25}
                        step={0.5}
                    />
                    <Input
                        label="Default Tax (%)"
                        type="number"
                        value={settings.taxPercent}
                        onChange={(e) =>
                            setSettings({ ...settings, taxPercent: parseFloat(e.target.value) })
                        }
                        min={0}
                        max={30}
                        step={0.5}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Currency
                        </label>
                        <select
                            value={settings.defaultCurrency}
                            onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900"
                        >
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Stripe Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment (Stripe)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                            Stripe keys are configured via environment variables
                        </p>
                        <p className="text-yellow-600 dark:text-yellow-300 mt-1">
                            Edit .env file to update STRIPE_SECRET_KEY and related settings.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <Button onClick={handleSave}>Save Settings</Button>
                {saved && (
                    <span className="text-green-600 text-sm">✓ Settings saved</span>
                )}
            </div>
        </div>
    )
}
