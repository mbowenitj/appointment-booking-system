import { HiCheckCircle, HiExternalLink, HiPlus } from 'react-icons/hi';
import { BookingConfirmation } from '../types';

interface Props {
  booking: BookingConfirmation;
  onBookAnother: () => void;
}

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function ConfirmationScreen({ booking, onBookAnother }: Props) {
  const formattedDate = new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const rows: { label: string; value: string }[] = [
    { label: 'Booking ID',  value: booking.id },
    { label: 'Branch',      value: booking.branchName },
    { label: 'Date',        value: formattedDate },
    { label: 'Time',        value: formatTime(booking.timeSlot) },
    { label: 'Name',        value: booking.customerName },
    { label: 'Email',       value: booking.customerEmail },
    ...(booking.customerPhone ? [{ label: 'Phone', value: booking.customerPhone }] : []),
  ];

  return (
    <div className="text-center">
      <div className="flex justify-center mb-5">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-md">
          <HiCheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900">Appointment Confirmed!</h3>
      <p className="text-gray-500 mt-2 text-sm">
        A confirmation email has been sent to{' '}
        <span className="font-semibold text-gray-700">{booking.customerEmail}</span>.
      </p>

      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left max-w-md mx-auto">
        {rows.map(({ label, value }, idx) => (
          <div
            key={label}
            className={`flex items-start gap-4 px-5 py-3.5 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 w-24 flex-shrink-0 pt-0.5">
              {label}
            </span>
            <span className="text-sm text-gray-800 font-medium break-all">{value}</span>
          </div>
        ))}
      </div>

      {booking.emailPreviewUrl && (
        <div className="mt-5 p-4 bg-indigo-50 border border-indigo-200 rounded-xl max-w-md mx-auto">
          <p className="text-sm text-indigo-700 font-medium mb-2">📧 Simulated email preview</p>
          <a
            href={booking.emailPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors"
          >
            View Confirmation Email
            <HiExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          </a>
          {/* <p className="text-xs text-indigo-400 mt-1">Opens Ethereal Mail – a free email testing service</p> */}
        </div>
      )}

      <button
        onClick={onBookAnother}
        className="mt-8 inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3
                   rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
      >
        <HiPlus className="w-4 h-4" />
        Book Another Appointment
      </button>
    </div>
  );
}
