import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NewsletterSubscribe } from '@/components/newsletter/newsletter-subscribe'
import {
  HiArrowRight,
  HiSparkles,
  HiShieldCheck,
  HiLightningBolt,
  HiCalendar,
  HiHeart,
  HiTicket,
  HiUserGroup
} from 'react-icons/hi'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm mb-8">
              <HiSparkles className="h-4 w-4 mr-2" />
              <span>The easiest way to book events</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover & Book
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Amazing Events
              </span>
            </h1>

            <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-10">
              From concerts to conferences, find and book tickets for the best events
              in your city with just a few clicks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/events">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
                  Browse Events
                  <HiArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/calendar">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <HiCalendar className="mr-2 h-5 w-5" />
                  View Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-gray-50 dark:fill-gray-950">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: HiTicket, title: 'Upcoming Events', href: '/events', color: 'from-purple-500 to-indigo-500' },
              { icon: HiCalendar, title: 'Event Calendar', href: '/calendar', color: 'from-blue-500 to-cyan-500' },
              { icon: HiHeart, title: 'My Wishlist', href: '/wishlist', color: 'from-red-500 to-pink-500' },
              { icon: HiUserGroup, title: 'My Bookings', href: '/my-bookings', color: 'from-green-500 to-emerald-500' },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                  {item.title}
                </span>
                <HiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose EventBook?
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              The complete solution for event booking and management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: HiLightningBolt,
                title: 'Instant Booking',
                description:
                  'Book your tickets in seconds with our streamlined checkout process.',
              },
              {
                icon: HiShieldCheck,
                title: 'Secure Payments',
                description:
                  'Your transactions are protected with industry-standard encryption.',
              },
              {
                icon: HiSparkles,
                title: 'Digital Tickets',
                description:
                  'Get your QR-coded tickets instantly on your phone or email.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="relative group p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Events Hosted' },
              { value: '50K+', label: 'Happy Customers' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  {stat.value}
                </div>
                <div className="mt-2 text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSubscribe />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to explore events?
          </h2>
          <p className="text-purple-100 mb-8">
            Join thousands of people who discover amazing events every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/events">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
                Get Started
                <HiArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">EventBook</h3>
              <p className="text-gray-400">
                Your one-stop platform for discovering and booking amazing events.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
                <li><Link href="/calendar" className="hover:text-white transition-colors">Event Calendar</Link></li>
                <li><Link href="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
                <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">My Account</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} EventBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
