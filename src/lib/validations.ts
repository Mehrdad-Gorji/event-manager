import { z } from 'zod'

// Event status enum
const eventStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'SOLDOUT', 'CANCELLED', 'COMPLETED'])

// Event schemas
export const createEventSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional(),
    rules: z.string().optional(),
    coverImage: z.string().optional().or(z.literal('')).nullable(),
    eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional().nullable(),
    doorsOpenTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional().nullable(),
    maxCapacity: z.coerce.number().int().positive('Capacity must be positive'),

    // Legacy pricing (kept for backward compatibility, optional if tiers exist)
    adultPrice: z.coerce.number().nonnegative().optional().default(0),
    childPrice: z.coerce.number().nonnegative().optional().nullable(),
    vipPrice: z.coerce.number().nonnegative().optional().nullable(),

    serviceFeePercent: z.coerce.number().min(0).max(100).default(0),
    taxPercent: z.coerce.number().min(0).max(100).default(0),
    venueName: z.string().min(1, 'Venue name is required'),
    venueAddress: z.string().optional().nullable(),
    reEntryAllowed: z.boolean().default(false),

    venueLayoutId: z.string().optional().nullable(), // Link to visual layout

    // New Advanced Features
    ticketTiers: z.array(z.object({
        name: z.string().min(1, 'Tier name is required'),
        price: z.coerce.number().nonnegative(),
        capacity: z.coerce.number().int().positive().optional().nullable(),
        description: z.string().optional(),
        sectionMatcher: z.string().optional().nullable(),
    })).optional().default([]),

    addOns: z.array(z.object({
        name: z.string().min(1, 'Add-on name is required'),
        price: z.coerce.number().nonnegative(),
        stock: z.coerce.number().int().positive().optional().nullable(),
        description: z.string().optional()
    })).optional().default([]),
})

// Update schema includes status and allows partial updates
export const updateEventSchema = createEventSchema.partial().extend({
    status: eventStatusEnum.optional(),
})

// Booking schemas
export const createBookingSchema = z.object({
    eventId: z.string().min(1, 'Event ID is required'),
    adultCount: z.number().int().min(0).default(0),
    childCount: z.number().int().min(0).default(0),
    vipCount: z.number().int().min(0).default(0),
    guestEmail: z.string().email('Invalid email').optional(),
    guestPhone: z.string().optional().or(z.literal('')),
    guestName: z.string().optional(),
    items: z.array(z.object({
        ticketTierId: z.string().optional(),
        addOnId: z.string().optional(),
        quantity: z.number().int().positive(),
        seatId: z.string().optional(),
    })).optional().default([]),
}).refine((data) => {
    const legacyCount = (data.adultCount || 0) + (data.childCount || 0) + (data.vipCount || 0);
    const itemsCount = data.items ? data.items.length : 0;
    return legacyCount > 0 || itemsCount > 0;
}, {
    message: 'At least one ticket or item must be selected',
})

// Check-in schemas
export const checkInSchema = z.object({
    qrToken: z.string().min(1, 'QR token is required'),
    personsEntering: z.number().int().positive('Must enter at least 1 person'),
})

export const checkInCorrectionSchema = z.object({
    ticketId: z.string().min(1, 'Ticket ID is required'),
    newCheckedInCount: z.number().int().min(0),
    reason: z.string().min(1, 'Reason is required'),
})

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
})

// Venue Layout Schemas
const venueElementSchema = z.object({
    id: z.string(),
    type: z.enum([
        'seat', 'table', 'wall', 'stage', 'text', 'dancefloor', 'bar', 'entry', 'pillar',
        'door', 'window', 'emergency', 'stairs', 'line', 'dancefloor-circle', 'compound'
    ]),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    rotation: z.number().optional(),
    label: z.string().optional(),
    color: z.string().optional(),
    tierId: z.string().optional(),
    capacity: z.number().optional(),
    radius: z.number().optional(),
    groupId: z.string().optional(),
    section: z.string().optional(),
    fontSize: z.number().optional(),
    shape: z.string().optional(),
    row: z.string().optional(),
    seatNumber: z.number().optional(),
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
    fontWeight: z.string().optional(),
    // Compound shape properties
    operation: z.string().optional(),
    children: z.array(z.string()).optional(),
    baseShape: z.string().optional(),
    cutShape: z.string().optional(),
    compoundId: z.string().optional(),
    hidden: z.boolean().optional(),
}).passthrough() // Allow extra properties for flexibility

export const createVenueLayoutSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    canvasWidth: z.coerce.number().min(100).default(800),
    canvasHeight: z.coerce.number().min(100).default(600),
    width: z.coerce.number().min(1).default(20), // Physical width in meters
    depth: z.coerce.number().min(1).default(15), // Physical depth in meters
    elements: z.array(venueElementSchema).default([]),
})

export const updateVenueLayoutSchema = createVenueLayoutSchema.partial()

// Types
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type CheckInInput = z.infer<typeof checkInSchema>
export type CheckInCorrectionInput = z.infer<typeof checkInCorrectionSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
