
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding 500-seat venue...')

    const elements: any[] = []
    let yOffset = 100

    // 1. VIP SECTION (Gold)
    // 5 Round Tables of 10 seats = 50 seats
    // Section: "VIP"
    console.log('Generating VIP Section...')
    for (let t = 0; t < 5; t++) {
        const tableId = uuidv4()
        const centerX = 150 + (t * 150) // Spread horizontally
        const centerY = yOffset

        // Table
        elements.push({
            id: tableId,
            type: 'table',
            shape: 'circle',
            x: centerX,
            y: centerY,
            radius: 40,
            label: `VIP-${t + 1}`,
            color: '#fbbf24', // Gold
            section: 'VIP'
        })

        // Seats
        for (let s = 0; s < 10; s++) {
            const angle = (s / 10) * Math.PI * 2
            const seatX = centerX + Math.cos(angle) * 60
            const seatY = centerY + Math.sin(angle) * 60

            elements.push({
                id: uuidv4(),
                type: 'seat',
                x: seatX,
                y: seatY,
                radius: 10,
                color: '#fbbf24',
                label: `${t + 1}-${s + 1}`,
                section: 'VIP',
                groupId: tableId
            })
        }
    }

    yOffset += 200

    // 2. GENERAL SECTION (Blue)
    // 45 Rectangular Tables of 10 seats = 450 seats
    // Grid: 5 rows of 9 tables
    console.log('Generating General Section...')
    const rows = 5
    const cols = 9

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tableId = uuidv4()
            // Position
            const startX = 50
            const tableW = 120
            const tableH = 60
            const gapX = 150
            const gapY = 150

            const centerX = startX + (c * gapX) + (tableW / 2)
            const centerY = yOffset + (r * gapY) + (tableH / 2) // center of tablerect

            // Rect Table (x,y is top-left for render usually, but let's check venue-canvas logic)
            // VenueCanvas: Rect x,y is center if offsetX is set.
            // Let's assume x,y is center for simplicity in this generator logic 
            // and rely on my `VenueSelection` update heavily.
            // Actually, let's look at `VenueCanvas`:
            // <Rect x={el.x} y={el.y} width={el.width} height={el.height} offsetX={el.width/2} offsetY={el.height/2} ... />
            // So YES, x,y is center.

            elements.push({
                id: tableId,
                type: 'table',
                shape: 'rect',
                x: centerX,
                y: centerY,
                width: tableW,
                height: tableH,
                label: `G-${r + 1}-${c + 1}`,
                color: '#94a3b8', // Slate
                section: 'General'
            })

            // Seats around rect
            // 4 top, 4 bottom, 1 left, 1 right = 10 seats
            // Or simplified: 5 top, 5 bottom

            // Top Row
            for (let s = 0; s < 5; s++) {
                const sx = (centerX - tableW / 2) + (tableW / 5) / 2 + (s * (tableW / 5))
                const sy = centerY - tableH / 2 - 15
                elements.push({
                    id: uuidv4(),
                    type: 'seat',
                    x: sx,
                    y: sy,
                    radius: 8,
                    color: '#cbd5e1',
                    label: `S${s}`,
                    section: 'General',
                    groupId: tableId
                })
            }
            // Bottom Row
            for (let s = 0; s < 5; s++) {
                const sx = (centerX - tableW / 2) + (tableW / 5) / 2 + (s * (tableW / 5))
                const sy = centerY + tableH / 2 + 15
                elements.push({
                    id: uuidv4(),
                    type: 'seat',
                    x: sx,
                    y: sy,
                    radius: 8,
                    color: '#cbd5e1',
                    label: `S${s + 5}`,
                    section: 'General',
                    groupId: tableId
                })
            }
        }
    }

    // Create Layout
    const layout = await prisma.venueLayout.create({
        data: {
            name: 'Grand Ballroom (500 Seats)',
            description: 'Auto-generated 500 pax layout with VIP and General sections',
            canvasWidth: 1500,
            canvasHeight: 1200,
            width: 30, // 30m
            depth: 25, // 25m
            elements: elements
        }
    })

    console.log(`Created layout: ${layout.name} with ${elements.length} elements`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
