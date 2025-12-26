'use client'

import React, { useState, useMemo } from 'react'
import { Stage, Layer, Rect, Circle, Text, Group, Line, Arc } from 'react-konva'

interface VenueSelectionProps {
    width: number
    height: number
    venueWidth?: number   // Actual venue size in pixels
    venueHeight?: number  // Actual venue size in pixels
    elements: any[] // The layout elements
    bookedSeatIds: string[] // IDs of seats that are already taken
    selectedSeatIds: string[] // IDs of seats currently selected by user
    onSeatToggle: (seatId: string) => void
}

export function VenueSelection({
    width,
    height,
    venueWidth,
    venueHeight,
    elements,
    bookedSeatIds,
    selectedSeatIds,
    onSeatToggle
}: VenueSelectionProps) {
    const [hoveredSeat, setHoveredSeat] = useState<string | null>(null)
    const stageRef = React.useRef<any>(null)

    // Calculate bounding box of all elements to auto-fit
    const { initialScale, initialX, initialY } = useMemo(() => {
        if (elements.length === 0) return { initialScale: 1, initialX: 0, initialY: 0 }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

        elements.forEach(el => {
            if (el.hidden) return
            const w = el.width || (el.radius ? el.radius * 2 : 50)
            const h = el.height || (el.radius ? el.radius * 2 : 50)
            const left = el.x - w / 2
            const right = el.x + w / 2
            const top = el.y - h / 2
            const bottom = el.y + h / 2

            minX = Math.min(minX, left)
            minY = Math.min(minY, top)
            maxX = Math.max(maxX, right)
            maxY = Math.max(maxY, bottom)
        })

        // Use venue dimensions if provided, otherwise use bounding box
        const contentWidth = venueWidth || (maxX - minX + 100)
        const contentHeight = venueHeight || (maxY - minY + 100)

        const padding = 40
        const scaleX = (width - padding * 2) / contentWidth
        const scaleY = (height - padding * 2) / contentHeight
        const fitScale = Math.min(scaleX, scaleY, 1)

        // Calculate initial position to center content
        const startX = venueWidth ? 0 : minX
        const startY = venueHeight ? 0 : minY
        const centerX = (width / 2) - (contentWidth / 2 + startX) * fitScale
        const centerY = (height / 2) - (contentHeight / 2 + startY) * fitScale

        return { initialScale: fitScale, initialX: centerX, initialY: centerY }
    }, [elements, width, height, venueWidth, venueHeight])

    // Zoom and pan state
    const [stageScale, setStageScale] = useState(initialScale)
    const [stagePos, setStagePos] = useState({ x: initialX, y: initialY })

    // Update when initial values change
    React.useEffect(() => {
        setStageScale(initialScale)
        setStagePos({ x: initialX, y: initialY })
    }, [initialScale, initialX, initialY])

    // Helper to determine seat color
    const getSeatColor = (el: any) => {
        if (bookedSeatIds.includes(el.id)) return '#6b7280'
        if (selectedSeatIds.includes(el.id)) return '#22c55e'
        if (el.section === 'VIP') return '#f59e0b'
        return '#818cf8'
    }

    const getHoverColor = (el: any) => {
        if (bookedSeatIds.includes(el.id)) return '#6b7280'
        if (selectedSeatIds.includes(el.id)) return '#16a34a'
        if (el.section === 'VIP') return '#d97706'
        return '#6366f1'
    }

    const getElementColor = (el: any) => {
        switch (el.type) {
            case 'stage': return '#7c3aed' // Purple
            case 'dancefloor': return '#ec4899' // Pink
            case 'dancefloor-circle': return '#ec489980' // Pink with transparency
            case 'bar': return '#f97316' // Orange
            case 'entry': return '#10b981' // Emerald
            case 'emergency': return '#ef4444' // Red
            case 'pillar': return '#64748b' // Gray
            case 'wall': return '#1f2937' // Gray-800
            case 'door': return '#854d0e' // Brown
            case 'window': return '#38bdf8' // Sky blue
            case 'stairs': return '#71717a' // Zinc
            case 'line': return '#94a3b8' // Slate
            default: return el.color || '#94a3b8'
        }
    }

    // Get table background color (lighter version to show table surface)
    const getTableColor = (el: any) => {
        if (el.section === 'VIP') return '#451a03' // Dark amber/brown for VIP tables
        return '#1e1b4b' // Dark indigo for regular tables
    }

    // Separate elements by type for layering
    const staticElements = elements.filter(el =>
        ['stage', 'dancefloor', 'bar', 'entry', 'pillar', 'wall', 'door', 'window', 'stairs', 'emergency', 'line'].includes(el.type) && !el.hidden
    )

    const circleElements = elements.filter(el =>
        el.type === 'dancefloor-circle' || el.type === 'pillar' && !el.hidden
    )

    const compoundElements = elements.filter(el => el.type === 'compound' && !el.hidden)

    const tables = elements.filter(el => el.type === 'table' && !el.hidden)
    const seats = elements.filter(el => el.type === 'seat' && !el.hidden)
    const textLabels = elements.filter(el => el.type === 'text' && !el.hidden)

    // Count booked/available seats per table
    const getTableStatus = (tableId: string) => {
        const tableSeats = seats.filter(s => s.tableId === tableId || s.id.startsWith(tableId.replace('table', 't').replace('vip-table', 'vip-t')))
        const bookedCount = tableSeats.filter(s => bookedSeatIds.includes(s.id)).length
        const selectedCount = tableSeats.filter(s => selectedSeatIds.includes(s.id)).length
        return {
            total: tableSeats.length,
            booked: bookedCount,
            selected: selectedCount,
            available: tableSeats.length - bookedCount
        }
    }

    // Render Door with swing arc
    const renderDoor = (el: any) => {
        const doorWidth = el.width || 50
        const doorHeight = el.height || 10
        const rotation = el.rotation || 0

        return (
            <Group
                key={el.id}
                x={el.x}
                y={el.y}
                rotation={rotation}
                scaleX={el.scaleX || 1}
                scaleY={el.scaleY || 1}
            >
                {/* Door leaf */}
                <Rect
                    x={0}
                    y={-doorHeight / 2}
                    width={doorWidth}
                    height={doorHeight}
                    fill="#854d0e"
                    stroke="#713f12"
                    strokeWidth={1}
                />
                {/* Swing arc */}
                <Arc
                    x={0}
                    y={0}
                    innerRadius={doorWidth - 2}
                    outerRadius={doorWidth}
                    angle={90}
                    rotation={0}
                    fill="transparent"
                    stroke="#854d0e"
                    strokeWidth={1}
                    dash={[4, 4]}
                />
            </Group>
        )
    }

    // Render Stairs with step lines
    const renderStairs = (el: any) => {
        const stairsWidth = el.width || 60
        const stairsHeight = el.height || 40
        const rotation = el.rotation || 0
        const numSteps = Math.max(3, Math.floor(stairsHeight / 10))
        const stepHeight = stairsHeight / numSteps

        const stepLines = []
        for (let i = 1; i < numSteps; i++) {
            stepLines.push(
                <Line
                    key={`step-${i}`}
                    points={[-stairsWidth / 2, -stairsHeight / 2 + i * stepHeight, stairsWidth / 2, -stairsHeight / 2 + i * stepHeight]}
                    stroke="#71717a"
                    strokeWidth={1}
                />
            )
        }

        return (
            <Group
                key={el.id}
                x={el.x}
                y={el.y}
                rotation={rotation}
                scaleX={el.scaleX || 1}
                scaleY={el.scaleY || 1}
            >
                <Rect
                    x={-stairsWidth / 2}
                    y={-stairsHeight / 2}
                    width={stairsWidth}
                    height={stairsHeight}
                    fill="transparent"
                    stroke="#71717a"
                    strokeWidth={2}
                />
                {stepLines}
            </Group>
        )
    }

    // Zoom handlers
    const handleZoomIn = () => {
        const newScale = Math.min(stageScale * 1.3, 10)
        // Zoom towards center
        const centerX = width / 2
        const centerY = height / 2
        const mouseX = (centerX - stagePos.x) / stageScale
        const mouseY = (centerY - stagePos.y) / stageScale
        setStagePos({
            x: centerX - mouseX * newScale,
            y: centerY - mouseY * newScale
        })
        setStageScale(newScale)
    }

    const handleZoomOut = () => {
        const newScale = Math.max(stageScale / 1.3, 0.05)
        // Zoom towards center
        const centerX = width / 2
        const centerY = height / 2
        const mouseX = (centerX - stagePos.x) / stageScale
        const mouseY = (centerY - stagePos.y) / stageScale
        setStagePos({
            x: centerX - mouseX * newScale,
            y: centerY - mouseY * newScale
        })
        setStageScale(newScale)
    }

    const handleFit = () => {
        setStageScale(initialScale)
        setStagePos({ x: initialX, y: initialY })
    }

    const handleWheel = (e: any) => {
        e.evt.preventDefault()

        const stage = e.target.getStage()
        const pointer = stage.getPointerPosition()
        if (!pointer) return

        const scaleBy = 1.1
        const oldScale = stageScale
        const newScale = e.evt.deltaY > 0
            ? Math.max(oldScale / scaleBy, 0.05)
            : Math.min(oldScale * scaleBy, 10)

        // Calculate mouse position in content coordinates
        const mouseX = (pointer.x - stagePos.x) / oldScale
        const mouseY = (pointer.y - stagePos.y) / oldScale

        // Calculate new position to keep point under mouse stationary
        const newX = pointer.x - mouseX * newScale
        const newY = pointer.y - mouseY * newScale

        setStagePos({ x: newX, y: newY })
        setStageScale(newScale)
    }

    const handleDragEnd = (e: any) => {
        setStagePos({ x: e.target.x(), y: e.target.y() })
    }

    return (
        <div className="border-2 border-purple-500/30 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center p-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-amber-300"></div>
                    <span className="text-white/80">VIP Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-400 border-2 border-indigo-300"></div>
                    <span className="text-white/80">Regular Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-300"></div>
                    <span className="text-white/80">Your Selection</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-500 border-2 border-gray-400"></div>
                    <span className="text-white/80">Already Booked</span>
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 mb-3">
                <button
                    onClick={handleZoomOut}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                >
                    −
                </button>
                <span className="text-white/70 text-sm min-w-[60px] text-center">
                    {Math.round(stageScale * 100)}%
                </span>
                <button
                    onClick={handleZoomIn}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                >
                    +
                </button>
                <button
                    onClick={handleFit}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors ml-2"
                >
                    Fit
                </button>
            </div>

            {/* Booked Seats Counter */}
            {bookedSeatIds.length > 0 && (
                <div className="mb-3 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <span className="text-red-300 text-sm">
                        ⚠️ {bookedSeatIds.length} seat(s) already booked by others
                    </span>
                </div>
            )}

            <Stage
                ref={stageRef}
                width={width}
                height={height}
                draggable
                x={stagePos.x}
                y={stagePos.y}
                scaleX={stageScale}
                scaleY={stageScale}
                onDragEnd={handleDragEnd}
                onWheel={handleWheel}
                style={{ backgroundColor: '#ffffff', borderRadius: '12px', cursor: 'grab', border: '1px solid #e5e7eb' }}
            >
                <Layer>
                    {/* Static Elements (Stage, Dance Floor, Bar, Entry, Walls, etc.) */}
                    {staticElements.map((el) => {
                        // Special rendering for specific types
                        if (el.type === 'door') return renderDoor(el)
                        if (el.type === 'stairs') return renderStairs(el)

                        // Line element
                        if (el.type === 'line') {
                            return (
                                <Rect
                                    key={el.id}
                                    x={el.x - (el.width || 100) / 2}
                                    y={el.y - (el.height || 3) / 2}
                                    width={el.width || 100}
                                    height={el.height || 3}
                                    fill={el.color || '#94a3b8'}
                                    rotation={el.rotation || 0}
                                />
                            )
                        }

                        // Window element
                        if (el.type === 'window') {
                            return (
                                <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0}>
                                    <Rect
                                        x={-(el.width || 60) / 2}
                                        y={-(el.height || 8) / 2}
                                        width={el.width || 60}
                                        height={el.height || 8}
                                        fill="#38bdf8"
                                        stroke="#0284c7"
                                        strokeWidth={1}
                                    />
                                </Group>
                            )
                        }

                        // Emergency exit
                        if (el.type === 'emergency') {
                            return (
                                <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0}>
                                    <Rect
                                        x={-(el.width || 50) / 2}
                                        y={-(el.height || 10) / 2}
                                        width={el.width || 50}
                                        height={el.height || 10}
                                        fill="#22c55e"
                                        stroke="#16a34a"
                                        strokeWidth={2}
                                    />
                                    <Text
                                        x={-(el.width || 50) / 2}
                                        y={-(el.height || 10) / 2 + 2}
                                        width={el.width || 50}
                                        text="EXIT"
                                        fontSize={8}
                                        fill="white"
                                        align="center"
                                        fontStyle="bold"
                                    />
                                </Group>
                            )
                        }

                        // Default rectangular elements
                        return (
                            <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation || 0} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1}>
                                <Rect
                                    x={-(el.width || 100) / 2}
                                    y={-(el.height || 50) / 2}
                                    width={el.width || 100}
                                    height={el.height || 50}
                                    fill={getElementColor(el)}
                                    cornerRadius={el.type === 'dancefloor' ? 10 : 5}
                                    shadowBlur={8}
                                    shadowColor="black"
                                    shadowOpacity={0.3}
                                    stroke={el.type === 'dancefloor' ? '#ec4899' : undefined}
                                    strokeWidth={el.type === 'dancefloor' ? 2 : 0}
                                    dash={el.type === 'dancefloor' ? [10, 5] : undefined}
                                />
                                {el.label && (
                                    <Text
                                        x={-(el.width || 100) / 2}
                                        y={-8}
                                        width={el.width || 100}
                                        text={el.label}
                                        fontSize={12}
                                        fontStyle="bold"
                                        fill="white"
                                        align="center"
                                    />
                                )}
                            </Group>
                        )
                    })}

                    {/* Circle Elements (Dance floor circle, pillars) */}
                    {circleElements.map((el) => (
                        <Group key={el.id} x={el.x} y={el.y}>
                            <Circle
                                radius={el.radius || 50}
                                fill={el.type === 'dancefloor-circle' ? '#ec489960' : '#64748b'}
                                stroke={el.type === 'dancefloor-circle' ? '#ec4899' : '#475569'}
                                strokeWidth={2}
                                dash={el.type === 'dancefloor-circle' ? [10, 5] : undefined}
                            />
                            {el.label && (
                                <Text
                                    x={-(el.radius || 50)}
                                    y={-6}
                                    width={(el.radius || 50) * 2}
                                    text={el.label}
                                    fontSize={11}
                                    fill="white"
                                    align="center"
                                />
                            )}
                        </Group>
                    ))}

                    {/* Compound shapes */}
                    {compoundElements.map((el) => {
                        const childElements = elements.filter(e => el.children?.includes(e.id))
                        return (
                            <Group key={el.id} x={el.x} y={el.y}>
                                {childElements.map((child) => {
                                    const relX = child.x - el.x
                                    const relY = child.y - el.y
                                    const fillColor = el.color || child.color || '#ec4899'

                                    if (child.radius) {
                                        return (
                                            <Circle
                                                key={child.id}
                                                x={relX}
                                                y={relY}
                                                radius={child.radius}
                                                fill={`${fillColor}CC`}
                                            />
                                        )
                                    }
                                    return (
                                        <Rect
                                            key={child.id}
                                            x={relX - (child.width || 100) / 2}
                                            y={relY - (child.height || 100) / 2}
                                            width={child.width || 100}
                                            height={child.height || 100}
                                            fill={`${fillColor}CC`}
                                        />
                                    )
                                })}
                            </Group>
                        )
                    })}

                    {/* Tables (background only - seats are clickable) */}
                    {tables.map((el) => {
                        const isRound = el.shape === 'round' || el.shape === 'circle'
                        const tableStatus = getTableStatus(el.id)

                        if (isRound) {
                            const radius = (el.width || 80) / 2
                            return (
                                <Group key={el.id}>
                                    <Circle
                                        x={el.x}
                                        y={el.y}
                                        radius={radius}
                                        fill={getTableColor(el)}
                                        stroke={el.section === 'VIP' ? '#f59e0b' : '#818cf8'}
                                        strokeWidth={2}
                                        shadowBlur={5}
                                        shadowColor="black"
                                    />
                                    {/* Table Label */}
                                    <Text
                                        x={el.x - 25}
                                        y={el.y - 15}
                                        width={50}
                                        text={el.label}
                                        fontSize={10}
                                        fill="white"
                                        align="center"
                                        fontStyle="bold"
                                    />
                                    {/* Available count */}
                                    <Text
                                        x={el.x - 25}
                                        y={el.y + 5}
                                        width={50}
                                        text={`${tableStatus.available}/${tableStatus.total}`}
                                        fontSize={9}
                                        fill={tableStatus.available === 0 ? '#ef4444' : '#22c55e'}
                                        align="center"
                                    />
                                </Group>
                            )
                        }

                        // Rectangular table
                        const tableWidth = el.width || 100
                        const tableHeight = el.height || 60

                        return (
                            <Group
                                key={el.id}
                                x={el.x}
                                y={el.y}
                                rotation={el.rotation || 0}
                                scaleX={el.scaleX || 1}
                                scaleY={el.scaleY || 1}
                            >
                                <Rect
                                    x={-tableWidth / 2}
                                    y={-tableHeight / 2}
                                    width={tableWidth}
                                    height={tableHeight}
                                    fill={getTableColor(el)}
                                    cornerRadius={5}
                                    stroke={el.section === 'VIP' ? '#f59e0b' : '#818cf8'}
                                    strokeWidth={2}
                                    shadowBlur={5}
                                    shadowColor="black"
                                />
                                {/* Table Label */}
                                <Text
                                    x={-tableWidth / 2}
                                    y={-12}
                                    width={tableWidth}
                                    text={el.label}
                                    fontSize={10}
                                    fill="white"
                                    align="center"
                                    fontStyle="bold"
                                />
                                {/* Available count */}
                                <Text
                                    x={-tableWidth / 2}
                                    y={2}
                                    width={tableWidth}
                                    text={`${tableStatus.available}/${tableStatus.total} free`}
                                    fontSize={8}
                                    fill={tableStatus.available === 0 ? '#ef4444' : '#22c55e'}
                                    align="center"
                                />
                            </Group>
                        )
                    })}

                    {/* Individual Seats (Clickable) */}
                    {seats.map((el) => {
                        const isBooked = bookedSeatIds.includes(el.id)
                        const isSelected = selectedSeatIds.includes(el.id)
                        const isHovered = hoveredSeat === el.id
                        const radius = 12

                        return (
                            <Group key={el.id}>
                                {/* Seat circle */}
                                <Circle
                                    x={el.x}
                                    y={el.y}
                                    radius={radius}
                                    fill={isHovered && !isBooked ? getHoverColor(el) : getSeatColor(el)}
                                    opacity={isBooked ? 0.5 : 1}
                                    stroke={isSelected ? '#fff' : isBooked ? '#4b5563' : 'transparent'}
                                    strokeWidth={isSelected ? 3 : isBooked ? 2 : 0}
                                    shadowBlur={isSelected ? 12 : isHovered ? 8 : 3}
                                    shadowColor={isSelected ? '#22c55e' : 'black'}
                                    onClick={() => !isBooked && onSeatToggle(el.id)}
                                    onTap={() => !isBooked && onSeatToggle(el.id)}
                                    onMouseEnter={e => {
                                        setHoveredSeat(el.id)
                                        if (!isBooked) {
                                            const container = e.target.getStage()?.container()
                                            if (container) container.style.cursor = 'pointer'
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        setHoveredSeat(null)
                                        const container = e.target.getStage()?.container()
                                        if (container) container.style.cursor = 'default'
                                    }}
                                />
                                {/* Seat label */}
                                <Text
                                    x={el.x - 10}
                                    y={el.y - 4}
                                    width={20}
                                    text={String(el.label || el.seatNumber || '')}
                                    fontSize={8}
                                    fill={isBooked ? '#9ca3af' : 'white'}
                                    align="center"
                                    fontStyle="bold"
                                    listening={false}
                                />
                                {/* Booked X mark */}
                                {isBooked && (
                                    <Text
                                        x={el.x - 5}
                                        y={el.y - 6}
                                        text="✗"
                                        fontSize={12}
                                        fill="#ef4444"
                                        fontStyle="bold"
                                        listening={false}
                                    />
                                )}
                            </Group>
                        )
                    })}

                    {/* Text Labels */}
                    {textLabels.map((el) => (
                        <Text
                            key={el.id}
                            x={el.x}
                            y={el.y}
                            text={el.label || ''}
                            fontSize={el.fontSize || 14}
                            fill="#e2e8f0"
                            fontStyle="bold"
                        />
                    ))}
                </Layer>
            </Stage>

            {/* Selection Info */}
            <div className="mt-4 text-center space-y-2">
                <p className="text-white/70 text-sm">
                    Click on individual seats to select them. Each seat can be selected separately.
                </p>
                {selectedSeatIds.length > 0 && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2">
                        <p className="text-green-400 font-semibold">
                            ✓ {selectedSeatIds.length} seat(s) selected
                        </p>
                        <p className="text-green-300/80 text-xs mt-1">
                            {selectedSeatIds.map(id => {
                                const seat = elements.find(e => e.id === id)
                                return seat?.label || id
                            }).join(', ')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
