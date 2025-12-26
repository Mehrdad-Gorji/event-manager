'use client'

import { useState } from 'react'
import {
    HiMail,
    HiPhone,
    HiLocationMarker,
    HiClock,
    HiCheckCircle,
    HiExclamationCircle
} from 'react-icons/hi'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [statusMessage, setStatusMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                setStatus('success')
                setStatusMessage(data.message)
                setFormData({ name: '', email: '', subject: '', message: '' })
            } else {
                setStatus('error')
                setStatusMessage(data.error)
            }
        } catch {
            setStatus('error')
            setStatusMessage('Something went wrong. Please try again.')
        }
    }

    const contactInfo = [
        {
            icon: HiMail,
            title: 'Email Us',
            content: 'support@eventbook.com',
            description: 'We reply within 24 hours'
        },
        {
            icon: HiPhone,
            title: 'Call Us',
            content: '+1 (555) 123-4567',
            description: 'Mon-Fri 9am-6pm'
        },
        {
            icon: HiLocationMarker,
            title: 'Visit Us',
            content: '123 Event Street, NY 10001',
            description: 'New York, USA'
        },
        {
            icon: HiClock,
            title: 'Business Hours',
            content: 'Monday - Friday',
            description: '9:00 AM - 6:00 PM EST'
        }
    ]

    const socialLinks = [
        { icon: FaFacebook, href: '#', label: 'Facebook' },
        { icon: FaTwitter, href: '#', label: 'Twitter' },
        { icon: FaInstagram, href: '#', label: 'Instagram' },
        { icon: FaLinkedin, href: '#', label: 'LinkedIn' }
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 py-20">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                        Have a question or feedback? We&apos;d love to hear from you.
                        Send us a message and we&apos;ll respond as soon as possible.
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Info Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            {contactInfo.map((item, index) => (
                                <div
                                    key={index}
                                    className="group p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white group-hover:scale-110 transition-transform">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {item.title}
                                            </h3>
                                            <p className="text-purple-600 dark:text-purple-400 font-medium">
                                                {item.content}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Social Links */}
                            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                    Follow Us
                                </h3>
                                <div className="flex gap-3">
                                    {socialLinks.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.href}
                                            aria-label={social.label}
                                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-purple-500 hover:to-indigo-500 hover:text-white transition-all duration-300"
                                        >
                                            <social.icon className="h-5 w-5" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Send us a Message
                                </h2>

                                {status === 'success' ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 mb-4">
                                            <HiCheckCircle className="h-10 w-10" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            Message Sent!
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            {statusMessage}
                                        </p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                                        >
                                            Send Another Message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Your Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.subject}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                placeholder="How can we help?"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                value={formData.message}
                                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                                required
                                                rows={5}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Tell us more about your inquiry..."
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                                <HiExclamationCircle className="h-5 w-5" />
                                                <span>{statusMessage}</span>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                        >
                                            {status === 'loading' ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Sending...
                                                </span>
                                            ) : (
                                                'Send Message'
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section (Placeholder) */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <HiLocationMarker className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Find Us Here
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    123 Event Street, New York, NY 10001
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
