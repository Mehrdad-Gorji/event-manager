'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    HiPlus, HiDuplicate, HiTrash, HiRefresh,
    HiViewGrid, HiArrowsExpand
} from 'react-icons/hi'
import {
    LuCircle, LuRectangleHorizontal, LuDoorOpen, LuType,
    LuAlignLeft, LuAlignCenter, LuAlignRight,
    LuAlignStartVertical, LuAlignCenterVertical, LuAlignEndVertical,
    LuFlipHorizontal2, LuFlipVertical2, LuRotateCw,
    LuRows3, LuColumns3, LuGripVertical, LuWine, LuMusic4, LuPilcrow,
    LuGroup, LuUngroup, LuArrowUpToLine, LuArrowDownToLine,
    LuCopy, LuDoorClosed, LuSquare, LuTriangle, LuArrowUp,
    LuMinus, LuMerge, LuSplit, LuScissors
} from 'react-icons/lu'

// Helper for IDs
const generateId = () => Math.random().toString(36).substr(2, 9)

interface VenueToolboxProps {
    onAddElement: (element: any | any[]) => void
    selectedIds: string[]
    elements: any[]
    onUpdateElements: (elements: any[]) => void
    onDelete?: () => void
    onUndo?: () => void
    onRedo?: () => void
    canUndo?: boolean
    canRedo?: boolean
}

export function VenueToolbox({
    onAddElement,
    selectedIds,
    elements,
    onUpdateElements,
    onDelete,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false
}: VenueToolboxProps) {
    const [seatCount, setSeatCount] = useState(4)
    const [tableShape, setTableShape] = useState<'round' | 'rect'>('round')
    const [selectedSection, setSelectedSection] = useState<string>('Regular')
    const [textInput, setTextInput] = useState('')
    const [showTextInput, setShowTextInput] = useState(false)
    const [textFontSize, setTextFontSize] = useState(16)
    const [textBold, setTextBold] = useState(false)

    // Room Generator state
    const [roomWidth, setRoomWidth] = useState(20) // meters
    const [roomHeight, setRoomHeight] = useState(15) // meters
    const [wallThickness, setWallThickness] = useState(0.2) // meters

    // Curved wall state
    const [curvedWallAngle, setCurvedWallAngle] = useState(90) // degrees
    const [curvedWallRadius, setCurvedWallRadius] = useState(3) // meters

    // Section presets with colors
    const SECTION_PRESETS = {
        'VIP': { seatColor: '#f59e0b', tableColor: '#451a03', label: '👑 VIP' },
        'Regular': { seatColor: '#3b82f6', tableColor: '#1e3a5f', label: '🎯 Regular' },
        'Banquet': { seatColor: '#a855f7', tableColor: '#4a1a4a', label: '🍽️ Banquet' },
        'Cocktail': { seatColor: '#14b8a6', tableColor: '#134e4a', label: '🍸 Cocktail' },
        'Premium': { seatColor: '#ec4899', tableColor: '#831843', label: '⭐ Premium' },
    }

    // Row Generator State
    const [rowCount, setRowCount] = useState(5)
    const [seatsPerRow, setSeatsPerRow] = useState(10)
    const [rowSpacing, setRowSpacing] = useState(1.2)
    const [seatSpacing, setSeatSpacing] = useState(0.6)
    const [rowLayout, setRowLayout] = useState<'straight' | 'curved' | 'semicircle'>('straight')
    const [labelPrefix, setLabelPrefix] = useState('A')
    const [rowSection, setRowSection] = useState<string>('Regular')

    // ============ CONSTANTS & METRIC HELPERS ============
    const PPM = 50 // Pixels Per Meter (1m = 50px)
    // Standard Dimensions in Meters
    const DIMS = {
        SEAT_RADIUS: 0.225, // 45cm diameter
        TABLE_DEPTH: 0.9,   // 90cm depth for rect tables
        TABLE_MIN_RADIUS: 0.6, // 1.2m min diameter for round
        ROW_SPACING: 1.0,   // 1m between rows
        SEAT_SPACING: 0.6,  // 60cm between seat centers
        WALL_WIDTH: 0.2,    // 20cm wall thickness
        GAP: 0.1,           // 10cm gap
    }

    // Helper to meters to pixels
    const m2px = (meters: number) => meters * PPM

    // ============ QUICK ITEMS ============
    const addSeat = () => {
        const nextNum = getNextSeatNumber()
        onAddElement({
            id: generateId(),
            type: 'seat',
            x: 100,
            y: 100,
            radius: m2px(DIMS.SEAT_RADIUS),
            label: `${nextNum}`,
            seatNumber: nextNum,
            color: '#818cf8',
        })
    }

    const addTable = () => {
        onAddElement({
            id: generateId(),
            type: 'table',
            x: 150,
            y: 150,
            width: m2px(1.8), // 1.8m standard table
            height: m2px(DIMS.TABLE_DEPTH),
            label: 'Table',
            color: '#bef264',
        })
    }

    // Wall presets (horizontal)
    const addWall = (lengthM: number = 4) => {
        onAddElement({
            id: generateId(),
            type: 'wall',
            x: 200,
            y: 200,
            width: m2px(lengthM),
            height: m2px(wallThickness),
            color: '#1e293b',
        })
    }

    // Vertical wall
    const addVerticalWall = (lengthM: number = 4) => {
        onAddElement({
            id: generateId(),
            type: 'wall',
            x: 200,
            y: 200,
            width: m2px(wallThickness),
            height: m2px(lengthM),
            color: '#1e293b',
        })
    }

    // Generate complete room with 4 walls
    const generateRoom = () => {
        const w = m2px(roomWidth)
        const h = m2px(roomHeight)
        const t = m2px(wallThickness)
        const startX = 100
        const startY = 100

        const walls = [
            // Top wall
            {
                id: generateId(),
                type: 'wall',
                x: startX + w / 2,
                y: startY + t / 2,
                width: w,
                height: t,
                color: '#1e293b',
            },
            // Bottom wall
            {
                id: generateId(),
                type: 'wall',
                x: startX + w / 2,
                y: startY + h - t / 2,
                width: w,
                height: t,
                color: '#1e293b',
            },
            // Left wall
            {
                id: generateId(),
                type: 'wall',
                x: startX + t / 2,
                y: startY + h / 2,
                width: t,
                height: h,
                color: '#1e293b',
            },
            // Right wall
            {
                id: generateId(),
                type: 'wall',
                x: startX + w - t / 2,
                y: startY + h / 2,
                width: t,
                height: h,
                color: '#1e293b',
            },
        ]

        onAddElement(walls)
    }

    // L-shaped corner wall
    const addCornerWall = (horizontal: number = 3, vertical: number = 3) => {
        const t = m2px(wallThickness)
        const hLen = m2px(horizontal)
        const vLen = m2px(vertical)
        const startX = 300
        const startY = 300

        const walls = [
            // Horizontal part
            {
                id: generateId(),
                type: 'wall',
                x: startX + hLen / 2,
                y: startY + t / 2,
                width: hLen,
                height: t,
                color: '#1e293b',
            },
            // Vertical part
            {
                id: generateId(),
                type: 'wall',
                x: startX + t / 2,
                y: startY + vLen / 2,
                width: t,
                height: vLen,
                color: '#1e293b',
            },
        ]

        onAddElement(walls)
    }

    // Curved wall (arc)
    const addCurvedWall = (radiusM: number = 3, angleStart: number = 0, angleEnd: number = 90) => {
        onAddElement({
            id: generateId(),
            type: 'curvedWall',
            x: 300,
            y: 300,
            radius: m2px(radiusM),
            innerRadius: m2px(radiusM) - m2px(wallThickness),
            angle: angleEnd - angleStart,
            rotation: angleStart,
            color: '#1e293b',
        })
    }

    // Wall with Door in center (splits wall into 2 parts with door)
    const addWallWithDoor = (wallLengthM: number = 6, doorWidthM: number = 1) => {
        const t = m2px(wallThickness)
        const totalWidth = m2px(wallLengthM)
        const doorW = m2px(doorWidthM)
        const sideWallWidth = (totalWidth - doorW) / 2
        const startX = 200
        const startY = 200

        // Walls use CENTER positioning (offsetX = width/2)
        // Door uses LEFT EDGE positioning (hinge at x)

        const elements = [
            // Left wall segment - center at startX + sideWallWidth/2
            {
                id: generateId(),
                type: 'wall',
                x: startX + sideWallWidth / 2,
                y: startY,
                width: sideWallWidth,
                height: t,
                color: '#1e293b',
            },
            // Right wall segment - center at startX + sideWallWidth + doorW + sideWallWidth/2
            {
                id: generateId(),
                type: 'wall',
                x: startX + sideWallWidth + doorW + sideWallWidth / 2,
                y: startY,
                width: sideWallWidth,
                height: t,
                color: '#1e293b',
            },
            // Door element - hinge at left wall edge, door opens rightward
            {
                id: generateId(),
                type: 'door',
                x: startX + sideWallWidth, // hinge at left wall's right edge
                y: startY,
                width: doorW,
                height: t,
                rotation: -90, // rotate so door opens rightward/downward
                color: '#8b4513',
            },
        ]

        onAddElement(elements)
    }

    // Wall with Window in center
    const addWallWithWindow = (wallLengthM: number = 6, windowWidthM: number = 1.5) => {
        const t = m2px(wallThickness)
        const totalWidth = m2px(wallLengthM)
        const windowWidth = m2px(windowWidthM)
        const sideWallWidth = (totalWidth - windowWidth) / 2
        const startX = 200
        const startY = 250

        const elements = [
            // Left wall segment
            {
                id: generateId(),
                type: 'wall',
                x: startX + sideWallWidth / 2,
                y: startY,
                width: sideWallWidth,
                height: t,
                color: '#1e293b',
            },
            // Right wall segment
            {
                id: generateId(),
                type: 'wall',
                x: startX + sideWallWidth + windowWidth + sideWallWidth / 2,
                y: startY,
                width: sideWallWidth,
                height: t,
                color: '#1e293b',
            },
            // Window element
            {
                id: generateId(),
                type: 'window',
                x: startX + sideWallWidth + windowWidth / 2,
                y: startY,
                width: windowWidth,
                height: t + 4,
                color: '#87ceeb',
            },
        ]

        onAddElement(elements)
    }

    const addStage = () => {
        onAddElement({
            id: generateId(),
            type: 'stage',
            x: 300,
            y: 50,
            width: m2px(6.0), // 6m stage
            height: m2px(3.0), // 3m depth
            label: 'Stage',
            color: '#f472b6',
        })
    }

    // ============ MORE SHAPES ============
    const addCircle = () => {
        onAddElement({
            id: generateId(),
            type: 'table',
            shape: 'circle',
            x: 200,
            y: 200,
            radius: m2px(0.9), // 1.8m diameter
            label: 'Table',
            color: '#22c55e',
        })
    }

    const addEntry = () => {
        onAddElement({
            id: generateId(),
            type: 'entry',
            x: 100,
            y: 300,
            width: m2px(1.6), // 1.6m door (double)
            height: m2px(DIMS.WALL_WIDTH),
            label: 'Entry',
            color: '#3b82f6',
        })
    }

    const addBar = () => {
        onAddElement({
            id: generateId(),
            type: 'bar',
            x: 400,
            y: 100,
            width: m2px(3.0), // 3m bar
            height: m2px(0.8), // 80cm depth
            label: 'Bar',
            color: '#a855f7',
        })
    }

    const addDanceFloor = () => {
        onAddElement({
            id: generateId(),
            type: 'dancefloor',
            x: 300,
            y: 300,
            width: m2px(5.0), // 5m x 5m
            height: m2px(5.0),
            label: 'Dance Floor',
            color: '#ec4899',
        })
    }

    const addDanceFloorCircle = () => {
        onAddElement({
            id: generateId(),
            type: 'dancefloor-circle',
            x: 300,
            y: 300,
            radius: m2px(2.5), // 5m diameter
            label: 'Dance Floor',
            color: '#ec4899',
        })
    }

    const addPillar = () => {
        onAddElement({
            id: generateId(),
            type: 'pillar',
            x: 250,
            y: 250,
            radius: m2px(0.25), // 50cm diameter
            label: '',
            color: '#64748b',
        })
    }

    const addText = () => {
        if (!textInput.trim()) return
        onAddElement({
            id: generateId(),
            type: 'text',
            x: 200,
            y: 200,
            label: textInput,
            fontSize: textFontSize,
            fontWeight: textBold ? 'bold' : 'normal',
            color: '#1e293b',
        })
        setTextInput('')
        setShowTextInput(false)
    }

    const handleTextButtonClick = () => {
        setShowTextInput(true)
    }

    // ============ STRUCTURAL ELEMENTS ============

    const addDoor = () => {
        onAddElement({
            id: generateId(),
            type: 'door',
            x: 200,
            y: 200,
            width: m2px(1.0), // 1m door
            height: m2px(0.15), // 15cm thickness
            label: 'Door',
            color: '#8b4513',
        })
    }

    const addWindow = () => {
        onAddElement({
            id: generateId(),
            type: 'window',
            x: 200,
            y: 200,
            width: m2px(1.5), // 1.5m window
            height: m2px(0.1), // 10cm thickness
            label: 'Window',
            color: '#87ceeb',
        })
    }

    const addEmergencyExit = () => {
        onAddElement({
            id: generateId(),
            type: 'emergency',
            x: 200,
            y: 200,
            width: m2px(1.2), // 1.2m exit
            height: m2px(0.2),
            label: 'EXIT',
            color: '#22c55e',
        })
    }

    const addStairs = () => {
        onAddElement({
            id: generateId(),
            type: 'stairs',
            x: 200,
            y: 200,
            width: m2px(2.0), // 2m wide
            height: m2px(3.0), // 3m deep
            label: 'Stairs',
            color: '#a1a1aa',
        })
    }

    const addLine = () => {
        onAddElement({
            id: generateId(),
            type: 'line',
            x: 200,
            y: 200,
            x2: 300, // End point
            y2: 200,
            width: m2px(2.0), // Line length
            label: '',
            color: '#1e293b',
            strokeWidth: 3,
        })
    }

    // ============ EDIT TOOLS ============

    // Helper to get all elements in the same group
    const getGroupElements = (elementId: string) => {
        const selected = elements.find(e => e.id === elementId)
        if (!selected) return []

        if (selected.groupId) {
            // Return all elements with the same groupId
            return elements.filter(e => e.groupId === selected.groupId)
        }
        // Single element, not part of a group
        return [selected]
    }

    // Find the center of a group
    const getGroupCenter = (groupElements: any[]) => {
        if (groupElements.length === 0) return { x: 0, y: 0 }
        const sumX = groupElements.reduce((acc: number, el: any) => acc + el.x, 0)
        const sumY = groupElements.reduce((acc: number, el: any) => acc + el.y, 0)
        return {
            x: sumX / groupElements.length,
            y: sumY / groupElements.length
        }
    }

    // Get all selected elements including group members
    const getAllSelectedElements = () => {
        const result: any[] = []
        const processedGroupIds = new Set<string>()

        selectedIds.forEach(id => {
            const el = elements.find(e => e.id === id)
            if (!el) return

            if (el.groupId && !processedGroupIds.has(el.groupId)) {
                processedGroupIds.add(el.groupId)
                elements.filter(e => e.groupId === el.groupId).forEach(e => result.push(e))
            } else if (!el.groupId && !result.find(r => r.id === el.id)) {
                result.push(el)
            }
        })

        return result
    }

    const handleDuplicate = () => {
        if (selectedIds.length === 0) return

        // Get all elements to duplicate (including their groups)
        const elementsToDuplicate: any[] = []
        const processedGroupIds = new Set<string>()

        selectedIds.forEach(id => {
            const el = elements.find(e => e.id === id)
            if (!el) return

            if (el.groupId && !processedGroupIds.has(el.groupId)) {
                // Add all elements in this group
                processedGroupIds.add(el.groupId)
                elements.filter(e => e.groupId === el.groupId).forEach(e => elementsToDuplicate.push(e))
            } else if (!el.groupId) {
                elementsToDuplicate.push(el)
            }
        })

        if (elementsToDuplicate.length === 0) return

        // Calculate smart offset based on elements' bounding box
        let maxWidth = 0, maxHeight = 0
        elementsToDuplicate.forEach(el => {
            const w = el.width || (el.radius ? el.radius * 2 : 50)
            const h = el.height || (el.radius ? el.radius * 2 : 50)
            maxWidth = Math.max(maxWidth, w)
            maxHeight = Math.max(maxHeight, h)
        })
        const offset = Math.max(30, Math.min(maxWidth, maxHeight) * 0.3)

        const newGroupIds = new Map<string, string>()
        const oldToNewIdMap = new Map<string, string>()

        // Find the next available table number for each section
        const getNextTableNumber = (section: string, prefix: string) => {
            const existingTables = elements.filter(e =>
                e.type === 'table' && e.section === section
            )
            let maxNum = 0
            existingTables.forEach(t => {
                const match = t.label?.match(/T(\d+)/i)
                if (match) maxNum = Math.max(maxNum, parseInt(match[1]))
            })
            return maxNum + 1
        }

        // Find the next available seat number
        const getNextSeatNumber = () => {
            let maxNum = 0
            elements.forEach(e => {
                if (e.type === 'seat' && e.seatNumber) {
                    maxNum = Math.max(maxNum, e.seatNumber)
                }
            })
            return maxNum + 1
        }

        let nextSeatNum = getNextSeatNumber()
        const tableNumberMap = new Map<string, number>() // old groupId or tableId -> new table number

        // Track table numbers per section for standalone tables
        const sectionTableCounters: { [section: string]: number } = {}

        // First pass: create new IDs and calculate table numbers
        elementsToDuplicate.forEach(el => {
            const newId = generateId()
            oldToNewIdMap.set(el.id, newId)

            // If it's a table, calculate new table number
            if (el.type === 'table') {
                const key = el.groupId || el.id // Use groupId if exists, otherwise use table's own id
                if (!tableNumberMap.has(key)) {
                    const section = el.section || 'Regular'
                    if (!sectionTableCounters[section]) {
                        // Initialize counter for this section
                        sectionTableCounters[section] = getNextTableNumber(section, section === 'VIP' ? 'VIP' : '')
                    }
                    tableNumberMap.set(key, sectionTableCounters[section])
                    sectionTableCounters[section]++
                }
            }
        })

        const duplicatedElements = elementsToDuplicate.map(el => {
            let newGroupId = undefined
            if (el.groupId) {
                if (!newGroupIds.has(el.groupId)) {
                    newGroupIds.set(el.groupId, generateId())
                }
                newGroupId = newGroupIds.get(el.groupId)
            }

            const newId = oldToNewIdMap.get(el.id) || generateId()

            // Generate new labels for tables and seats
            let newLabel = el.label
            let newSeatNumber = el.seatNumber

            if (el.type === 'table') {
                const key = el.groupId || el.id
                const tableNum = tableNumberMap.get(key) || 1
                const prefix = el.section === 'VIP' ? 'VIP ' : ''
                newLabel = `${prefix}T${tableNum}`
            } else if (el.type === 'seat') {
                newSeatNumber = nextSeatNum++
                newLabel = String(newSeatNumber)
            }

            // Copy all properties including scale, rotation, etc.
            return {
                ...el,
                id: newId,
                groupId: newGroupId,
                x: el.x + offset,
                y: el.y + offset,
                label: newLabel,
                seatNumber: newSeatNumber,
                // Preserve all visual properties
                scaleX: el.scaleX,
                scaleY: el.scaleY,
                rotation: el.rotation,
                color: el.color,
                section: el.section,
            }
        })

        onAddElement(duplicatedElements)
    }

    const handleRotate = (degrees: number) => {
        if (selectedIds.length === 0) return

        // Get all elements to rotate
        const allSelectedElements = getAllSelectedElements()
        if (allSelectedElements.length === 0) return

        const center = getGroupCenter(allSelectedElements)
        const angleRad = (degrees * Math.PI) / 180

        const idsToRotate = new Set(allSelectedElements.map(e => e.id))

        const newElements = elements.map(el => {
            if (!idsToRotate.has(el.id)) return el

            const dx = el.x - center.x
            const dy = el.y - center.y

            const newX = center.x + (dx * Math.cos(angleRad) - dy * Math.sin(angleRad))
            const newY = center.y + (dx * Math.sin(angleRad) + dy * Math.cos(angleRad))

            return {
                ...el,
                x: newX,
                y: newY,
                rotation: ((el.rotation || 0) + degrees) % 360
            }
        })

        onUpdateElements(newElements)
    }

    const handleFlipH = () => {
        if (selectedIds.length === 0) return

        const allSelectedElements = getAllSelectedElements()
        if (allSelectedElements.length === 0) return

        const center = getGroupCenter(allSelectedElements)
        const idsToFlip = new Set(allSelectedElements.map(e => e.id))

        const newElements = elements.map(el => {
            if (!idsToFlip.has(el.id)) return el

            const dx = el.x - center.x
            return {
                ...el,
                x: center.x - dx,
                scaleX: (el.scaleX || 1) * -1
            }
        })

        onUpdateElements(newElements)
    }

    const handleFlipV = () => {
        if (selectedIds.length === 0) return

        const allSelectedElements = getAllSelectedElements()
        if (allSelectedElements.length === 0) return

        const center = getGroupCenter(allSelectedElements)
        const idsToFlip = new Set(allSelectedElements.map(e => e.id))

        const newElements = elements.map(el => {
            if (!idsToFlip.has(el.id)) return el

            const dy = el.y - center.y
            return {
                ...el,
                y: center.y - dy,
                scaleY: (el.scaleY || 1) * -1
            }
        })

        onUpdateElements(newElements)
    }

    // ============ ADVANCED EDIT TOOLS ============

    // Group selected elements together
    const handleGroup = () => {
        if (selectedIds.length < 2) return

        const allSelectedElements = getAllSelectedElements()
        if (allSelectedElements.length < 2) return

        // Generate a new group ID
        const newGroupId = generateId()

        const newElements = elements.map(el => {
            if (allSelectedElements.some(se => se.id === el.id)) {
                return { ...el, groupId: newGroupId }
            }
            return el
        })

        onUpdateElements(newElements)
    }

    // Ungroup selected elements
    const handleUngroup = () => {
        if (selectedIds.length === 0) return

        const allSelectedElements = getAllSelectedElements()
        const groupIdsToRemove = new Set(allSelectedElements.filter(e => e.groupId).map(e => e.groupId))

        if (groupIdsToRemove.size === 0) return

        const newElements = elements.map(el => {
            if (groupIdsToRemove.has(el.groupId)) {
                const { groupId, ...rest } = el
                return rest
            }
            return el
        })

        onUpdateElements(newElements)
    }

    // Bring selected elements to front
    const handleBringToFront = () => {
        if (selectedIds.length === 0) return

        const allSelectedElements = getAllSelectedElements()
        const selectedSet = new Set(allSelectedElements.map(e => e.id))

        const unselected = elements.filter(el => !selectedSet.has(el.id))
        const selected = elements.filter(el => selectedSet.has(el.id))

        onUpdateElements([...unselected, ...selected])
    }

    // Send selected elements to back
    const handleSendToBack = () => {
        if (selectedIds.length === 0) return

        const allSelectedElements = getAllSelectedElements()
        const selectedSet = new Set(allSelectedElements.map(e => e.id))

        const unselected = elements.filter(el => !selectedSet.has(el.id))
        const selected = elements.filter(el => selectedSet.has(el.id))

        onUpdateElements([...selected, ...unselected])
    }

    // ============ BOOLEAN OPERATIONS ============

    // Union: Combine multiple shapes into one compound shape
    const handleUnion = () => {
        if (selectedIds.length < 2) return

        const allSelectedElements = getAllSelectedElements()
        if (allSelectedElements.length < 2) return

        // Calculate bounding box of all selected elements
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

        allSelectedElements.forEach(el => {
            const elWidth = el.width || (el.radius ? el.radius * 2 : 50)
            const elHeight = el.height || (el.radius ? el.radius * 2 : 50)
            const left = el.x - elWidth / 2
            const right = el.x + elWidth / 2
            const top = el.y - elHeight / 2
            const bottom = el.y + elHeight / 2

            minX = Math.min(minX, left)
            minY = Math.min(minY, top)
            maxX = Math.max(maxX, right)
            maxY = Math.max(maxY, bottom)
        })

        // Create a compound shape that references the original shapes
        const compoundId = generateId()
        const selectedSet = new Set(allSelectedElements.map(e => e.id))

        // Mark original elements as part of compound and hide them
        const newElements = elements.map(el => {
            if (selectedSet.has(el.id)) {
                return { ...el, compoundId, hidden: true }
            }
            return el
        })

        // Add the compound shape
        const compoundShape = {
            id: compoundId,
            type: 'compound',
            operation: 'union',
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
            width: maxX - minX,
            height: maxY - minY,
            children: allSelectedElements.map(e => e.id),
            color: allSelectedElements[0].color || '#ec4899',
            label: 'Combined Shape',
        }

        onUpdateElements([...newElements, compoundShape])
    }

    // Subtract: Remove the second selected shape from the first
    const handleSubtract = () => {
        if (selectedIds.length !== 2) return

        const first = elements.find(e => e.id === selectedIds[0])
        const second = elements.find(e => e.id === selectedIds[1])
        if (!first || !second) return

        const compoundId = generateId()

        // Mark both as part of compound
        const newElements = elements.map(el => {
            if (el.id === first.id || el.id === second.id) {
                return { ...el, compoundId, hidden: true }
            }
            return el
        })

        // Create subtract compound
        const compoundShape = {
            id: compoundId,
            type: 'compound',
            operation: 'subtract',
            x: first.x,
            y: first.y,
            width: first.width || (first.radius ? first.radius * 2 : 100),
            height: first.height || (first.radius ? first.radius * 2 : 100),
            baseShape: first.id,
            cutShape: second.id,
            children: [first.id, second.id],
            color: first.color || '#ec4899',
            label: 'Subtracted Shape',
        }

        onUpdateElements([...newElements, compoundShape])
    }

    // Intersect: Keep only the overlapping area
    const handleIntersect = () => {
        if (selectedIds.length !== 2) return

        const first = elements.find(e => e.id === selectedIds[0])
        const second = elements.find(e => e.id === selectedIds[1])
        if (!first || !second) return

        // Calculate intersection bounds
        const first_width = first.width || (first.radius ? first.radius * 2 : 100)
        const first_height = first.height || (first.radius ? first.radius * 2 : 100)
        const second_width = second.width || (second.radius ? second.radius * 2 : 100)
        const second_height = second.height || (second.radius ? second.radius * 2 : 100)

        const left1 = first.x - first_width / 2
        const right1 = first.x + first_width / 2
        const top1 = first.y - first_height / 2
        const bottom1 = first.y + first_height / 2

        const left2 = second.x - second_width / 2
        const right2 = second.x + second_width / 2
        const top2 = second.y - second_height / 2
        const bottom2 = second.y + second_height / 2

        // Intersection bounds
        const intLeft = Math.max(left1, left2)
        const intRight = Math.min(right1, right2)
        const intTop = Math.max(top1, top2)
        const intBottom = Math.min(bottom1, bottom2)

        if (intLeft >= intRight || intTop >= intBottom) {
            alert('Shapes do not overlap!')
            return
        }

        const compoundId = generateId()

        // Mark both as part of compound
        const newElements = elements.map(el => {
            if (el.id === first.id || el.id === second.id) {
                return { ...el, compoundId, hidden: true }
            }
            return el
        })

        // Create intersect compound
        const compoundShape = {
            id: compoundId,
            type: 'compound',
            operation: 'intersect',
            x: (intLeft + intRight) / 2,
            y: (intTop + intBottom) / 2,
            width: intRight - intLeft,
            height: intBottom - intTop,
            children: [first.id, second.id],
            color: first.color || '#ec4899',
            label: 'Intersection',
        }

        onUpdateElements([...newElements, compoundShape])
    }

    // Explode: Break compound shape back into original shapes
    const handleExplode = () => {
        if (selectedIds.length === 0) return

        const selected = elements.find(e => e.id === selectedIds[0])
        if (!selected || selected.type !== 'compound') {
            alert('Select a compound shape to explode')
            return
        }

        // Restore hidden children and remove compound
        const newElements = elements
            .filter(el => el.id !== selected.id)
            .map(el => {
                if (selected.children?.includes(el.id)) {
                    const { compoundId, hidden, ...rest } = el
                    return rest
                }
                return el
            })

        onUpdateElements(newElements)
    }

    // Toggle lock on selected elements
    const handleToggleLock = () => {
        if (selectedIds.length === 0) return

        const allSelectedElements = getAllSelectedElements()
        const anyLocked = allSelectedElements.some(e => e.locked)

        const newElements = elements.map(el => {
            if (allSelectedElements.some(se => se.id === el.id)) {
                return { ...el, locked: !anyLocked }
            }
            return el
        })

        onUpdateElements(newElements)
    }

    // Check if any selected element is locked
    const isAnySelectedLocked = () => {
        const allSelectedElements = getAllSelectedElements()
        return allSelectedElements.some(e => e.locked)
    }

    // Change color of selected elements
    const handleChangeColor = (color: string) => {
        if (selectedIds.length === 0) return

        const allSelectedElements = getAllSelectedElements()

        const newElements = elements.map(el => {
            if (allSelectedElements.some(se => se.id === el.id)) {
                return { ...el, color }
            }
            return el
        })

        onUpdateElements(newElements)
    }

    // ============ ALIGNMENT TOOLS ============
    // Get bounding box for a single element
    const getElementBounds = (el: any) => {
        const halfWidth = el.width ? el.width / 2 : (el.radius || 0)
        const halfHeight = el.height ? el.height / 2 : (el.radius || 0)
        return {
            left: el.x - halfWidth,
            right: el.x + halfWidth,
            top: el.y - halfHeight,
            bottom: el.y + halfHeight,
            centerX: el.x,
            centerY: el.y
        }
    }

    // Get bounding box for a group of elements
    const getGroupBounds = (groupElements: any[]) => {
        if (groupElements.length === 0) return null
        const allBounds = groupElements.map(getElementBounds)
        return {
            left: Math.min(...allBounds.map(b => b.left)),
            right: Math.max(...allBounds.map(b => b.right)),
            top: Math.min(...allBounds.map(b => b.top)),
            bottom: Math.max(...allBounds.map(b => b.bottom)),
            centerX: (Math.min(...allBounds.map(b => b.left)) + Math.max(...allBounds.map(b => b.right))) / 2,
            centerY: (Math.min(...allBounds.map(b => b.top)) + Math.max(...allBounds.map(b => b.bottom))) / 2
        }
    }

    // Get alignment units - each group is one unit, ungrouped elements are individual units
    const getAlignmentUnits = () => {
        const units: { elements: any[], bounds: any }[] = []
        const processedGroupIds = new Set<string>()
        const processedElementIds = new Set<string>()

        selectedIds.forEach(id => {
            const el = elements.find(e => e.id === id)
            if (!el) return

            if (el.groupId) {
                if (!processedGroupIds.has(el.groupId)) {
                    processedGroupIds.add(el.groupId)
                    const groupElements = elements.filter(e => e.groupId === el.groupId)
                    const bounds = getGroupBounds(groupElements)
                    if (bounds) {
                        units.push({ elements: groupElements, bounds })
                        groupElements.forEach(e => processedElementIds.add(e.id))
                    }
                }
            } else if (!processedElementIds.has(el.id)) {
                processedElementIds.add(el.id)
                const bounds = getElementBounds(el)
                units.push({ elements: [el], bounds })
            }
        })

        return units
    }

    // Generic align function that moves units as whole
    const alignUnits = (getTargetPosition: (units: { elements: any[], bounds: any }[]) => { getNewX?: (bounds: any) => number, getNewY?: (bounds: any) => number }) => {
        const units = getAlignmentUnits()
        if (units.length < 2) return

        const { getNewX, getNewY } = getTargetPosition(units)

        const newElements = [...elements]

        units.forEach(unit => {
            const deltaX = getNewX ? getNewX(unit.bounds) - unit.bounds.centerX : 0
            const deltaY = getNewY ? getNewY(unit.bounds) - unit.bounds.centerY : 0

            unit.elements.forEach(el => {
                const index = newElements.findIndex(e => e.id === el.id)
                if (index !== -1) {
                    newElements[index] = {
                        ...newElements[index],
                        x: newElements[index].x + deltaX,
                        y: newElements[index].y + deltaY
                    }
                }
            })
        })

        onUpdateElements(newElements)
    }

    const handleAlignLeft = () => {
        alignUnits(units => {
            const minLeft = Math.min(...units.map(u => u.bounds.left))
            return {
                getNewX: (bounds: any) => minLeft + (bounds.centerX - bounds.left)
            }
        })
    }

    const handleAlignCenter = () => {
        alignUnits(units => {
            const minLeft = Math.min(...units.map(u => u.bounds.left))
            const maxRight = Math.max(...units.map(u => u.bounds.right))
            const centerX = (minLeft + maxRight) / 2
            return {
                getNewX: () => centerX
            }
        })
    }

    const handleAlignRight = () => {
        alignUnits(units => {
            const maxRight = Math.max(...units.map(u => u.bounds.right))
            return {
                getNewX: (bounds: any) => maxRight - (bounds.right - bounds.centerX)
            }
        })
    }

    const handleAlignTop = () => {
        alignUnits(units => {
            const minTop = Math.min(...units.map(u => u.bounds.top))
            return {
                getNewY: (bounds: any) => minTop + (bounds.centerY - bounds.top)
            }
        })
    }

    const handleAlignMiddle = () => {
        alignUnits(units => {
            const minTop = Math.min(...units.map(u => u.bounds.top))
            const maxBottom = Math.max(...units.map(u => u.bounds.bottom))
            const centerY = (minTop + maxBottom) / 2
            return {
                getNewY: () => centerY
            }
        })
    }

    const handleAlignBottom = () => {
        alignUnits(units => {
            const maxBottom = Math.max(...units.map(u => u.bounds.bottom))
            return {
                getNewY: (bounds: any) => maxBottom - (bounds.bottom - bounds.centerY)
            }
        })
    }

    // Distribute horizontally - evenly space units across the canvas width
    const handleDistributeHorizontal = () => {
        const units = getAlignmentUnits()
        if (units.length < 3) return

        // Sort units by their center X position
        const sortedUnits = [...units].sort((a, b) => a.bounds.centerX - b.bounds.centerX)

        // Always spread across the full canvas width
        const canvasWidth = 700
        const margin = 80
        const leftMost = margin
        const rightMost = canvasWidth - margin

        // Calculate spacing
        const totalSpan = rightMost - leftMost
        const spacing = totalSpan / (sortedUnits.length - 1)

        const newElements = [...elements]

        sortedUnits.forEach((unit, index) => {
            const targetX = leftMost + (index * spacing)
            const deltaX = targetX - unit.bounds.centerX

            unit.elements.forEach(el => {
                const elIndex = newElements.findIndex(e => e.id === el.id)
                if (elIndex !== -1) {
                    newElements[elIndex] = {
                        ...newElements[elIndex],
                        x: newElements[elIndex].x + deltaX
                    }
                }
            })
        })

        onUpdateElements(newElements)
    }

    // Distribute vertically - evenly space units across the canvas height
    const handleDistributeVertical = () => {
        const units = getAlignmentUnits()
        if (units.length < 3) return

        // Sort units by their center Y position
        const sortedUnits = [...units].sort((a, b) => a.bounds.centerY - b.bounds.centerY)

        // Always spread across the full canvas height
        const canvasHeight = 550
        const margin = 80
        const topMost = margin
        const bottomMost = canvasHeight - margin

        // Calculate spacing
        const totalSpan = bottomMost - topMost
        const spacing = totalSpan / (sortedUnits.length - 1)

        const newElements = [...elements]

        sortedUnits.forEach((unit, index) => {
            const targetY = topMost + (index * spacing)
            const deltaY = targetY - unit.bounds.centerY

            unit.elements.forEach(el => {
                const elIndex = newElements.findIndex(e => e.id === el.id)
                if (elIndex !== -1) {
                    newElements[elIndex] = {
                        ...newElements[elIndex],
                        y: newElements[elIndex].y + deltaY
                    }
                }
            })
        })

        onUpdateElements(newElements)
    }

    // Arrange in horizontal row - align to same Y AND spread evenly on X
    const handleArrangeHorizontalRow = () => {
        const units = getAlignmentUnits()
        if (units.length < 2) return

        // Sort units by their center X position
        const sortedUnits = [...units].sort((a, b) => a.bounds.centerX - b.bounds.centerX)

        // Calculate center Y from all units (average)
        const avgY = sortedUnits.reduce((sum, u) => sum + u.bounds.centerY, 0) / sortedUnits.length

        // Calculate spacing based on element widths + gap
        const gap = 20 // 20px gap between elements
        const avgWidth = sortedUnits.reduce((sum, u) => sum + (u.bounds.right - u.bounds.left), 0) / sortedUnits.length
        const spacing = avgWidth + gap

        // Start from center and spread out
        const totalWidth = spacing * (sortedUnits.length - 1)
        const startX = 350 - totalWidth / 2 // Center at canvas middle (700/2)

        const newElements = [...elements]

        sortedUnits.forEach((unit, index) => {
            const targetX = startX + (index * spacing)
            const targetY = avgY
            const deltaX = targetX - unit.bounds.centerX
            const deltaY = targetY - unit.bounds.centerY

            unit.elements.forEach(el => {
                const elIndex = newElements.findIndex(e => e.id === el.id)
                if (elIndex !== -1) {
                    newElements[elIndex] = {
                        ...newElements[elIndex],
                        x: newElements[elIndex].x + deltaX,
                        y: newElements[elIndex].y + deltaY
                    }
                }
            })
        })

        onUpdateElements(newElements)
    }

    // Arrange in vertical column - align to same X AND spread evenly on Y
    const handleArrangeVerticalColumn = () => {
        const units = getAlignmentUnits()
        if (units.length < 2) return

        // Sort units by their center Y position
        const sortedUnits = [...units].sort((a, b) => a.bounds.centerY - b.bounds.centerY)

        // Calculate center X from all units (average)
        const avgX = sortedUnits.reduce((sum, u) => sum + u.bounds.centerX, 0) / sortedUnits.length

        // Calculate spacing based on element heights + gap
        const gap = 20 // 20px gap between elements
        const avgHeight = sortedUnits.reduce((sum, u) => sum + (u.bounds.bottom - u.bounds.top), 0) / sortedUnits.length
        const spacing = avgHeight + gap

        // Start from center and spread out
        const totalHeight = spacing * (sortedUnits.length - 1)
        const startY = 275 - totalHeight / 2 // Center at canvas middle (550/2)

        const newElements = [...elements]

        sortedUnits.forEach((unit, index) => {
            const targetX = avgX
            const targetY = startY + (index * spacing)
            const deltaX = targetX - unit.bounds.centerX
            const deltaY = targetY - unit.bounds.centerY

            unit.elements.forEach(el => {
                const elIndex = newElements.findIndex(e => e.id === el.id)
                if (elIndex !== -1) {
                    newElements[elIndex] = {
                        ...newElements[elIndex],
                        x: newElements[elIndex].x + deltaX,
                        y: newElements[elIndex].y + deltaY
                    }
                }
            })
        })

        onUpdateElements(newElements)
    }


    // ============ TABLE GENERATOR ============
    const getNextTableNumber = () => {
        const tables = elements.filter(el => el.type === 'table')
        let maxNum = 0
        tables.forEach(t => {
            if (t.label) {
                // Match both "T1" and "VIP T1" formats
                const match = t.label.match(/T(\d+)/i)
                if (match) {
                    const num = parseInt(match[1])
                    if (!isNaN(num) && num > maxNum) {
                        maxNum = num
                    }
                }
            }
        })
        return maxNum + 1
    }

    const getNextSeatNumber = () => {
        const seats = elements.filter(el => el.type === 'seat')
        let maxNum = 0
        seats.forEach(s => {
            const num = parseInt(s.label)
            if (!isNaN(num) && num > maxNum) {
                maxNum = num
            }
        })
        return maxNum + 1
    }

    const handleGenerateTable = () => {
        // Dimensions in METERS
        const DIM_SEAT_RADIUS = DIMS.SEAT_RADIUS // 0.225m
        const DIM_GAP = DIMS.GAP // 0.1m
        const DIM_TABLE_DEPTH_RECT = DIMS.TABLE_DEPTH // 0.9m

        const center = { x: 400, y: 300 }

        const newElements: any[] = []
        const groupId = generateId()
        const tableNum = getNextTableNumber()

        // Get section preset
        const preset = SECTION_PRESETS[selectedSection as keyof typeof SECTION_PRESETS] || SECTION_PRESETS['Regular']
        const sectionPrefix = selectedSection === 'VIP' ? 'VIP ' : ''
        const tableLabel = `${sectionPrefix}T${tableNum}`
        let currentSeatNum = getNextSeatNumber()

        if (tableShape === 'round') {
            const seatWidthM = DIM_SEAT_RADIUS * 2
            const spacingM = 0.2

            const minPerimeter = seatCount * (seatWidthM + spacingM)
            const calcRadiusM = minPerimeter / (2 * Math.PI)
            const tableRadiusM = Math.max(DIMS.TABLE_MIN_RADIUS, calcRadiusM)

            // Convert to Pixels
            const tableRadius = m2px(tableRadiusM)
            const seatDist = tableRadius + m2px(DIM_GAP + DIM_SEAT_RADIUS)
            const seatRadiusPx = m2px(DIM_SEAT_RADIUS)

            newElements.push({
                id: generateId(),
                groupId,
                type: 'table',
                shape: 'circle',
                x: center.x,
                y: center.y,
                radius: tableRadius,
                width: tableRadius * 2,
                height: tableRadius * 2,
                label: tableLabel,
                section: selectedSection,
                color: preset.tableColor,
            })

            for (let i = 0; i < seatCount; i++) {
                const angle = (i * (360 / seatCount)) * (Math.PI / 180)
                const thisSeatNum = currentSeatNum++
                newElements.push({
                    id: generateId(),
                    groupId,
                    type: 'seat',
                    x: center.x + seatDist * Math.cos(angle),
                    y: center.y + seatDist * Math.sin(angle),
                    radius: seatRadiusPx,
                    label: `${thisSeatNum}`,
                    section: selectedSection,
                    row: `T${tableNum}`,
                    seatNumber: thisSeatNum,
                    color: preset.seatColor,
                })
            }
        } else if (tableShape === 'rect') {
            // Rectangular Table Logic
            const seatSizeM = DIM_SEAT_RADIUS * 2
            const spacingM = 0.1 // 10cm spacing between seats

            // Calculate Width based on seats per side
            const seatsPerSide = Math.ceil(seatCount / 2)

            // Width = (Seats * Size) + (Spaces * Spacing) + Edge Padding
            const totalWidthM = (seatsPerSide * seatSizeM) + ((seatsPerSide + 1) * spacingM)
            const tableWidthM = Math.max(1.2, totalWidthM) // Min 1.2m

            const tableWidth = m2px(tableWidthM)
            const tableHeight = m2px(DIM_TABLE_DEPTH_RECT)
            const seatRadiusPx = m2px(DIM_SEAT_RADIUS)

            newElements.push({
                id: generateId(),
                groupId,
                type: 'table',
                shape: 'rect',
                x: center.x,
                y: center.y,
                width: tableWidth,
                height: tableHeight,
                label: tableLabel,
                section: selectedSection,
                color: preset.tableColor,
            })

            const seatsTop = Math.ceil(seatCount / 2)
            const seatsBottom = Math.floor(seatCount / 2)

            const stepX = m2px(seatSizeM + spacingM)

            for (let i = 0; i < seatsTop; i++) {
                const posOffset = (i - (seatsTop - 1) / 2) * stepX

                const thisSeatNum = currentSeatNum++
                newElements.push({
                    id: generateId(),
                    groupId,
                    type: 'seat',
                    x: center.x + posOffset,
                    y: center.y - (tableHeight / 2) - seatRadiusPx - 5,
                    radius: seatRadiusPx,
                    label: `${thisSeatNum}`,
                    section: selectedSection,
                    row: `T${tableNum}`,
                    seatNumber: thisSeatNum,
                    color: preset.seatColor,
                })
            }

            for (let i = 0; i < seatsBottom; i++) {
                const posOffset = (i - (seatsBottom - 1) / 2) * stepX
                const thisSeatNum = currentSeatNum++
                newElements.push({
                    id: generateId(),
                    groupId,
                    type: 'seat',
                    x: center.x + posOffset,
                    y: center.y + (tableHeight / 2) + seatRadiusPx + 5,
                    radius: seatRadiusPx,
                    label: `${thisSeatNum}`,
                    section: selectedSection,
                    row: `T${tableNum}`,
                    seatNumber: thisSeatNum,
                    color: preset.seatColor,
                })
            }
        }

        onAddElement(newElements)
    }

    // ============ ROW GENERATOR ============
    const handleGenerateRows = () => {
        const DIM_SEAT_RADIUS = DIMS.SEAT_RADIUS
        const DIM_SEAT_SPACING = DIMS.SEAT_SPACING // 0.6m center-to-center
        const DIM_ROW_SPACING = DIMS.ROW_SPACING   // 1.0m center-to-center

        const newElements: any[] = []
        const groupId = generateId()

        // Get section preset
        const preset = SECTION_PRESETS[rowSection as keyof typeof SECTION_PRESETS] || SECTION_PRESETS['Regular']

        const startX = 150
        const startY = 200

        for (let row = 0; row < rowCount; row++) {
            const rowLabel = String.fromCharCode(labelPrefix.charCodeAt(0) + row)

            for (let seat = 0; seat < seatsPerRow; seat++) {
                let x = startX + (seat * m2px(DIM_SEAT_SPACING))
                let y = startY + (row * m2px(DIM_ROW_SPACING))

                // Curved layout
                if (rowLayout === 'curved') {
                    const curveOffset = Math.abs(seat - seatsPerRow / 2) * 5
                    y += curveOffset
                }

                // Semicircle layout
                if (rowLayout === 'semicircle') {
                    const angle = (Math.PI / seatsPerRow) * seat
                    const radius = m2px(4.0) + (row * m2px(DIM_ROW_SPACING))
                    x = 400 + radius * Math.cos(angle - Math.PI / 2)
                    y = 400 + radius * Math.sin(angle - Math.PI / 2)
                }

                newElements.push({
                    id: generateId(),
                    groupId,
                    type: 'seat',
                    x,
                    y,
                    radius: m2px(DIM_SEAT_RADIUS),
                    label: `${rowLabel}${seat + 1}`,
                    section: rowSection,
                    row: rowLabel,
                    seatNumber: seat + 1,
                    color: preset.seatColor,
                })
            }
        }

        onAddElement(newElements)
    }

    // Primary selected element for backwards compatibility

    // ============ ALIGNMENT & DISTRIBUTION ============
    const alignElements = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
        if (selectedIds.length < 2) return

        const selectedElements = elements.filter(el => selectedIds.includes(el.id))
        if (selectedElements.length === 0) return

        let targetValue = 0

        // Calculate target value based on alignment type
        if (alignment === 'left') {
            targetValue = Math.min(...selectedElements.map(el => el.x - (el.width || 0) / 2))
        } else if (alignment === 'right') {
            targetValue = Math.max(...selectedElements.map(el => el.x + (el.width || 0) / 2))
        } else if (alignment === 'top') {
            targetValue = Math.min(...selectedElements.map(el => el.y - (el.height || 0) / 2))
        } else if (alignment === 'bottom') {
            targetValue = Math.max(...selectedElements.map(el => el.y + (el.height || 0) / 2))
        } else if (alignment === 'center') {
            // Average X center
            const minX = Math.min(...selectedElements.map(el => el.x - (el.width || 0) / 2))
            const maxX = Math.max(...selectedElements.map(el => el.x + (el.width || 0) / 2))
            targetValue = (minX + maxX) / 2
        } else if (alignment === 'middle') {
            // Average Y center
            const minY = Math.min(...selectedElements.map(el => el.y - (el.height || 0) / 2))
            const maxY = Math.max(...selectedElements.map(el => el.y + (el.height || 0) / 2))
            targetValue = (minY + maxY) / 2
        }

        const updatedElements = elements.map(el => {
            if (selectedIds.includes(el.id)) {
                let newX = el.x
                let newY = el.y

                if (alignment === 'left') newX = targetValue + (el.width || 0) / 2
                else if (alignment === 'right') newX = targetValue - (el.width || 0) / 2
                else if (alignment === 'center') newX = targetValue
                else if (alignment === 'top') newY = targetValue + (el.height || 0) / 2
                else if (alignment === 'bottom') newY = targetValue - (el.height || 0) / 2
                else if (alignment === 'middle') newY = targetValue

                return { ...el, x: newX, y: newY }
            }
            return el
        })

        onUpdateElements(updatedElements)
    }

    const distributeElements = (direction: 'horizontal' | 'vertical') => {
        if (selectedIds.length < 3) return

        const selectedElements = elements.filter(el => selectedIds.includes(el.id))

        // Sort elements by position
        selectedElements.sort((a, b) => direction === 'horizontal' ? a.x - b.x : a.y - b.y)

        const first = selectedElements[0]
        const last = selectedElements[selectedElements.length - 1]

        const totalDistance = direction === 'horizontal' ? last.x - first.x : last.y - first.y
        const step = totalDistance / (selectedElements.length - 1)

        const updatedElements = elements.map(el => {
            if (selectedIds.includes(el.id)) {
                const index = selectedElements.findIndex(e => e.id === el.id)
                if (index === 0 || index === selectedElements.length - 1) return el // Keep ends fixed

                if (direction === 'horizontal') {
                    return { ...el, x: first.x + step * index }
                } else {
                    return { ...el, y: first.y + step * index }
                }
            }
            return el
        })

        onUpdateElements(updatedElements)
    }

    return (
        <div className="space-y-4 text-sm">
            {/* ========== HISTORY & ARRANGE ========== */}
            <div className="grid grid-cols-2 gap-4 pb-2 border-b">
                {/* History */}
                <div>
                    <h3 className="font-semibold text-[10px] uppercase tracking-wider text-gray-500 mb-1">History</h3>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo} className="flex-1 h-8 px-0" title="Undo (Ctrl+Z)">
                            <span className="text-xs">↩ Undo</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo} className="flex-1 h-8 px-0" title="Redo (Ctrl+Shift+Z)">
                            <span className="text-xs">Redo ↪</span>
                        </Button>
                    </div>
                </div>

                {/* Arrange */}
                <div>
                    <h3 className="font-semibold text-[10px] uppercase tracking-wider text-gray-500 mb-1">Arrange</h3>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => alignElements('center')} disabled={selectedIds.length < 2} className="flex-1 h-8 px-0" title="Align Center">
                            <LuAlignCenter className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => alignElements('middle')} disabled={selectedIds.length < 2} className="flex-1 h-8 px-0" title="Align Middle">
                            <LuAlignCenterVertical className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => distributeElements('horizontal')} disabled={selectedIds.length < 3} className="flex-1 h-8 px-0" title="Distribute Horizontal">
                            <LuColumns3 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Expanded Alignment Tools (Only show if selection > 1) */}
            {selectedIds.length > 1 && (
                <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-medium text-gray-500 mb-1.5">Alignment Tools</p>
                    <div className="grid grid-cols-6 gap-1">
                        <Button variant="ghost" size="sm" className="h-6 px-0" onClick={() => alignElements('left')} title="Align Left"><LuAlignLeft /></Button>
                        <Button variant="ghost" size="sm" className="h-6 px-0" onClick={() => alignElements('center')} title="Align Center"><LuAlignCenter /></Button>
                        <Button variant="ghost" size="sm" className="h-6 px-0" onClick={() => alignElements('right')} title="Align Right"><LuAlignRight /></Button>
                        <Button variant="ghost" size="sm" className="h-6 px-0" onClick={() => alignElements('top')} title="Align Top"><LuAlignStartVertical /></Button>
                        <Button variant="ghost" size="sm" className="h-6 px-0" onClick={() => alignElements('middle')} title="Align Middle"><LuAlignCenterVertical /></Button>
                        <Button variant="ghost" size="sm" className="h-6 px-0" onClick={() => alignElements('bottom')} title="Align Bottom"><LuAlignEndVertical /></Button>
                    </div>
                </div>
            )}
            {/* ========== SEATING & FURNITURE ========== */}
            <div className="space-y-2">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <span>🪑</span> Seating & Furniture
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={addSeat} className="justify-start h-auto py-2.5 text-xs">
                        <LuCircle className="mr-2 w-4 h-4" /> Seat
                    </Button>
                    <Button variant="outline" onClick={addTable} className="justify-start h-auto py-2.5 text-xs">
                        <LuRectangleHorizontal className="mr-2 w-4 h-4" /> Table
                    </Button>
                    <Button variant="outline" onClick={addBar} className="justify-start h-auto py-2.5 text-xs">
                        <LuWine className="mr-2 w-4 h-4" /> Bar
                    </Button>
                    <Button variant="outline" onClick={addPillar} className="justify-start h-auto py-2.5 text-xs">
                        <LuGripVertical className="mr-2 w-4 h-4" /> Pillar
                    </Button>
                </div>
            </div>

            {/* ========== VENUE AREAS ========== */}
            <div className="space-y-2 pt-3 border-t">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <span>🎭</span> Venue Areas
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={addStage} className="justify-start h-auto py-2.5 text-xs">
                        <span className="mr-2">🎭</span> Stage
                    </Button>
                    <Button variant="outline" onClick={addDanceFloor} className="justify-start h-auto py-2.5 text-xs">
                        <LuRectangleHorizontal className="mr-2 w-4 h-4" /> Dance (Rect)
                    </Button>
                    <Button variant="outline" onClick={addDanceFloorCircle} className="justify-start h-auto py-2.5 text-xs">
                        <LuCircle className="mr-2 w-4 h-4" /> Dance (Circle)
                    </Button>
                    <Button variant="outline" onClick={addEntry} className="justify-start h-auto py-2.5 text-xs">
                        <LuDoorOpen className="mr-2 w-4 h-4" /> Entry
                    </Button>
                    <Button variant="outline" onClick={addEmergencyExit} className="justify-start h-auto py-2.5 text-xs text-green-600">
                        <LuTriangle className="mr-2 w-4 h-4" /> Exit
                    </Button>
                </div>
            </div>

            {/* ========== ROOM & WALLS ========== */}
            <div className="space-y-2 pt-3 border-t">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <span>🏠</span> Room & Walls
                </h3>

                {/* Room Generator */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 space-y-2">
                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">📐 Room Generator</p>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-[9px] text-gray-500">Width (m)</label>
                            <input
                                type="number"
                                value={roomWidth}
                                onChange={(e) => setRoomWidth(Number(e.target.value))}
                                className="w-full px-2 py-1 text-xs border rounded"
                                min={2}
                                max={100}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-500">Height (m)</label>
                            <input
                                type="number"
                                value={roomHeight}
                                onChange={(e) => setRoomHeight(Number(e.target.value))}
                                className="w-full px-2 py-1 text-xs border rounded"
                                min={2}
                                max={100}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-500">Wall (m)</label>
                            <input
                                type="number"
                                value={wallThickness}
                                onChange={(e) => setWallThickness(Number(e.target.value))}
                                className="w-full px-2 py-1 text-xs border rounded"
                                min={0.1}
                                max={1}
                                step={0.05}
                            />
                        </div>
                    </div>
                    <Button
                        variant="default"
                        onClick={generateRoom}
                        className="w-full h-8 text-xs bg-gradient-to-r from-slate-600 to-slate-700"
                    >
                        🏠 Generate Room ({roomWidth}×{roomHeight}m)
                    </Button>
                </div>

                {/* Quick Walls */}
                <div className="space-y-1.5">
                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">━ Horizontal Walls</p>
                    <div className="grid grid-cols-4 gap-1">
                        <Button variant="outline" onClick={() => addWall(2)} className="h-7 text-[10px] px-1">2m</Button>
                        <Button variant="outline" onClick={() => addWall(4)} className="h-7 text-[10px] px-1">4m</Button>
                        <Button variant="outline" onClick={() => addWall(6)} className="h-7 text-[10px] px-1">6m</Button>
                        <Button variant="outline" onClick={() => addWall(8)} className="h-7 text-[10px] px-1">8m</Button>
                    </div>

                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">┃ Vertical Walls</p>
                    <div className="grid grid-cols-4 gap-1">
                        <Button variant="outline" onClick={() => addVerticalWall(2)} className="h-7 text-[10px] px-1">2m</Button>
                        <Button variant="outline" onClick={() => addVerticalWall(4)} className="h-7 text-[10px] px-1">4m</Button>
                        <Button variant="outline" onClick={() => addVerticalWall(6)} className="h-7 text-[10px] px-1">6m</Button>
                        <Button variant="outline" onClick={() => addVerticalWall(8)} className="h-7 text-[10px] px-1">8m</Button>
                    </div>

                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">∟ Corner (L-Shape)</p>
                    <div className="grid grid-cols-2 gap-1">
                        <Button variant="outline" onClick={() => addCornerWall(3, 3)} className="h-7 text-[10px] px-1">3×3m</Button>
                        <Button variant="outline" onClick={() => addCornerWall(5, 5)} className="h-7 text-[10px] px-1">5×5m</Button>
                    </div>

                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">⌒ Curved Wall</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[9px] text-gray-500">Radius (m)</label>
                            <input
                                type="number"
                                value={curvedWallRadius}
                                onChange={(e) => setCurvedWallRadius(Number(e.target.value))}
                                className="w-full px-2 py-1 text-xs border rounded"
                                min={1}
                                max={20}
                                step={0.5}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-500">Angle (°)</label>
                            <input
                                type="number"
                                value={curvedWallAngle}
                                onChange={(e) => setCurvedWallAngle(Number(e.target.value))}
                                className="w-full px-2 py-1 text-xs border rounded"
                                min={5}
                                max={350}
                                step={5}
                            />
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => addCurvedWall(curvedWallRadius, 0, curvedWallAngle)}
                        className="w-full h-8 text-xs"
                    >
                        ⌒ Add Curved Wall ({curvedWallRadius}m, {curvedWallAngle}°)
                    </Button>

                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">🚪 Wall + Opening</p>
                    <div className="grid grid-cols-2 gap-1">
                        <Button
                            variant="outline"
                            onClick={() => addWallWithDoor(6, 1)}
                            className="h-8 text-[10px] px-1 flex items-center gap-1"
                        >
                            <LuDoorOpen className="w-3 h-3" />
                            Wall+Door
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => addWallWithWindow(6, 1.5)}
                            className="h-8 text-[10px] px-1 flex items-center gap-1"
                        >
                            <LuSquare className="w-3 h-3" />
                            Wall+Window
                        </Button>
                    </div>
                </div>

                {/* Structural Elements */}
                <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 pt-1">🧱 Other Elements</p>
                <div className="grid grid-cols-3 gap-1.5">
                    <Button variant="outline" onClick={addDoor} className="h-auto py-2 px-2 text-[10px] flex-col gap-1">
                        <LuDoorClosed className="w-4 h-4" />
                        <span>Door</span>
                    </Button>
                    <Button variant="outline" onClick={addWindow} className="h-auto py-2 px-2 text-[10px] flex-col gap-1">
                        <LuSquare className="w-4 h-4" />
                        <span>Window</span>
                    </Button>
                    <Button variant="outline" onClick={addStairs} className="h-auto py-2 px-2 text-[10px] flex-col gap-1">
                        <LuArrowUp className="w-4 h-4" />
                        <span>Stairs</span>
                    </Button>
                    <Button variant="outline" onClick={addLine} className="h-auto py-2 px-2 text-[10px] flex-col gap-1">
                        <LuMinus className="w-4 h-4" />
                        <span>Line</span>
                    </Button>
                    <Button variant="outline" onClick={addCircle} className="h-auto py-2 px-2 text-[10px] flex-col gap-1">
                        <LuCircle className="w-4 h-4" />
                        <span>Circle</span>
                    </Button>
                    <Button variant="outline" onClick={addPillar} className="h-auto py-2 px-2 text-[10px] flex-col gap-1">
                        <LuCircle className="w-4 h-4" />
                        <span>Pillar</span>
                    </Button>
                </div>
            </div>

            {/* ========== ADD TEXT ========== */}
            <div className="space-y-2 pt-3 border-t">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <LuType className="w-3 h-3" /> Add Text
                </h3>
                <Button variant="outline" onClick={handleTextButtonClick} className="w-full justify-start h-auto py-2.5 text-xs">
                    <LuType className="mr-2 w-4 h-4" /> Add Text Label
                </Button>
            </div>
            {/* Text Input Form */}
            {showTextInput && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border space-y-2">
                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter text..."
                        className="w-full px-2 py-1 text-sm border rounded"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') addText()
                            if (e.key === 'Escape') setShowTextInput(false)
                        }}
                    />
                    <div className="flex gap-2 items-center">
                        <label className="text-xs">Size:</label>
                        <select
                            value={textFontSize}
                            onChange={(e) => setTextFontSize(Number(e.target.value))}
                            className="flex-1 px-1 py-0.5 text-xs border rounded"
                        >
                            <option value={12}>12px</option>
                            <option value={14}>14px</option>
                            <option value={16}>16px</option>
                            <option value={18}>18px</option>
                            <option value={20}>20px</option>
                            <option value={24}>24px</option>
                            <option value={28}>28px</option>
                            <option value={32}>32px</option>
                        </select>
                        <Button
                            size="sm"
                            variant={textBold ? "default" : "outline"}
                            onClick={() => setTextBold(!textBold)}
                            className="h-6 px-2 text-xs font-bold"
                        >
                            B
                        </Button>
                    </div>
                    <div className="flex gap-1">
                        <Button size="sm" onClick={addText} className="flex-1 h-7 text-xs">
                            Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)} className="h-7 text-xs">
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* ========== EDIT TOOLS ========== */}
            {
                selectedIds.length > 0 && (
                    <div className="space-y-3 pt-3 border-t">
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-2">
                            <HiRefresh className="w-3 h-3" /> Edit Tools
                        </h3>

                        {/* Transform Tools */}
                        <div className="grid grid-cols-4 gap-1.5">
                            <Button
                                variant="outline"
                                onClick={handleDuplicate}
                                className="h-9 px-2"
                                title="Duplicate (Ctrl+D)"
                            >
                                <LuCopy className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleRotate(45)}
                                className="h-9 px-2"
                                title="Rotate 45°"
                            >
                                <span className="text-xs">45°</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleRotate(90)}
                                className="h-9 px-2"
                                title="Rotate 90°"
                            >
                                <LuRotateCw className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleRotate(-90)}
                                className="h-9 px-2"
                                title="Rotate -90°"
                            >
                                <LuRotateCw className="w-4 h-4 scale-x-[-1]" />
                            </Button>
                        </div>

                        {/* Flip Tools */}
                        <div className="grid grid-cols-4 gap-1.5">
                            <Button
                                variant="outline"
                                onClick={handleFlipH}
                                className="h-9 px-2"
                                title="Flip Horizontal"
                            >
                                <LuFlipHorizontal2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleFlipV}
                                className="h-9 px-2"
                                title="Flip Vertical"
                            >
                                <LuFlipVertical2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Grouping & Layer Tools */}
                        <div className="grid grid-cols-4 gap-1.5">
                            <Button
                                variant="outline"
                                onClick={handleGroup}
                                className="h-9 px-2"
                                title="Group (Ctrl+G)"
                                disabled={selectedIds.length < 2}
                            >
                                <LuGroup className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleUngroup}
                                className="h-9 px-2"
                                title="Ungroup (Ctrl+Shift+G)"
                            >
                                <LuUngroup className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleBringToFront}
                                className="h-9 px-2"
                                title="Bring to Front"
                            >
                                <LuArrowUpToLine className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleSendToBack}
                                className="h-9 px-2"
                                title="Send to Back"
                            >
                                <LuArrowDownToLine className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Boolean Operations */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500">Boolean Ops {selectedIds.length >= 2 ? '✓' : '(Select 2+)'}</label>
                            <div className="flex gap-1 flex-wrap">
                                <Button
                                    variant="outline"
                                    onClick={handleUnion}
                                    className="h-8 px-2 text-[10px]"
                                    title="Union - Combine shapes"
                                    disabled={selectedIds.length < 2}
                                >
                                    <LuMerge className="w-3 h-3 mr-1" /> Union
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSubtract}
                                    className="h-8 px-2 text-[10px]"
                                    title="Subtract - Cut shape from another"
                                    disabled={selectedIds.length !== 2}
                                >
                                    <LuScissors className="w-3 h-3 mr-1" /> Subtract
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleIntersect}
                                    className="h-8 px-2 text-[10px]"
                                    title="Intersect - Keep overlap only"
                                    disabled={selectedIds.length !== 2}
                                >
                                    <LuSquare className="w-3 h-3 mr-1" /> Intersect
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleExplode}
                                    className="h-8 px-2 text-[10px]"
                                    title="Explode - Break compound into parts"
                                >
                                    <LuSplit className="w-3 h-3 mr-1" /> Explode
                                </Button>
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500">Color</label>
                            <div className="flex gap-1 flex-wrap">
                                {['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#1e293b', '#ffffff'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleChangeColor(color)}
                                        className="w-6 h-6 rounded border-2 border-gray-300 hover:border-purple-500 transition-all"
                                        style={{ backgroundColor: color }}
                                        title={`Change to ${color}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                            variant="destructive"
                            onClick={onDelete}
                            className="w-full h-8 text-xs"
                        >
                            <HiTrash className="w-3 h-3 mr-1" /> Delete Selected
                        </Button>
                    </div>
                )
            }

            {/* ========== ALIGNMENT TOOLS ========== */}
            {
                selectedIds.length > 0 && (
                    <div className="space-y-2 pt-3 border-t">
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-2">
                            <HiArrowsExpand className="w-3 h-3" /> Alignment
                        </h3>
                        <div className="space-y-1.5">
                            <div className="flex gap-1">
                                <Button variant="outline" onClick={handleAlignLeft} className="flex-1 h-8 px-2" title="Align Left">
                                    <LuAlignLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" onClick={handleAlignCenter} className="flex-1 h-8 px-2" title="Align Center">
                                    <LuAlignCenter className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" onClick={handleAlignRight} className="flex-1 h-8 px-2" title="Align Right">
                                    <LuAlignRight className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="outline" onClick={handleAlignTop} className="flex-1 h-8 px-2" title="Align Top">
                                    <LuAlignStartVertical className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" onClick={handleAlignMiddle} className="flex-1 h-8 px-2" title="Align Middle">
                                    <LuAlignCenterVertical className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" onClick={handleAlignBottom} className="flex-1 h-8 px-2" title="Align Bottom">
                                    <LuAlignEndVertical className="w-4 h-4" />
                                </Button>
                            </div>
                            {/* Arrange buttons - align and distribute in one click */}
                            <div className="flex gap-1 pt-2 border-t mt-2">
                                <Button
                                    variant="default"
                                    onClick={handleArrangeVerticalColumn}
                                    className="flex-1 h-9 px-2 bg-purple-600 hover:bg-purple-700 text-white"
                                    title="Arrange in Horizontal Row (Same Y, Spread X)"
                                    disabled={selectedIds.length < 2}
                                >
                                    <LuColumns3 className="w-4 h-4 mr-1" />
                                    <span className="text-[10px]">ردیف افقی</span>
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={handleArrangeHorizontalRow}
                                    className="flex-1 h-9 px-2 bg-purple-600 hover:bg-purple-700 text-white"
                                    title="Arrange in Vertical Column (Same X, Spread Y)"
                                    disabled={selectedIds.length < 2}
                                >
                                    <LuRows3 className="w-4 h-4 mr-1" />
                                    <span className="text-[10px]">ستون عمودی</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* ========== TABLE GENERATOR ========== */}
            <div className="space-y-2 pt-3 border-t">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500">Table Generator</h3>
                <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    {/* Section Selection */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium">Section / Category</label>
                        <div className="grid grid-cols-3 gap-1">
                            {Object.entries(SECTION_PRESETS).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedSection(key)}
                                    className={`text-[10px] py-1.5 px-1 rounded border transition-all flex items-center justify-center gap-1 ${selectedSection === key
                                        ? 'ring-2 ring-offset-1 ring-purple-500 border-purple-500'
                                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100'
                                        }`}
                                    style={{
                                        backgroundColor: selectedSection === key ? preset.seatColor + '30' : undefined,
                                        borderColor: selectedSection === key ? preset.seatColor : undefined
                                    }}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full border"
                                        style={{ backgroundColor: preset.seatColor }}
                                    />
                                    <span>{key}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium">Seats</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="2" max="20"
                                value={seatCount}
                                onChange={e => setSeatCount(Number(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-sm font-mono w-6 text-center">{seatCount}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium">Shape</label>
                        <div className="flex gap-1">
                            {['round', 'rect'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setTableShape(s as any)}
                                    className={`flex-1 text-xs py-1.5 px-2 rounded border transition-colors ${tableShape === s ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-700 hover:bg-gray-100'}`}
                                >
                                    {s === 'round' ? '⭕ Round' : '⬜ Rect'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button onClick={handleGenerateTable} className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white">
                        Generate {selectedSection} Table
                    </Button>
                </div>
            </div>

            {/* ========== ROW GENERATOR ========== */}
            <div className="space-y-2 pt-3 border-t">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <LuRows3 className="w-3 h-3" /> Row Generator
                </h3>
                <div className="space-y-3 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-lg border border-indigo-200 dark:border-gray-700">

                    {/* Section Selection for Rows */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-medium text-gray-600">Section / Category</label>
                        <div className="grid grid-cols-3 gap-1">
                            {Object.entries(SECTION_PRESETS).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => setRowSection(key)}
                                    className={`text-[10px] py-1.5 px-1 rounded border transition-all flex items-center justify-center gap-1 ${rowSection === key
                                        ? 'ring-2 ring-offset-1 ring-indigo-500 border-indigo-500'
                                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100'
                                        }`}
                                    style={{
                                        backgroundColor: rowSection === key ? preset.seatColor + '30' : undefined,
                                        borderColor: rowSection === key ? preset.seatColor : undefined
                                    }}
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full border"
                                        style={{ backgroundColor: preset.seatColor }}
                                    />
                                    <span>{key}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-gray-600">Rows</label>
                            <input
                                type="number"
                                min="1" max="50"
                                value={rowCount}
                                onChange={e => setRowCount(Number(e.target.value))}
                                className="w-full h-7 text-xs border rounded px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-gray-600">Seats/Row</label>
                            <input
                                type="number"
                                min="1" max="100"
                                value={seatsPerRow}
                                onChange={e => setSeatsPerRow(Number(e.target.value))}
                                className="w-full h-7 text-xs border rounded px-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-gray-600">Row Gap (m)</label>
                            <input
                                type="number"
                                min="0.5" max="3" step="0.1"
                                value={rowSpacing}
                                onChange={e => setRowSpacing(Number(e.target.value))}
                                className="w-full h-7 text-xs border rounded px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-gray-600">Seat Gap (m)</label>
                            <input
                                type="number"
                                min="0.4" max="2" step="0.1"
                                value={seatSpacing}
                                onChange={e => setSeatSpacing(Number(e.target.value))}
                                className="w-full h-7 text-xs border rounded px-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-medium text-gray-600">Layout Style</label>
                        <div className="flex gap-1">
                            {[
                                { key: 'straight', label: '═ Straight' },
                                { key: 'curved', label: '⌒ Curved' },
                                { key: 'semicircle', label: '◠ Semi' }
                            ].map(l => (
                                <button
                                    key={l.key}
                                    onClick={() => setRowLayout(l.key as any)}
                                    className={`flex-1 text-[10px] py-1.5 px-1 rounded border transition-colors ${rowLayout === l.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-700 hover:bg-gray-100'}`}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-medium text-gray-600">Label Prefix</label>
                        <input
                            type="text"
                            maxLength={2}
                            value={labelPrefix}
                            onChange={e => setLabelPrefix(e.target.value.toUpperCase())}
                            className="w-full h-7 text-xs border rounded px-2"
                            placeholder="A, B, C..."
                        />
                    </div>

                    <div className="pt-1 text-[10px] text-gray-500 text-center">
                        Will create <span className="font-bold text-indigo-600">{rowCount * seatsPerRow}</span> seats
                    </div>

                    <Button onClick={handleGenerateRows} className="w-full h-9 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium">
                        <LuRows3 className="w-4 h-4 mr-2" />
                        Generate Seating Rows
                    </Button>
                </div>
            </div>

            {/* ========== FOOTER ========== */}
            <div className="pt-3 border-t">
                <p className="text-[10px] text-gray-400">
                    💡 Tip: Use Row Generator for theater-style seating, Table Generator for banquet-style.
                </p>
            </div>
        </div >
    )
}
