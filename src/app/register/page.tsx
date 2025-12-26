'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            router.push('/login?registered=true')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600" />
                        <p className="text-white/60 mt-4">Loading...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30" />
                        <span className="text-3xl font-bold text-white mt-2 block">EventBook</span>
                    </Link>
                    <p className="text-white/60 mt-2">Create your account to get started</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-white/80 text-sm font-medium mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="John Doe"
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-white/80 text-sm font-medium mb-2">
                                Phone (optional)
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="+49 123 456789"
                                autoComplete="tel"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="At least 8 characters"
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-white/80 text-sm font-medium mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Confirm your password"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-white/60 mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                        Sign in
                    </Link>
                </p>

                <div className="text-center mt-4">
                    <Link href="/" className="text-white/40 hover:text-white/60 text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
