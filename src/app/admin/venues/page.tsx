
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi'
import { formatDate } from '@/lib/utils'

interface VenueLayout {
    id: string
    name: string
    description: string | null
    events: { id: string; title: string }[]
    updatedAt: string
}

export default function VenuesPage() {
    const router = useRouter()
    const [layouts, setLayouts] = useState<VenueLayout[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [newLayoutName, setNewLayoutName] = useState('')
    const [newLayoutDescription, setNewLayoutDescription] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchLayouts()
    }, [])

    const fetchLayouts = async () => {
        try {
            const res = await fetch('/api/admin/venues')
            const data = await res.json()
            if (res.ok) {
                setLayouts(data)
            }
        } catch (error) {
            console.error('Failed to fetch layouts', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteLayout = async (id: string) => {
        if (!confirm('Are you sure? This cannot be undone.')) return

        try {
            const res = await fetch(`/api/admin/venues/${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                fetchLayouts()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete')
            }
        } catch (error) {
            alert('Failed to delete layout')
        }
    }

    const openModal = () => {
        setNewLayoutName('')
        setNewLayoutDescription('')
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setNewLayoutName('')
        setNewLayoutDescription('')
    }

    const createNew = async () => {
        if (!newLayoutName.trim()) return

        setCreating(true)
        try {
            const res = await fetch('/api/admin/venues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newLayoutName.trim(),
                    description: newLayoutDescription.trim() || 'New empty layout',
                    elements: []
                }),
            })

            if (res.ok) {
                const newLayout = await res.json()
                closeModal()
                router.push(`/admin/venues/builder/${newLayout.id}`)
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to create layout')
            }
        } catch (error) {
            alert('Failed to create layout')
        } finally {
            setCreating(false)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Venue Layouts</h1>
                    <p className="text-gray-500 mt-1">Manage seating charts and venue maps</p>
                </div>
                <Button onClick={openModal}>
                    <HiPlus className="mr-2 h-4 w-4" />
                    New Layout
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {layouts.map((layout) => (
                    <Card key={layout.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold">{layout.name}</CardTitle>
                            <div className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/admin/venues/builder/${layout.id}`)}
                                >
                                    <HiPencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteLayout(layout.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <HiTrash className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                {layout.description || 'No description'}
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Used in</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {layout.events?.length || 0} events
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Last updated</span>
                                    <span>{formatDate(layout.updatedAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {layouts.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed">
                        <p className="text-gray-500 mb-4">No layouts created yet.</p>
                        <Button onClick={openModal}>
                            <HiPlus className="mr-2 h-4 w-4" />
                            Create your first layout
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Layout Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Layout</h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <HiX className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Layout Name *
                                </label>
                                <input
                                    type="text"
                                    value={newLayoutName}
                                    onChange={(e) => setNewLayoutName(e.target.value)}
                                    placeholder="e.g. Grand Hall, Main Stage"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newLayoutDescription}
                                    onChange={(e) => setNewLayoutDescription(e.target.value)}
                                    placeholder="Brief description of this layout..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={closeModal} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={createNew}
                                disabled={!newLayoutName.trim() || creating}
                                className="flex-1"
                            >
                                {creating ? 'Creating...' : 'Create Layout'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
