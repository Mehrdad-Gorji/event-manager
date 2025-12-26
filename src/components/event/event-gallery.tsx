'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { HiX, HiChevronLeft, HiChevronRight, HiPhotograph } from 'react-icons/hi'

interface GalleryImage {
    id: string
    imageUrl: string
    caption: string | null
    isHero: boolean
}

interface EventGalleryProps {
    eventId: string
}

export function EventGallery({ eventId }: EventGalleryProps) {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    useEffect(() => {
        fetchGallery()
    }, [eventId])

    const fetchGallery = async () => {
        try {
            const res = await fetch(`/api/gallery?eventId=${eventId}`)
            const data = await res.json()
            setImages(data)
        } catch (error) {
            console.error('Failed to fetch gallery:', error)
        } finally {
            setLoading(false)
        }
    }

    const openLightbox = (index: number) => {
        setLightboxIndex(index)
        document.body.style.overflow = 'hidden'
    }

    const closeLightbox = () => {
        setLightboxIndex(null)
        document.body.style.overflow = 'auto'
    }

    const navigateLightbox = (direction: 'prev' | 'next') => {
        if (lightboxIndex === null) return

        if (direction === 'prev') {
            setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1)
        } else {
            setLightboxIndex(lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1)
        }
    }

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return

            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowLeft') navigateLightbox('prev')
            if (e.key === 'ArrowRight') navigateLightbox('next')
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [lightboxIndex])

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
            </div>
        )
    }

    if (images.length === 0) {
        return null // Don't show empty gallery section
    }

    return (
        <>
            {/* Gallery Grid */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HiPhotograph className="w-5 h-5 text-purple-600" />
                    Event Gallery
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {images.slice(0, 8).map((image, index) => (
                        <div
                            key={image.id}
                            className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                            onClick={() => openLightbox(index)}
                        >
                            <Image
                                src={image.imageUrl}
                                alt={image.caption || 'Event image'}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                                    View
                                </span>
                            </div>
                            {index === 7 && images.length > 8 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">+{images.length - 8}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors z-10"
                    >
                        <HiX className="w-6 h-6" />
                    </button>

                    {/* Navigation */}
                    <button
                        onClick={() => navigateLightbox('prev')}
                        className="absolute left-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <HiChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={() => navigateLightbox('next')}
                        className="absolute right-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <HiChevronRight className="w-8 h-8" />
                    </button>

                    {/* Image */}
                    <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4">
                        <Image
                            src={images[lightboxIndex].imageUrl}
                            alt={images[lightboxIndex].caption || 'Event image'}
                            fill
                            className="object-contain"
                        />
                    </div>

                    {/* Caption and counter */}
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                        {images[lightboxIndex].caption && (
                            <p className="text-lg mb-2">{images[lightboxIndex].caption}</p>
                        )}
                        <p className="text-sm text-white/70">
                            {lightboxIndex + 1} / {images.length}
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
