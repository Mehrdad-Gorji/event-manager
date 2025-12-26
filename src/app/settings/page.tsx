'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    HiCog,
    HiUser,
    HiBell,
    HiLockClosed,
    HiMail,
    HiCheckCircle,
    HiExclamationCircle
} from 'react-icons/hi'

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const [activeTab, setActiveTab] = useState('profile')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: ''
    })

    const [notifications, setNotifications] = useState({
        bookingConfirmation: true,
        eventReminders: true,
        promotions: false,
        newsletter: true
    })

    useEffect(() => {
        if (session?.user) {
            setProfile({
                name: session.user.name || '',
                email: session.user.email || '',
                phone: ''
            })
        }
    }, [session])

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-md">
                    <HiCog className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign In Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please sign in to access settings
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    const handleProfileSave = async () => {
        setIsLoading(true)
        setMessage(null)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile' })
        } finally {
            setIsLoading(false)
        }
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: HiUser },
        { id: 'notifications', label: 'Notifications', icon: HiBell },
        { id: 'security', label: 'Security', icon: HiLockClosed },
        { id: 'email', label: 'Email Preferences', icon: HiMail }
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                        <HiCog className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Settings
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your account preferences
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <tab.icon className="h-5 w-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
                            {/* Message */}
                            {message && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    }`}>
                                    {message.type === 'success' ? (
                                        <HiCheckCircle className="h-5 w-5" />
                                    ) : (
                                        <HiExclamationCircle className="h-5 w-5" />
                                    )}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Profile Information
                                    </h2>

                                    <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center text-2xl font-bold">
                                            {profile.name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {profile.name || 'User'}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                disabled
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleProfileSave}
                                        disabled={isLoading}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Notification Preferences
                                    </h2>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'bookingConfirmation', label: 'Booking Confirmations', description: 'Get notified when a booking is confirmed' },
                                            { key: 'eventReminders', label: 'Event Reminders', description: 'Receive reminders before your events' },
                                            { key: 'promotions', label: 'Promotional Emails', description: 'Receive special offers and promotions' },
                                            { key: 'newsletter', label: 'Newsletter', description: 'Weekly updates about new events' }
                                        ].map((item) => (
                                            <div
                                                key={item.key}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                            >
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        {item.label}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {item.description}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications(prev => ({
                                                        ...prev,
                                                        [item.key]: !prev[item.key as keyof typeof notifications]
                                                    }))}
                                                    className={`relative w-12 h-6 rounded-full transition-all ${notifications[item.key as keyof typeof notifications]
                                                            ? 'bg-purple-600'
                                                            : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                >
                                                    <div
                                                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications[item.key as keyof typeof notifications]
                                                                ? 'left-7'
                                                                : 'left-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Security Settings
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                                Change Password
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                Update your password to keep your account secure
                                            </p>
                                            <button className="px-4 py-2 rounded-xl border border-purple-500 text-purple-600 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                                                Change Password
                                            </button>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                                Two-Factor Authentication
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                Add an extra layer of security to your account
                                            </p>
                                            <button className="px-4 py-2 rounded-xl border border-purple-500 text-purple-600 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                                                Enable 2FA
                                            </button>
                                        </div>

                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                            <h3 className="font-medium text-red-700 dark:text-red-400 mb-2">
                                                Delete Account
                                            </h3>
                                            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                                Permanently delete your account and all data
                                            </p>
                                            <button className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Email Preferences Tab */}
                            {activeTab === 'email' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Email Preferences
                                    </h2>

                                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                                            Email Frequency
                                        </h3>
                                        <div className="space-y-3">
                                            {['Immediately', 'Daily Digest', 'Weekly Digest', 'Never'].map((option) => (
                                                <label
                                                    key={option}
                                                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl cursor-pointer hover:shadow-md transition-all"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="emailFrequency"
                                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
