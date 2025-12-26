'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HiSearch, HiFilter, HiX, HiCalendar, HiLocationMarker, HiCurrencyDollar } from 'react-icons/hi'
import { format } from 'date-fns'

interface SearchFilters {
    query: string
    dateFrom: string
    dateTo: string
    priceMin: string
    priceMax: string
    status: string
    sortBy: string
}

export function AdvancedSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<SearchFilters>({
        query: searchParams.get('q') || '',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || '',
        priceMin: searchParams.get('priceMin') || '',
        priceMax: searchParams.get('priceMax') || '',
        status: searchParams.get('status') || 'PUBLISHED',
        sortBy: searchParams.get('sortBy') || 'date-asc'
    })

    const buildSearchUrl = useCallback(() => {
        const params = new URLSearchParams()

        if (filters.query) params.set('q', filters.query)
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.set('dateTo', filters.dateTo)
        if (filters.priceMin) params.set('priceMin', filters.priceMin)
        if (filters.priceMax) params.set('priceMax', filters.priceMax)
        if (filters.status) params.set('status', filters.status)
        if (filters.sortBy) params.set('sortBy', filters.sortBy)

        return `/events?${params.toString()}`
    }, [filters])

    const handleSearch = () => {
        router.push(buildSearchUrl())
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const clearFilters = () => {
        setFilters({
            query: '',
            dateFrom: '',
            dateTo: '',
            priceMin: '',
            priceMax: '',
            status: 'PUBLISHED',
            sortBy: 'date-asc'
        })
    }

    const activeFiltersCount = [
        filters.dateFrom,
        filters.dateTo,
        filters.priceMin,
        filters.priceMax,
        filters.status !== 'PUBLISHED' ? filters.status : ''
    ].filter(Boolean).length

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Main Search Bar */}
            <div className="relative">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex-1 flex items-center gap-3 px-4">
                        <HiSearch className="h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search events, venues, or artists..."
                            value={filters.query}
                            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            className="flex-1 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-lg"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${showFilters
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        <HiFilter className="h-5 w-5" />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mt-4 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Filter Events
                        </h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Date Range */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <HiCalendar className="h-5 w-5 text-purple-500" />
                                <span className="font-medium">Date Range</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <HiCurrencyDollar className="h-5 w-5 text-purple-500" />
                                <span className="font-medium">Price Range</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.priceMin}
                                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.priceMax}
                                    onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <HiFilter className="h-5 w-5 text-purple-500" />
                                <span className="font-medium">Sort By</span>
                            </div>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="date-asc">Date (Soonest First)</option>
                                <option value="date-desc">Date (Latest First)</option>
                                <option value="price-asc">Price (Low to High)</option>
                                <option value="price-desc">Price (High to Low)</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                            </select>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Quick Filters
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['This Weekend', 'This Month', 'Free Events', 'Under €50'].map((filter) => (
                                <button
                                    key={filter}
                                    className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 dark:hover:bg-purple-900/30 transition-all text-sm"
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
