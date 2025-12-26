'use client'

import { useState } from 'react'
import { HiMail, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi'

export function NewsletterSubscribe() {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            })

            const data = await res.json()

            if (res.ok) {
                setStatus('success')
                setMessage(data.message)
                setEmail('')
                setName('')
            } else {
                setStatus('error')
                setMessage(data.error)
            }
        } catch {
            setStatus('error')
            setMessage('Something went wrong. Please try again.')
        }
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 md:p-12">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                        <HiMail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Stay Updated</h3>
                        <p className="text-purple-100 text-sm">Get notified about new events</p>
                    </div>
                </div>

                <p className="text-purple-100 mb-6 max-w-md">
                    Subscribe to our newsletter and never miss an amazing event.
                    We&apos;ll send you updates about upcoming events, exclusive offers, and more!
                </p>

                {status === 'success' ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-400/30">
                        <HiCheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                        <p className="text-green-100">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Your name (optional)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="px-6 py-3 rounded-xl bg-white text-purple-700 font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {status === 'loading' ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Subscribing...
                                    </span>
                                ) : (
                                    'Subscribe'
                                )}
                            </button>
                        </div>

                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-200">
                                <HiExclamationCircle className="h-5 w-5" />
                                <span>{message}</span>
                            </div>
                        )}
                    </form>
                )}

                <p className="mt-4 text-xs text-purple-200/70">
                    By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                </p>
            </div>
        </div>
    )
}
