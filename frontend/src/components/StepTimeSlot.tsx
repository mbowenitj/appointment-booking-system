import { SlotInfo } from '../types';

interface Props {
  slots: SlotInfo[];
  selected: string;
  onSelect: (time: string) => void;
  loading: boolean;
  branchName?: string;
  date: string;
}

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function StepTimeSlot({ slots, selected, onSelect, loading, branchName, date }: Props) {
  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : '';

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Time Slot</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Select a Time Slot</h3>
      <p className="text-sm text-gray-500 mb-2">
        {branchName && (
          <>
            <span className="font-medium text-indigo-600">{branchName}</span>
            {' · '}
          </>
        )}
        {formattedDate}
      </p>
      <p className="text-xs text-gray-400 mb-5">
        {availableCount} slot{availableCount !== 1 ? 's' : ''} available
      </p>

      <div className="flex gap-4 mb-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Selected
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {slots.map(({ time, available }) => {
          const isSelected = selected === time;
          return (
            <button
              key={time}
              disabled={!available}
              onClick={() => available && onSelect(time)}
              className={`slot-btn ${
                isSelected ? 'slot-selected' : available ? 'slot-available' : 'slot-booked'
              }`}
            >
              {formatTime(time)}
            </button>
          );
        })}
      </div>

      {availableCount === 0 && (
        <p className="mt-6 text-center text-sm text-red-500 font-medium">
          No slots available for this date. Please choose another date.
        </p>
      )}
    </div>
  );
}
