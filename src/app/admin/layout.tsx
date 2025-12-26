'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    HiOutlineViewGrid,
    HiOutlineCalendar,
    HiOutlineTicket,
    HiOutlineChartBar,
    HiOutlineQrcode,
    HiOutlineCog,
    HiOutlineMap,
    HiOutlineTrendingUp,
    HiOutlineTag,
} from 'react-icons/hi'

const sidebarItems = [
    { href: '/admin', label: 'Dashboard', icon: HiOutlineViewGrid },
    { href: '/admin/events', label: 'Events', icon: HiOutlineCalendar },
    { href: '/admin/bookings', label: 'Bookings', icon: HiOutlineTicket },
    { href: '/admin/venues', label: 'Venues', icon: HiOutlineMap },
    { href: '/admin/analytics', label: 'Analytics', icon: HiOutlineTrendingUp },
    { href: '/admin/discount-codes', label: 'Discounts', icon: HiOutlineTag },
    { href: '/admin/reports', label: 'Reports', icon: HiOutlineChartBar },
    { href: '/staff/checkin', label: 'Check-In', icon: HiOutlineQrcode },
    { href: '/admin/settings', label: 'Settings', icon: HiOutlineCog },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const isBuilderPage = pathname?.includes('/builder/')

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className="hidden md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                    <div className="px-4 mb-8">
                        <Link href="/admin" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Admin
                            </span>
                        </Link>
                    </div>

                    <nav className="flex-1 px-3 space-y-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon
                            const isActive =
                                item.href === '/admin'
                                    ? pathname === '/admin'
                                    : pathname.startsWith(item.href)

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                                        isActive
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                    )}
                                >
                                    <Icon className="h-5 w-5 mr-3" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <Link
                            href="/"
                            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            ← Back to Site
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={cn("flex-1", isBuilderPage ? "h-screen flex flex-col overflow-hidden" : "md:pl-64 pt-16")}>
                <div className={isBuilderPage ? "flex-1 h-full overflow-hidden" : "py-8 px-4 sm:px-6 lg:px-8"}>
                    {children}
                </div>
            </main>
        </div>
    )
}
