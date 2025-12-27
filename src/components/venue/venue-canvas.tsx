
'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Rect, Circle, Text, Group, Transformer, Arc, Line } from 'react-konva'
import useImage from 'use-image'
import { DxfRenderer } from './dxf-renderer'

// Helper for IDs
const generateId = () => Math.random().toString(36).substr(2, 9)

interface VenueCanvasProps {
    width: number
    height: number
    venueWidth?: number
    venueHeight?: number
    elements: any[]
    selectedIds: string[]
    onSelect: (ids: string[], addToSelection?: boolean) => void
    onChange: (elements: any[]) => void
    onDelete?: () => void
    scale: number
    stagePos: { x: number, y: number }
    onStageChange: (scale: number, pos: { x: number, y: number }) => void
    dxfData?: any // Parsed DXF data for background layer
    dxfSettings?: { opacity: number; scale: number; offsetX: number; offsetY: number }
    snapEnabled?: boolean // Enable snap to grid and objects
}

// Snap configuration
const SNAP_THRESHOLD = 15 // Pixels - distance within which snap activates
const GRID_SIZE = 50 // Visual Grid cell size (1 meter)
const SNAP_GRID_SIZE = 5 // Snap Grid size (10cm)

// Helper function to snap to grid
const snapToGrid = (value: number, gridSize: number): number => {
    return Math.round(value / gridSize) * gridSize
}

// Helper to rotate a point around a center
const rotatePoint = (point: { x: number, y: number }, center: { x: number, y: number }, rotationDeg: number) => {
    if (!rotationDeg) return point
    const rad = (rotationDeg * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const dx = point.x - center.x
    const dy = point.y - center.y
    return {
        x: center.x + (dx * cos - dy * sin),
        y: center.y + (dx * sin + dy * cos)
    }
}

// Helper to get snap points for an element (center, corners, edges)
const getElementSnapPoints = (el: any) => {
    const points: { x: number; y: number, type: string }[] = []
    const center = { x: el.x, y: el.y }

    // Always snap to center
    points.push({ ...center, type: 'center' })

    if (el.radius) {
        // Circle element - center only (already added)
    } else if (el.width && el.height) {
        // Rectangle element (Wall, Table, etc.)
        const halfW = el.width / 2
        const halfH = el.height / 2
        const rotation = el.rotation || 0

        // Define unrotated corners relative to center
        const corners = [
            { x: el.x - halfW, y: el.y - halfH }, // Top-left
            { x: el.x + halfW, y: el.y - halfH }, // Top-right
            { x: el.x + halfW, y: el.y + halfH }, // Bottom-right
            { x: el.x - halfW, y: el.y + halfH }  // Bottom-left
        ]

        // Define unrotated midpoints
        const midpoints = [
            { x: el.x, y: el.y - halfH }, // Top
            { x: el.x + halfW, y: el.y }, // Right
            { x: el.x, y: el.y + halfH }, // Bottom
            { x: el.x - halfW, y: el.y }  // Left
        ]

        // Rotate and add corners
        corners.forEach(p => {
            const rotated = rotatePoint(p, center, rotation)
            points.push({ ...rotated, type: 'corner' })
        })

        // Rotate and add midpoints
        midpoints.forEach(p => {
            const rotated = rotatePoint(p, center, rotation)
            points.push({ ...rotated, type: 'edge' })
        })
    }

    return points
}

// Snap position to nearest grid or element
const applySnap = (
    pos: { x: number; y: number },
    elements: any[],
    draggedElement: any,
    threshold: number = SNAP_THRESHOLD
): { x: number; y: number; snappedX: boolean; snappedY: boolean } => {
    let resultX = pos.x
    let resultY = pos.y
    let snappedX = false
    let snappedY = false
    let minDist = threshold

    // 1. Snap to Grid (10cm = 5px)
    const gridSnappedX = snapToGrid(pos.x, SNAP_GRID_SIZE)
    const gridSnappedY = snapToGrid(pos.y, SNAP_GRID_SIZE)

    if (Math.abs(gridSnappedX - pos.x) <= threshold) {
        resultX = gridSnappedX
        snappedX = true
    }
    if (Math.abs(gridSnappedY - pos.y) <= threshold) {
        resultY = gridSnappedY
        snappedY = true
    }

    // 2. Snap to Objects (Corner-to-Corner "Auto Join")
    // Create a temporary element representing the dragged element at the new position
    // If draggedElement is not provided (e.g. initial load), skip object snap or use pos
    if (draggedElement) {
        const tempEl = { ...draggedElement, x: pos.x, y: pos.y }
        const mySnapPoints = getElementSnapPoints(tempEl)

        for (const el of elements) {
            if (el.id === draggedElement.id) continue

            const targetSnapPoints = getElementSnapPoints(el)

            for (const myPoint of mySnapPoints) {
                for (const targetPoint of targetSnapPoints) {
                    const dist = Math.sqrt(Math.pow(targetPoint.x - myPoint.x, 2) + Math.pow(targetPoint.y - myPoint.y, 2))

                    if (dist <= minDist) {
                        // Calculate the offset needed to align myPoint to targetPoint
                        const offsetX = targetPoint.x - myPoint.x
                        const offsetY = targetPoint.y - myPoint.y

                        // Apply this offset to the center position
                        resultX = pos.x + offsetX
                        resultY = pos.y + offsetY

                        minDist = dist
                        snappedX = true
                        snappedY = true
                    }
                }
            }
        }
    }

    return { x: resultX, y: resultY, snappedX, snappedY }
}

const CircleElement = ({ element, visualProps, isSelected, onSelect, onChange, onDragStart, onDragMove, snapFn }: any) => {
    const shapeRef = useRef<any>(null)
    const trRef = useRef<any>(null)

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current])
            trRef.current.getLayer()?.batchDraw()
        }
    }, [isSelected])

    return (
        <React.Fragment>
            <Circle
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                id={element.id}
                x={element.x}
                y={element.y}
                radius={element.radius || 15}
                rotation={element.rotation || 0}
                {...visualProps}
                draggable={!element.locked}
                onDragStart={onDragStart}
                onDragMove={onDragMove}
                onDragEnd={(e) => {
                    let finalX = e.target.x()
                    let finalY = e.target.y()

                    // Apply snap if function provided
                    if (snapFn) {
                        const snapped = snapFn({ x: finalX, y: finalY }, element)
                        finalX = snapped.x
                        finalY = snapped.y
                        // Move the Konva shape to snapped position
                        e.target.x(finalX)
                        e.target.y(finalY)
                    }

                    onChange({
                        id: element.id,
                        x: finalX,
                        y: finalY,
                    })
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current
                    const scaleX = node.scaleX()

                    node.scaleX(1)
                    node.scaleY(1)

                    // Only pass back geometry changes
                    onChange({
                        id: element.id,
                        x: node.x(),
                        y: node.y(),
                        radius: Math.max(5, (element.radius || 15) * scaleX),
                        rotation: node.rotation(),
                    })
                }}
            />
            {element.label && (
                <Text
                    text={element.label}
                    x={element.x}
                    y={element.y}
                    fontSize={12}
                    fontStyle="bold"
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth={0.5}
                    align="center"
                    verticalAlign="middle"
                    offsetX={50} // Rough centering assumption
                    offsetY={6}
                    width={100}
                    listening={false}
                />
            )}
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox
                        }
                        return newBox
                    }}
                />
            )}
        </React.Fragment>
    )
}

const RectShape = ({ element, visualProps, isSelected, onSelect, onChange, onDragStart, onDragMove, snapFn }: any) => {
    const shapeRef = useRef<any>(null)
    const trRef = useRef<any>(null)
    const elWidth = element.width || 80
    const elHeight = element.height || 60

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current])
            trRef.current.getLayer()?.batchDraw()
        }
    }, [isSelected])


    return (
        <React.Fragment>
            <Rect
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                id={element.id}
                x={element.x}
                y={element.y}
                width={elWidth}
                height={elHeight}
                rotation={element.rotation || 0}
                offsetX={elWidth / 2}
                offsetY={elHeight / 2}
                {...visualProps}
                draggable={!element.locked}
                onDragStart={onDragStart}
                onDragMove={onDragMove}
                onDragEnd={(e) => {
                    let finalX = e.target.x()
                    let finalY = e.target.y()

                    // Apply snap if function provided
                    if (snapFn) {
                        const snapped = snapFn({ x: finalX, y: finalY }, element)
                        finalX = snapped.x
                        finalY = snapped.y
                        // Move the Konva shape to snapped position
                        e.target.x(finalX)
                        e.target.y(finalY)
                    }

                    onChange({
                        id: element.id,
                        x: finalX,
                        y: finalY,
                    })
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current
                    const scaleX = node.scaleX()
                    const scaleY = node.scaleY()

                    node.scaleX(1)
                    node.scaleY(1)
                    // Only pass back geometry changes
                    onChange({
                        id: element.id,
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(5, elWidth * scaleX),
                        height: Math.max(5, elHeight * scaleY),
                        rotation: node.rotation(),
                    })
                }}
            />
            {element.label && (
                <Text
                    text={element.label}
                    x={element.x}
                    y={element.y}
                    fontSize={12}
                    fontStyle="bold"
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth={0.5}
                    align="center"
                    verticalAlign="middle"
                    offsetX={50} // Rough centering
                    offsetY={6}
                    width={100}
                    rotation={element.rotation || 0}
                    listening={false}
                />
            )}
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox
                        }
                        return newBox
                    }}
                />
            )}
        </React.Fragment>
    )
}

export function VenueCanvas({
    width,
    height,
    venueWidth = 1000,
    venueHeight = 800,
    elements,
    selectedIds,
    onSelect,
    onChange,
    onDelete,
    scale,
    stagePos,
    onStageChange,
    dxfData,
    dxfSettings = { opacity: 0.5, scale: 50, offsetX: 0, offsetY: 0 },
    snapEnabled = true
}: VenueCanvasProps) {
    const stageRef = useRef<any>(null)

    // Track drag start positions for multi-element drag
    const dragStartPos = useRef<{ x: number, y: number } | null>(null)
    const elementStartPositions = useRef<Map<string, { x: number, y: number }>>(new Map())

    // Box selection state
    const [selectionBox, setSelectionBox] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null)
    const isSelecting = useRef(false)

    // Delete key handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
                // Prevent backspace from navigating back
                if (e.key === 'Backspace') {
                    const target = e.target as HTMLElement
                    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                        return // Allow backspace in input fields
                    }
                    e.preventDefault()
                }
                onDelete?.()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedIds, onDelete])

    const handleMouseDown = (e: any) => {
        // Only start box selection if clicking on empty stage area
        const clickedOnEmpty = e.target === e.target.getStage()
        if (clickedOnEmpty && !e.evt.shiftKey) {
            const stage = e.target.getStage()
            const pointer = stage.getPointerPosition()

            // Convert to stage coordinates (accounting for scale and position)
            const x = (pointer.x - stagePos.x) / scale
            const y = (pointer.y - stagePos.y) / scale

            isSelecting.current = true
            setSelectionBox({ x1: x, y1: y, x2: x, y2: y })

            // Prevent stage dragging while selecting
            stage.draggable(false)
        }
    }

    const handleMouseMove = (e: any) => {
        if (!isSelecting.current || !selectionBox) return

        const stage = e.target.getStage()
        const pointer = stage.getPointerPosition()

        // Convert to stage coordinates
        const x = (pointer.x - stagePos.x) / scale
        const y = (pointer.y - stagePos.y) / scale

        setSelectionBox(prev => prev ? { ...prev, x2: x, y2: y } : null)
    }

    const handleMouseUp = (e: any) => {
        if (isSelecting.current && selectionBox) {
            const stage = e.target.getStage()

            // Normalize box coordinates (ensure min/max are correct)
            const box = {
                x1: Math.min(selectionBox.x1, selectionBox.x2),
                y1: Math.min(selectionBox.y1, selectionBox.y2),
                x2: Math.max(selectionBox.x1, selectionBox.x2),
                y2: Math.max(selectionBox.y1, selectionBox.y2)
            }

            // Only select if box has some size
            if (Math.abs(box.x2 - box.x1) > 5 && Math.abs(box.y2 - box.y1) > 5) {
                // Find all elements within the selection box
                const selectedElements = elements.filter(el => {
                    const elX = el.x
                    const elY = el.y
                    const elWidth = el.width || (el.radius ? el.radius * 2 : 20)
                    const elHeight = el.height || (el.radius ? el.radius * 2 : 20)

                    // For circles, check if center is in box
                    if (el.radius) {
                        return elX >= box.x1 && elX <= box.x2 && elY >= box.y1 && elY <= box.y2
                    }

                    // For rectangles, check if overlaps with box
                    const elLeft = elX - elWidth / 2
                    const elRight = elX + elWidth / 2
                    const elTop = elY - elHeight / 2
                    const elBottom = elY + elHeight / 2

                    return !(elRight < box.x1 || elLeft > box.x2 || elBottom < box.y1 || elTop > box.y2)
                })

                if (selectedElements.length > 0) {
                    onSelect(selectedElements.map(el => el.id))
                } else {
                    onSelect([])
                }
            } else {
                // Small drag = click = deselect
                onSelect([])
            }

            // Re-enable stage dragging
            stage.draggable(true)
        }

        isSelecting.current = false
        setSelectionBox(null)
    }

    const checkDeselect = (e: any) => {
        // Only deselect on simple click (not part of box selection)
        if (!isSelecting.current) {
            const clickedOnEmpty = e.target === e.target.getStage()
            if (clickedOnEmpty) {
                onSelect([])
            }
        }
    }

    const handleWheel = (e: any) => {
        e.evt.preventDefault()
        const stage = e.target.getStage()
        const oldScale = stage.scaleX()
        const pointer = stage.getPointerPosition()

        const scaleBy = 1.1
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        }

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        }

        onStageChange(newScale, newPos)
    }

    const handleDragEnd = (e: any) => {
        // Only update if it's the stage dragging
        if (e.target === e.target.getStage()) {
            onStageChange(scale, { x: e.target.x(), y: e.target.y() })
        }
    }

    const handleSelect = (id: string, e: any) => {
        // Konva events have the native event in e.evt
        const isShift = e?.evt?.shiftKey || e?.evt?.ctrlKey || e?.evt?.metaKey

        if (isShift) {
            // Add/remove from selection
            if (selectedIds.includes(id)) {
                onSelect(selectedIds.filter(sid => sid !== id))
            } else {
                onSelect([...selectedIds, id])
            }
        } else {
            // Check if element is part of a group
            const element = elements.find(el => el.id === id)
            if (element?.groupId) {
                // Select all elements in the group
                const groupIds = elements.filter(el => el.groupId === element.groupId).map(el => el.id)
                onSelect(groupIds)
            } else {
                // Single select
                onSelect([id])
            }
        }
    }

    // Handle drag start - store initial positions of all selected elements AND group members
    const handleDragStart = (draggedId: string, e: any) => {
        dragStartPos.current = { x: e.target.x(), y: e.target.y() }

        // Find the dragged element and its group
        const draggedElement = elements.find(el => el.id === draggedId)

        // Collect all IDs to track: selectedIds + group members if applicable
        const idsToTrack = new Set<string>(selectedIds)

        if (draggedElement?.groupId) {
            // Add all group members to tracking
            elements.filter(el => el.groupId === draggedElement.groupId)
                .forEach(el => idsToTrack.add(el.id))
        }

        // Store all elements' positions
        elementStartPositions.current.clear()
        idsToTrack.forEach(id => {
            const el = elements.find(elem => elem.id === id)
            if (el) {
                elementStartPositions.current.set(id, { x: el.x, y: el.y })
            }
        })
    }

    // Handle drag move - move all selected/group elements together during drag
    const handleDragMove = (draggedId: string, e: any) => {
        if (!dragStartPos.current) return

        // Only move other elements if we're tracking multiple positions
        if (elementStartPositions.current.size <= 1) return

        const dx = e.target.x() - dragStartPos.current.x
        const dy = e.target.y() - dragStartPos.current.y

        // Update all tracked elements (including the dragged one to sync state)
        const newElements = elements.map(el => {
            if (elementStartPositions.current.has(el.id)) {
                const startPos = elementStartPositions.current.get(el.id)
                if (startPos) {
                    return {
                        ...el,
                        x: startPos.x + dx,
                        y: startPos.y + dy,
                    }
                }
            }
            return el
        })

        onChange(newElements)
    }

    const handleElementChange = (newAttrs: any) => {
        const changedElement = elements.find(e => e.id === newAttrs.id)
        if (!changedElement) return

        // Apply snap if enabled and position is changing
        let finalAttrs = { ...newAttrs }
        if (snapEnabled && (newAttrs.x !== undefined || newAttrs.y !== undefined)) {
            const currentX = newAttrs.x !== undefined ? newAttrs.x : changedElement.x
            const currentY = newAttrs.y !== undefined ? newAttrs.y : changedElement.y

            const snapped = applySnap(
                { x: currentX, y: currentY },
                elements,
                changedElement
            )

            finalAttrs.x = snapped.x
            finalAttrs.y = snapped.y
        }

        let newElements = [...elements]

        // Check if this element is part of a group AND the change involves movement
        if (changedElement.groupId) {
            const dx = (finalAttrs.x !== undefined ? finalAttrs.x : changedElement.x) - changedElement.x
            const dy = (finalAttrs.y !== undefined ? finalAttrs.y : changedElement.y) - changedElement.y

            if (dx !== 0 || dy !== 0) {
                // Move all elements in the group
                newElements = elements.map(el => {
                    if (el.groupId === changedElement.groupId) {
                        if (el.id === finalAttrs.id) {
                            return { ...el, ...finalAttrs }
                        }
                        return {
                            ...el,
                            x: el.x + dx,
                            y: el.y + dy
                        }
                    }
                    return el
                })
            } else {
                // Non-movement change (resize, etc) - merge into original
                newElements = elements.map(el => el.id === finalAttrs.id ? { ...el, ...finalAttrs } : el)
            }
        } else if (selectedIds.length > 1 && selectedIds.includes(finalAttrs.id)) {
            // Multi-selection drag (handled in handleDragMove, just update the dragged element)
            newElements = elements.map(el => el.id === finalAttrs.id ? { ...el, ...finalAttrs } : el)
        } else {
            // Single element change - merge into original
            newElements = elements.map(el => el.id === finalAttrs.id ? { ...el, ...finalAttrs } : el)
        }

        onChange(newElements)

        // Reset drag tracking
        dragStartPos.current = null
        elementStartPositions.current.clear()
    }

    // Calculate selection rectangle for rendering
    const getSelectionRect = () => {
        if (!selectionBox) return null
        return {
            x: Math.min(selectionBox.x1, selectionBox.x2),
            y: Math.min(selectionBox.y1, selectionBox.y2),
            width: Math.abs(selectionBox.x2 - selectionBox.x1),
            height: Math.abs(selectionBox.y2 - selectionBox.y1)
        }
    }

    // Snap helper function to pass to child components
    // Snap helper function to pass to child components
    const snapPosition = (pos: { x: number; y: number }, element: any) => {
        if (!snapEnabled) return pos
        return applySnap(pos, elements, element)
    }

    const selRect = getSelectionRect()

    return (
        <Stage
            ref={stageRef}
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={checkDeselect}
            onWheel={handleWheel}
            draggable={!isSelecting.current}
            onDragEnd={handleDragEnd}
            scaleX={scale}
            scaleY={scale}
            x={stagePos.x}
            y={stagePos.y}
            className="bg-white border shadow-sm cursor-crosshair"
        >
            <Layer>
                {/* Infinite WHITE Background */}
                <Rect x={-5000} y={-5000} width={10000} height={10000} fill="white" listening={false} />

                {/* Infinite Grid Lines - covering entire canvas */}
                {/* Vertical Lines */}
                {Array.from({ length: 201 }).map((_, i) => (
                    <Rect
                        key={`v-${i}`}
                        x={(i - 100) * 50}
                        y={-5000}
                        width={1}
                        height={10000}
                        fill="#e2e8f0"
                        listening={false}
                    />
                ))}
                {/* Horizontal Lines */}
                {Array.from({ length: 201 }).map((_, i) => (
                    <Rect
                        key={`h-${i}`}
                        x={-5000}
                        y={(i - 100) * 50}
                        width={10000}
                        height={1}
                        fill="#e2e8f0"
                        listening={false}
                    />
                ))}

                {/* DXF Background Layer (if provided) */}
                {dxfData && (
                    <DxfRenderer
                        dxfData={dxfData}
                        opacity={dxfSettings.opacity}
                        scale={dxfSettings.scale}
                        offsetX={dxfSettings.offsetX}
                        offsetY={dxfSettings.offsetY + venueHeight}
                    />
                )}

                {/* Venue Boundary Outline (dashed blue rectangle) */}
                <Rect
                    x={0}
                    y={0}
                    width={venueWidth}
                    height={venueHeight}
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[10, 5]}
                    listening={false}
                />

                {elements.map((el, i) => {
                    const isSelected = selectedIds.includes(el.id)

                    // Render Seat or Round Table or Pillar (Circle)
                    if (el.type === 'seat' || el.type === 'pillar' || (el.type === 'table' && el.shape === 'circle')) {
                        return (
                            <CircleElement
                                key={el.id}
                                element={el}
                                visualProps={{
                                    fill: el.type === 'pillar' ? '#64748b' : (el.color ? el.color : '#fff'),
                                    stroke: isSelected ? '#3b82f6' : (el.type === 'pillar' ? '#475569' : ((el.color === '#fff' || !el.color) ? '#333' : el.color)),
                                    strokeWidth: isSelected ? 2 : (el.type === 'pillar' ? 2 : 1)
                                }}
                                isSelected={isSelected && selectedIds.length === 1}
                                onSelect={(e: any) => handleSelect(el.id, e)}
                                onChange={handleElementChange}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                snapFn={snapPosition}
                            />
                        )
                    }

                    // Render Text element
                    if (el.type === 'text') {
                        return (
                            <Text
                                key={el.id}
                                x={el.x}
                                y={el.y}
                                text={el.label || 'Text'}
                                fontSize={el.fontSize || 16}
                                fill={el.color || '#1e293b'}
                                fontFamily="Arial"
                                draggable={!el.locked}
                                onClick={(e) => handleSelect(el.id, e)}
                                onTap={(e) => handleSelect(el.id, e)}
                                onDragStart={(e) => handleDragStart(el.id, e)}
                                onDragMove={(e) => handleDragMove(el.id, e)}
                                onDragEnd={(e) => {
                                    let finalX = e.target.x()
                                    let finalY = e.target.y()

                                    // Apply snap
                                    const snapped = snapPosition({ x: finalX, y: finalY }, el)
                                    finalX = snapped.x
                                    finalY = snapped.y
                                    e.target.x(finalX)
                                    e.target.y(finalY)

                                    handleElementChange({
                                        id: el.id,
                                        x: finalX,
                                        y: finalY,
                                    })
                                }}
                            />
                        )
                    }

                    // Render Door with swing arc
                    if (el.type === 'door') {
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
                                draggable={!el.locked}
                                onClick={(e: any) => handleSelect(el.id, e)}
                                onTap={(e: any) => handleSelect(el.id, e)}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                onDragEnd={(e) => {
                                    handleElementChange({
                                        id: el.id,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }}
                            >
                                {/* Door leaf */}
                                <Rect
                                    x={0}
                                    y={-doorHeight / 2}
                                    width={doorWidth}
                                    height={doorHeight}
                                    fill={el.color || '#854d0e'}
                                    stroke={isSelected ? '#3b82f6' : '#713f12'}
                                    strokeWidth={isSelected ? 2 : 1}
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
                                {el.label && (
                                    <Text
                                        text={el.label}
                                        x={0}
                                        y={-doorHeight / 2 - 14}
                                        fontSize={10}
                                        fill="#1e293b"
                                    />
                                )}
                            </Group>
                        )
                    }

                    // Render Stairs with step lines
                    if (el.type === 'stairs') {
                        const stairsWidth = el.width || 60
                        const stairsHeight = el.height || 40
                        const rotation = el.rotation || 0
                        const numSteps = Math.max(3, Math.floor(stairsHeight / 10))
                        const stepHeight = stairsHeight / numSteps

                        const stepLines: React.ReactNode[] = []
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
                                draggable={!el.locked}
                                onClick={(e: any) => handleSelect(el.id, e)}
                                onTap={(e: any) => handleSelect(el.id, e)}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                onDragEnd={(e) => {
                                    handleElementChange({
                                        id: el.id,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }}
                            >
                                <Rect
                                    x={-stairsWidth / 2}
                                    y={-stairsHeight / 2}
                                    width={stairsWidth}
                                    height={stairsHeight}
                                    fill="transparent"
                                    stroke={isSelected ? '#3b82f6' : '#71717a'}
                                    strokeWidth={isSelected ? 2 : 2}
                                />
                                {stepLines}
                                {el.label && (
                                    <Text
                                        text={el.label}
                                        x={-stairsWidth / 2}
                                        y={-stairsHeight / 2 - 14}
                                        width={stairsWidth}
                                        fontSize={10}
                                        fill="#1e293b"
                                        align="center"
                                    />
                                )}
                            </Group>
                        )
                    }

                    // Render Window
                    if (el.type === 'window') {
                        const windowWidth = el.width || 60
                        const windowHeight = el.height || 8
                        const rotation = el.rotation || 0

                        return (
                            <Group
                                key={el.id}
                                x={el.x}
                                y={el.y}
                                rotation={rotation}
                                scaleX={el.scaleX || 1}
                                scaleY={el.scaleY || 1}
                                draggable={!el.locked}
                                onClick={(e: any) => handleSelect(el.id, e)}
                                onTap={(e: any) => handleSelect(el.id, e)}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                onDragEnd={(e) => {
                                    handleElementChange({
                                        id: el.id,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }}
                            >
                                <Rect
                                    x={-windowWidth / 2}
                                    y={-windowHeight / 2}
                                    width={windowWidth}
                                    height={windowHeight}
                                    fill="#38bdf8"
                                    stroke={isSelected ? '#3b82f6' : '#0284c7'}
                                    strokeWidth={isSelected ? 2 : 1}
                                />
                                {/* Center divider line */}
                                <Line
                                    points={[0, -windowHeight / 2, 0, windowHeight / 2]}
                                    stroke="#0284c7"
                                    strokeWidth={1}
                                />
                                {el.label && (
                                    <Text
                                        text={el.label}
                                        x={-windowWidth / 2}
                                        y={-windowHeight / 2 - 14}
                                        width={windowWidth}
                                        fontSize={10}
                                        fill="#1e293b"
                                        align="center"
                                    />
                                )}
                            </Group>
                        )
                    }

                    // Render Rect Table/Wall/Stage/Entry/Bar/DanceFloor
                    if (['table', 'wall', 'stage', 'entry', 'bar', 'dancefloor'].includes(el.type)) {
                        let fill = '#cbd5e1'
                        let stroke = '#333'
                        let strokeDash: number[] | undefined = undefined

                        if (el.type === 'table') { fill = '#fff'; }
                        if (el.type === 'wall') { fill = '#1e293b'; stroke = '#1e293b'; }
                        if (el.type === 'stage') { fill = '#fdf4ff'; stroke = '#d946ef'; }
                        if (el.type === 'entry') { fill = '#dbeafe'; stroke = '#3b82f6'; strokeDash = [5, 5]; }
                        if (el.type === 'bar') { fill = '#f3e8ff'; stroke = '#a855f7'; }
                        if (el.type === 'dancefloor') { fill = '#fce7f3'; stroke = '#ec4899'; strokeDash = [10, 5]; }

                        return (
                            <RectShape
                                key={el.id}
                                element={el}
                                visualProps={{
                                    fill: el.color
                                        ? (el.type === 'table' || el.type === 'wall' ? el.color : `${el.color}40`)
                                        : fill,
                                    stroke: isSelected ? '#3b82f6' : (el.color || stroke),
                                    strokeWidth: isSelected ? 2 : (el.type === 'dancefloor' ? 2 : 1),
                                    dash: strokeDash
                                }}
                                isSelected={isSelected && selectedIds.length === 1}
                                onSelect={(e: any) => handleSelect(el.id, e)}
                                onChange={handleElementChange}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                snapFn={snapPosition}
                            />
                        )
                    }

                    // Render Curved Wall (Arc)
                    if (el.type === 'curvedWall') {
                        return (
                            <Group
                                key={el.id}
                                x={el.x}
                                y={el.y}
                                rotation={el.rotation || 0}
                                draggable={!el.locked}
                                onClick={(e: any) => handleSelect(el.id, e)}
                                onTap={(e: any) => handleSelect(el.id, e)}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                onDragEnd={(e) => {
                                    handleElementChange({
                                        id: el.id,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }}
                            >
                                <Arc
                                    innerRadius={el.innerRadius || (el.radius - 10)}
                                    outerRadius={el.radius || 100}
                                    angle={el.angle || 90}
                                    fill={el.color || '#1e293b'}
                                    stroke={isSelected ? '#3b82f6' : '#1e293b'}
                                    strokeWidth={isSelected ? 2 : 1}
                                />
                            </Group>
                        )
                    }

                    // Render Dancefloor Circle
                    if (el.type === 'dancefloor-circle') {
                        return (
                            <CircleElement
                                key={el.id}
                                element={el}
                                visualProps={{
                                    fill: `${el.color || '#ec4899'}40`,
                                    stroke: isSelected ? '#3b82f6' : (el.color || '#ec4899'),
                                    strokeWidth: 2,
                                    dash: [10, 5]
                                }}
                                isSelected={isSelected && selectedIds.length === 1}
                                onSelect={(e: any) => handleSelect(el.id, e)}
                                onChange={handleElementChange}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                snapFn={snapPosition}
                            />
                        )
                    }

                    // Render Emergency Exit
                    if (el.type === 'emergency') {
                        const exitWidth = el.width || 50
                        const exitHeight = el.height || 10

                        return (
                            <Group
                                key={el.id}
                                x={el.x}
                                y={el.y}
                                rotation={el.rotation || 0}
                                draggable={!el.locked}
                                onClick={(e: any) => handleSelect(el.id, e)}
                                onTap={(e: any) => handleSelect(el.id, e)}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                onDragEnd={(e) => {
                                    handleElementChange({
                                        id: el.id,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }}
                            >
                                <Rect
                                    x={-exitWidth / 2}
                                    y={-exitHeight / 2}
                                    width={exitWidth}
                                    height={exitHeight}
                                    fill="#22c55e"
                                    stroke={isSelected ? '#3b82f6' : '#16a34a'}
                                    strokeWidth={2}
                                />
                                <Text
                                    x={-exitWidth / 2}
                                    y={-exitHeight / 2 + 2}
                                    width={exitWidth}
                                    text="EXIT"
                                    fontSize={8}
                                    fill="white"
                                    align="center"
                                    fontStyle="bold"
                                />
                            </Group>
                        )
                    }

                    // Render Line
                    if (el.type === 'line') {
                        return (
                            <Group
                                key={el.id}
                                x={el.x}
                                y={el.y}
                                rotation={el.rotation || 0}
                                draggable={!el.locked}
                                onClick={(e: any) => handleSelect(el.id, e)}
                                onTap={(e: any) => handleSelect(el.id, e)}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                onDragEnd={(e) => {
                                    handleElementChange({
                                        id: el.id,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }}
                            >
                                <Line
                                    points={[0, 0, el.width || 100, 0]}
                                    stroke={isSelected ? '#3b82f6' : (el.color || '#1e293b')}
                                    strokeWidth={el.strokeWidth || 3}
                                />
                            </Group>
                        )
                    }

                    // Render Compound shapes (grouped shapes)
                    if (el.type === 'compound') {
                        const childElements = elements.filter(e => el.children?.includes(e.id))
                        return (
                            <Group
                                key={el.id}
                                x={el.x}
                                y={el.y}
                                draggable={!el.locked}
                                onClick={(e: any) => handleSelect(el.id, e)}
                                onTap={(e: any) => handleSelect(el.id, e)}
                                onDragStart={(e: any) => handleDragStart(el.id, e)}
                                onDragMove={(e: any) => handleDragMove(el.id, e)}
                                onDragEnd={(e) => {
                                    handleElementChange({
                                        id: el.id,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    })
                                }}
                            >
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
                                {/* Selection outline */}
                                {isSelected && (
                                    <Rect
                                        x={-5}
                                        y={-5}
                                        width={(el.width || 100) + 10}
                                        height={(el.height || 100) + 10}
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dash={[5, 5]}
                                        fill="transparent"
                                    />
                                )}
                            </Group>
                        )
                    }

                    return null
                })}

                {/* Selection Box Rectangle */}
                {selRect && (
                    <Rect
                        x={selRect.x}
                        y={selRect.y}
                        width={selRect.width}
                        height={selRect.height}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        dash={[5, 5]}
                    />
                )}
            </Layer>
        </Stage>
    )
}
