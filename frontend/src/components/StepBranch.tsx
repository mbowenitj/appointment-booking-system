import { HiLocationMarker, HiCheck } from 'react-icons/hi';
import { Branch } from '../types';

interface Props {
  branches: Branch[];
  selected: Branch | null;
  onSelect: (branch: Branch) => void;
  loading: boolean;
}

export default function StepBranch({ branches, selected, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Branch</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {branches.map((branch) => {
          const isSelected = selected?.id === branch.id;
          return (
            <button
              key={branch.id}
              onClick={() => onSelect(branch)}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 group ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-indigo-600' : 'bg-indigo-100 group-hover:bg-indigo-200'
                  }`}
                >
                  <HiLocationMarker className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                </div>

                <div className="min-w-0">
                  <p className={`font-semibold text-base ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {branch.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{branch.address}</p>
                  <p className="text-xs text-gray-400 mt-1">{branch.phone}</p>
                </div>

                {isSelected && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <HiCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
