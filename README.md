# Event Booking System

A comprehensive event booking web application built with Next.js, featuring ticket management, QR check-in, and admin dashboard.

## Features

- 🎫 **Event Browsing** - List and detail views for events
- 🛒 **Booking System** - Multi-person booking with adult/child pricing
- 💳 **Stripe Payments** - Secure online payments
- 📱 **QR Tickets** - Digital tickets with QR codes
- ✅ **Partial Check-in** - Scan multiple times for group entry
- 👨‍💼 **Admin Dashboard** - Event management and analytics
- 📊 **Reports** - Sales and capacity tracking

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy and edit .env file with your values:
# DATABASE_URL="postgresql://username:password@localhost:5432/eventbooking"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-key"
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
# NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Push database schema:
```bash
npm run db:push
```

5. Seed the database:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

### Test Accounts

After seeding:
- **Admin**: admin@eventbook.com / admin123
- **Staff**: staff@eventbook.com / staff123

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── admin/         # Admin dashboard
│   ├── events/        # Event pages
│   ├── booking/       # Booking pages
│   └── staff/         # Staff check-in
├── components/        # React components
├── lib/               # Utilities & config
└── types/             # TypeScript types
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/events | List events |
| GET | /api/events/:id | Event details |
| POST | /api/bookings | Create booking |
| GET | /api/bookings | Get booking |
| POST | /api/checkin/scan | Check-in with QR |
| GET | /api/admin/events | Admin: List events |
| POST | /api/admin/events | Admin: Create event |

## Stripe Webhook

Set up webhook for payment confirmations:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## License

MIT
