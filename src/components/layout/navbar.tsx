'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/notifications/notification-bell'
import {
    HiOutlineCalendar,
    HiOutlineTicket,
    HiOutlineUser,
    HiOutlineCog,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineHeart,
    HiOutlineMail,
    HiOutlineHome
} from 'react-icons/hi'
import { useState } from 'react'

export function Navbar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navItems = [
        { href: '/', label: 'Home', icon: HiOutlineHome },
        { href: '/events', label: 'Events', icon: HiOutlineTicket },
        { href: '/calendar', label: 'Calendar', icon: HiOutlineCalendar },
        { href: '/my-bookings', label: 'My Bookings', icon: HiOutlineUser },
    ]

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600" />
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            EventBook
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                        isActive(item.href)
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right Side - Wishlist, Notifications, Auth */}
                    <div className="hidden md:flex items-center space-x-2">
                        {/* Wishlist */}
                        <Link
                            href="/wishlist"
                            className={cn(
                                'p-2 rounded-xl transition-all',
                                pathname === '/wishlist'
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            )}
                            title="Wishlist"
                        >
                            <HiOutlineHeart className="h-6 w-6" />
                        </Link>

                        {/* Contact */}
                        <Link
                            href="/contact"
                            className={cn(
                                'p-2 rounded-xl transition-all',
                                pathname === '/contact'
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            )}
                            title="Contact"
                        >
                            <HiOutlineMail className="h-6 w-6" />
                        </Link>

                        {/* Notifications */}
                        {session && <NotificationBell />}

                        {/* Admin */}
                        <Link
                            href="/admin"
                            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                        >
                            <HiOutlineCog className="h-5 w-5" />
                            <span>Admin</span>
                        </Link>

                        {/* Auth Button */}
                        {session ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all"
                            >
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                                </div>
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <HiOutlineX className="h-6 w-6" />
                        ) : (
                            <HiOutlineMenu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium',
                                        isActive(item.href)
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}

                        {/* Mobile Extra Links */}
                        <Link
                            href="/wishlist"
                            className="flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <HiOutlineHeart className="h-5 w-5" />
                            <span>Wishlist</span>
                        </Link>
                        <Link
                            href="/contact"
                            className="flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <HiOutlineMail className="h-5 w-5" />
                            <span>Contact</span>
                        </Link>

                        <div className="pt-4 border-t border-gray-200">
                            <Link
                                href="/admin"
                                className="flex items-center space-x-2 px-4 py-3 text-gray-600"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <HiOutlineCog className="h-5 w-5" />
                                <span>Admin</span>
                            </Link>
                            {session ? (
                                <Link
                                    href="/dashboard"
                                    className="block mx-4 mt-2 px-4 py-3 text-center text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="block mx-4 mt-2 px-4 py-3 text-center text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
