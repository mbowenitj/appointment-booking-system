import { HiCheck } from 'react-icons/hi';

interface Step {
  id: number;
  label: string;
}

const STEPS: Step[] = [
  { id: 1, label: 'Branch' },
  { id: 2, label: 'Date' },
  { id: 3, label: 'Time Slot' },
  { id: 4, label: 'Your Details' },
];

interface Props {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-center mb-8 select-none">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isActive    = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : isActive
                    ? 'bg-white border-indigo-600 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <HiCheck className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive ? 'text-indigo-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-1 mb-4 sm:mb-0 transition-all duration-300 ${
                  currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
