'use client'

import { useState } from 'react'
import { HiHeart, HiOutlineHeart } from 'react-icons/hi'

interface WishlistButtonProps {
    eventId: string
    initialIsWishlisted?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function WishlistButton({
    eventId,
    initialIsWishlisted = false,
    size = 'md',
    className = ''
}: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted)
    const [isLoading, setIsLoading] = useState(false)

    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3'
    }

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    }

    const handleToggle = async () => {
        setIsLoading(true)

        try {
            if (isWishlisted) {
                const res = await fetch(`/api/wishlist?eventId=${eventId}`, {
                    method: 'DELETE'
                })
                if (res.ok) {
                    setIsWishlisted(false)
                }
            } else {
                const res = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId })
                })
                if (res.ok) {
                    setIsWishlisted(true)
                }
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`
        ${sizeClasses[size]}
        rounded-full transition-all duration-300 
        ${isWishlisted
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                    : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-white shadow-lg'
                }
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-110 active:scale-95
        ${className}
      `}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {isLoading ? (
                <svg
                    className={`animate-spin ${iconSizes[size]}`}
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : isWishlisted ? (
                <HiHeart className={`${iconSizes[size]} animate-pulse`} />
            ) : (
                <HiOutlineHeart className={iconSizes[size]} />
            )}
        </button>
    )
}
