import { HiCalendar } from 'react-icons/hi';

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  branchName?: string;
}

export default function StepDate({ selectedDate, onSelect, branchName }: Props) {
  const today   = new Date().toISOString().split('T')[0];
  const maxDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  })();

  const formatted = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Select a Date</h3>
      {branchName && (
        <p className="text-sm text-gray-500 mb-6">
          Branch: <span className="font-medium text-indigo-600">{branchName}</span>
        </p>
      )}

      <div className="flex flex-col items-center justify-center gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm w-full max-w-sm">
          <label htmlFor="date-picker" className="block text-sm font-medium text-gray-600 mb-3">
            Choose your preferred date
          </label>
          <input
            id="date-picker"
            type="date"
            min={today}
            max={maxDate}
            value={selectedDate}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-base
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       transition-all cursor-pointer"
          />
        </div>

        {formatted && (
          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3">
            <HiCalendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <span className="text-indigo-700 font-medium text-sm">{formatted}</span>
          </div>
        )}
      </div>
    </div>
  );
}
