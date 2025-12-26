import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
    const email = 'admin@eventbook.com'
    const password = 'admin123'

    // Check if user exists
    const existing = await prisma.user.findUnique({
        where: { email }
    })

    if (existing) {
        console.log('Admin user already exists:', email)
        console.log('Password: admin123')
        return
    }

    // Create admin user
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
        data: {
            email,
            name: 'Admin User',
            passwordHash,
            role: 'ADMIN',
            isActive: true
        }
    })

    console.log('✅ Admin user created!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Role:', user.role)
}

createAdminUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
