'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [mounted, setMounted] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Wait for client-side hydration
    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const callbackUrl = searchParams.get('callbackUrl') || '/admin'

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                setError('Invalid email or password')
            } else if (result?.ok) {
                router.push(callbackUrl)
                router.refresh()
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="text-center mb-8">
                <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600" />
                <p className="text-white/60 mt-4">Loading...</p>
            </div>
        )
    }

    const registered = searchParams.get('registered') === 'true'

    return (
        <>
            <div className="text-center mb-8">
                <Link href="/" className="inline-block">
                    <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30" />
                    <span className="text-3xl font-bold text-white mt-2 block">EventBook</span>
                </Link>
                <p className="text-white/60 mt-2">Welcome back! Sign in to continue.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                {registered && (
                    <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg text-sm mb-4">
                        Account created successfully! Please sign in.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
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
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>

            <p className="text-center text-white/60 mt-6">
                {"Don't have an account? "}
                <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                    Create one
                </Link>
            </p>

            <div className="text-center mt-4">
                <Link href="/" className="text-white/40 hover:text-white/60 text-sm">
                    ← Back to Home
                </Link>
            </div>
        </>
    )
}

function LoginLoading() {
    return (
        <div className="text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 animate-pulse" />
            <p className="text-white/60 mt-4">Loading...</p>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Suspense fallback={<LoginLoading />}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
}
