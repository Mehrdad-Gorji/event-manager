import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, password } = body

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            )
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone: phone || null,
                passwordHash,
                role: 'CUSTOMER'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
            user
        }, { status: 201 })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        )
    }
}
