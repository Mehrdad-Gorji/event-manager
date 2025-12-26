import { CalendarView } from '@/components/calendar/calendar-view'

export default function CalendarPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Events Calendar
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Browse and discover events by date
                    </p>
                </div>

                <CalendarView />
            </div>
        </div>
    )
}
