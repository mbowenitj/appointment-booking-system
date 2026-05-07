import { HiCalendar } from 'react-icons/hi';
import BookingForm from './components/BookingForm';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <HiCalendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Book Easy</span>
          <span className="hidden sm:block text-sm text-gray-400 ml-2 font-medium">
            Branch Appointment Booking
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Book an Appointment</h2>
          <p className="mt-2 text-gray-500">
            Choose your branch, pick a date and time, and you're all set.
          </p>
        </div>
        <BookingForm />
      </main>

      <footer className="text-center text-xs text-gray-400 py-8">
        © {new Date().getFullYear()} BookEasy. All rights reserved.
      </footer>
    </div>
  );
}
