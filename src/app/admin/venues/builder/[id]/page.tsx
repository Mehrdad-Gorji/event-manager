'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HiSave, HiArrowLeft, HiUpload } from 'react-icons/hi'
import { VenueCanvas } from '@/components/venue/venue-canvas'
import { VenueToolbox } from '@/components/venue/venue-toolbox'
import DxfParser from 'dxf-parser'

export default function VenueBuilderPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [layout, setLayout] = useState<any>(null)
    const [elements, setElements] = useState<any[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [dimensions, setDimensions] = useState({ width: 20, depth: 15 })
    const [scale, setScale] = useState(1)
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
    const [dxfData, setDxfData] = useState<any>(null)
    const [dxfSettings, setDxfSettings] = useState({ opacity: 0.5, scale: 50, offsetX: 0, offsetY: 0 })
    const dxfInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (params.id) fetchLayout()
    }, [params.id])

    const containerRef = useRef<HTMLDivElement>(null)
    const [viewportDims, setViewportDims] = useState({ width: 800, height: 600 })
    const hasCentered = useRef(false)

    useEffect(() => {
        if (!containerRef.current) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                if (width > 0 && height > 0) {
                    setViewportDims({ width, height })
                }
            }
        })

        resizeObserver.observe(containerRef.current)

        return () => resizeObserver.disconnect()
    }, [loading])

    // Create specific effect to center when layout loads
    useEffect(() => {
        // Ensure we center only when we have valid data and valid viewport
        // And ONLY DO IT ONCE
        if (!hasCentered.current && layout && elements.length > 0 && viewportDims.width > 0 && viewportDims.height > 0) {
            handleFitToScreen()
            hasCentered.current = true
        }
    }, [layout, viewportDims.width, viewportDims.height])



    const fetchLayout = async () => {
        try {
            const res = await fetch(`/api/admin/venues/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setLayout(data)
                setDimensions({ width: data.width || 20, depth: data.depth || 15 })
                setElements(Array.isArray(data.elements) ? data.elements : [])
            }
        } catch (error) {
            console.error('Failed to load layout')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/venues/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...dimensions,
                    elements: elements
                })
            })

            if (!res.ok) throw new Error('Failed to save')
            alert('Layout saved successfully!')
        } catch (error) {
            alert('Failed to save layout')
        } finally {
            setSaving(false)
        }
    }

    const handleAddElement = (el: any | any[]) => {
        if (Array.isArray(el)) {
            setElements(prev => [...prev, ...el])
            setSelectedIds(el.map(e => e.id))
        } else {
            setElements(prev => [...prev, el])
            setSelectedIds([el.id])
        }
    }

    const handleSelect = (ids: string[]) => {
        setSelectedIds(ids)
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return

        const idsToDelete = new Set<string>()

        selectedIds.forEach(id => {
            const el = elements.find(e => e.id === id)
            if (!el) return

            if (el.groupId) {
                elements.filter(e => e.groupId === el.groupId).forEach(e => idsToDelete.add(e.id))
            } else {
                idsToDelete.add(id)
            }
        })

        setElements(prev => prev.filter(e => !idsToDelete.has(e.id)))
        setSelectedIds([])
    }

    const handleStageChange = (newScale: number, newPos: { x: number, y: number }) => {
        setScale(newScale)
        setStagePos(newPos)
    }

    const handleZoomIn = () => {
        setScale(prev => prev * 1.1)
    }

    const handleZoomOut = () => {
        setScale(prev => prev / 1.1)
    }

    const handleFitToScreen = () => {
        const venueWidthPx = (dimensions.width || 20) * 50
        const venueHeightPx = (dimensions.depth || 15) * 50

        const padding = 50
        // Use viewportDims state which has fallback, instead of ref directly
        const viewportWidth = viewportDims.width
        const viewportHeight = viewportDims.height

        // Scale to fit venue in viewport with padding
        const scaleX = (viewportWidth - padding * 2) / venueWidthPx
        const scaleY = (viewportHeight - padding * 2) / venueHeightPx
        const newScale = Math.min(scaleX, scaleY, 1) // Don't zoom in more than 100% initially

        // Center the venue
        const newX = (viewportWidth - venueWidthPx * newScale) / 2
        const newY = (viewportHeight - venueHeightPx * newScale) / 2

        setScale(newScale)
        setStagePos({ x: newX, y: newY })
    }

    if (loading) return <div className="h-screen flex items-center justify-center">Loading Builder...</div>
    if (!layout) return <div className="p-8">Layout not found</div>

    const primarySelectedId = selectedIds[0] || null
    const primarySelected = primarySelectedId ? elements.find(e => e.id === primarySelectedId) : null

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Toolbar Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 z-10 relative">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/admin/venues')}>
                        <HiArrowLeft className="mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg">{layout.name}</h1>
                        <p className="text-xs text-gray-500">
                            {selectedIds.length === 0 ? 'Drag items to position them' :
                                selectedIds.length === 1 ? '1 item selected' :
                                    `${selectedIds.length} items selected (Shift+Click to select more)`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 border-l border-r border-gray-200 dark:border-gray-800 mx-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-500 uppercase">Width (m)</label>
                        <input
                            type="number"
                            className="w-16 h-7 text-sm border rounded px-1"
                            value={dimensions.width}
                            onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-500 uppercase">Depth (m)</label>
                        <input
                            type="number"
                            className="w-16 h-7 text-sm border rounded px-1"
                            value={dimensions.depth}
                            onChange={(e) => setDimensions(prev => ({ ...prev, depth: Number(e.target.value) }))}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md mr-2">
                        <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-7 px-2">-</Button>
                        <span className="text-xs px-1 w-12 text-center">{Math.round(scale * 100)}%</span>
                        <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-7 px-2">+</Button>
                        <Button variant="ghost" size="sm" onClick={handleFitToScreen} className="h-7 px-2 text-[10px]">Fit</Button>
                    </div>

                    {/* DXF Upload */}
                    <input
                        ref={dxfInputRef}
                        type="file"
                        accept=".dxf"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = (event) => {
                                try {
                                    const parser = new DxfParser()
                                    const dxf = parser.parseSync(event.target?.result as string)
                                    setDxfData(dxf)
                                    alert('DXF loaded successfully!')
                                } catch (err) {
                                    console.error('DXF parse error:', err)
                                    alert('Failed to parse DXF file')
                                }
                            }
                            reader.readAsText(file)
                        }}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dxfInputRef.current?.click()}
                        className="h-7 px-2 text-xs"
                    >
                        <HiUpload className="mr-1" /> {dxfData ? 'Replace DXF' : 'Import DXF'}
                    </Button>
                    {dxfData && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDxfData(null)}
                            className="h-7 px-2 text-xs text-red-500"
                        >
                            Clear
                        </Button>
                    )}

                    {selectedIds.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="mr-2">
                            Delete {selectedIds.length > 1 ? `(${selectedIds.length})` : 'Selected'}
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving}>
                        <HiSave className="mr-2" /> {saving ? 'Saving...' : 'Save Layout'}
                    </Button>
                </div>
            </div>

            {/* Editor Workspace - Infinite Canvas Container */}
            {/* Editor Workspace - Infinite Canvas Container */}
            <div className="flex-1 flex relative h-full min-h-[600px] overflow-hidden">
                {/* Visual Canvas Area */}
                <div ref={containerRef} className="flex-1 relative bg-white dark:bg-gray-950">
                    <div className="absolute inset-0">
                        <VenueCanvas
                            width={viewportDims.width}
                            height={viewportDims.height}
                            venueWidth={(dimensions.width || 20) * 50}
                            venueHeight={(dimensions.depth || 15) * 50}
                            elements={elements}
                            selectedIds={selectedIds}
                            onSelect={handleSelect}
                            onChange={setElements}
                            onDelete={handleDeleteSelected}
                            scale={scale}
                            stagePos={stagePos}
                            onStageChange={handleStageChange}
                            dxfData={dxfData}
                            dxfSettings={dxfSettings}
                        />
                    </div>
                </div>

                {/* Right Sidebar Properties/Tools */}
                <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-y-auto z-10 shadow-xl">
                    <VenueToolbox
                        onAddElement={handleAddElement}
                        selectedIds={selectedIds}
                        elements={elements}
                        onUpdateElements={setElements}
                        onDelete={handleDeleteSelected}
                    />

                    {/* Properties Panel - for single selection */}
                    {selectedIds.length === 1 && primarySelected && (
                        <div className="mt-8 pt-4 border-t space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">
                                Properties
                            </h3>

                            <div className="space-y-3">
                                <div className="text-xs text-gray-400 font-mono mb-2">
                                    ID: {primarySelectedId?.slice(0, 8)}...
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                                    <input
                                        type="text"
                                        value={primarySelected.label || ''}
                                        onChange={(e) => {
                                            setElements(prev => prev.map(el =>
                                                el.id === primarySelectedId ? { ...el, label: e.target.value } : el
                                            ))
                                        }}
                                        className="w-full text-sm border rounded px-2 py-1"
                                        placeholder="e.g. A1 or Stage"
                                    />
                                </div>

                                {primarySelected.type === 'seat' && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Section / Category</label>
                                        <input
                                            type="text"
                                            value={primarySelected.section || ''}
                                            onChange={(e) => {
                                                setElements(prev => prev.map(el =>
                                                    el.id === primarySelectedId ? { ...el, section: e.target.value } : el
                                                ))
                                            }}
                                            className="w-full text-sm border rounded px-2 py-1"
                                            placeholder="e.g. VIP, General"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            Match this with a Ticket Tier section matcher to set price.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['#818cf8', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                                            <button
                                                key={c}
                                                className={`w-6 h-6 rounded-full border ${primarySelected.color === c ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => {
                                                    setElements(prev => prev.map(el =>
                                                        el.id === primarySelectedId ? { ...el, color: c } : el
                                                    ))
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Multi-selection info */}
                    {selectedIds.length > 1 && (
                        <div className="mt-8 pt-4 border-t space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">
                                Multi-Selection
                            </h3>
                            <p className="text-sm text-gray-500">
                                {selectedIds.length} items selected
                            </p>
                            <p className="text-xs text-gray-400">
                                Drag any selected item to move all together.
                                Use Edit Tools to transform all selected items.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
