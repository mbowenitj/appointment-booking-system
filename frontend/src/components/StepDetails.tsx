import { HiExclamationCircle } from 'react-icons/hi';
import { CustomerDetails, FieldErrors } from '../types';

interface FieldConfig {
  id: keyof CustomerDetails;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  autoComplete: string;
}

interface Props {
  details: CustomerDetails;
  onChange: (field: keyof CustomerDetails, value: string) => void;
  errors: FieldErrors;
}

const FIELDS: FieldConfig[] = [
  {
    id: 'customerName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter your full name',
    required: true,
    autoComplete: 'name',
  },
  {
    id: 'customerEmail',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
    autoComplete: 'email',
  },
  {
    id: 'customerPhone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Enter your phone number',
    required: false,
    autoComplete: 'tel',
  },
];

export default function StepDetails({ details, onChange, errors }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Your Details</h3>
      <p className="text-sm text-gray-500 mb-6">We'll send your confirmation to your email.</p>

      <div className="space-y-5 max-w-md">
        {FIELDS.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              value={details[field.id]}
              onChange={(e) => onChange(field.id, e.target.value)}
              className={`w-full border-2 rounded-xl px-4 py-3 text-sm text-gray-900
                          placeholder-gray-400 transition-all
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                          ${errors[field.id] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
            />
            {errors[field.id] && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <HiExclamationCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
