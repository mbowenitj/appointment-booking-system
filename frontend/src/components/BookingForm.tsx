import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  HiExclamationCircle,
  HiChevronLeft,
  HiChevronRight,
  HiCheck,
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

import StepIndicator from './StepIndicator';
import StepBranch from './StepBranch';
import StepDate from './StepDate';
import StepTimeSlot from './StepTimeSlot';
import StepDetails from './StepDetails';
import ConfirmationScreen from './ConfirmationScreen';

import { fetchBranches, fetchSlots, createBooking } from '../services/api';
import {
  Branch,
  SlotInfo,
  BookingConfirmation,
  CustomerDetails,
  FieldErrors,
} from '../types';

const INITIAL_DETAILS: CustomerDetails = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
};

export default function BookingForm() {
  const [step, setStep] = useState(1);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [confirmed, setConfirmed] = useState<BookingConfirmation | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [details, setDetails] = useState<CustomerDetails>(INITIAL_DETAILS);

  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setLoadingBranches(true);
    fetchBranches()
      .then(setBranches)
      .catch(() => setApiError('Failed to load branches. Please refresh.'))
      .finally(() => setLoadingBranches(false));
  }, []);

  useEffect(() => {
    if (!selectedBranch || !selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot('');
    fetchSlots(selectedBranch.id, selectedDate)
      .then(setSlots)
      .catch(() => setApiError('Failed to load time slots. Please try again.'))
      .finally(() => setLoadingSlots(false));
  }, [selectedBranch, selectedDate]);

  const handleDetailChange = useCallback((field: keyof CustomerDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  function validateDetails(): boolean {
    const errors: FieldErrors = {};
    if (!details.customerName.trim()) {
      errors.customerName = 'Full name is required.';
    }
    if (!details.customerEmail.trim()) {
      errors.customerEmail = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateDetails()) return;
    if (!selectedBranch || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setApiError('');

    try {
      const booking = await createBooking({
        branchId: selectedBranch.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        customerName: details.customerName.trim(),
        customerEmail: details.customerEmail.trim().toLowerCase(),
        customerPhone: details.customerPhone.trim(),
      });
      setConfirmed({ ...booking, branchName: selectedBranch.name });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setApiError(err.response.data.error as string);
        // If double-booking, go back to slot picker
        if (err.response.status === 409) {
          setSelectedSlot('');
          setStep(3);
          // Refresh slots
          setLoadingSlots(true);
          fetchSlots(selectedBranch.id, selectedDate)
            .then(setSlots)
            .finally(() => setLoadingSlots(false));
        }
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setStep(1);
    setSelectedBranch(null);
    setSelectedDate('');
    setSelectedSlot('');
    setDetails(INITIAL_DETAILS);
    setFieldErrors({});
    setApiError('');
    setConfirmed(null);
  }

  const canAdvance = (): boolean => {
    if (step === 1) return selectedBranch !== null;
    if (step === 2) return selectedDate !== '';
    if (step === 3) return selectedSlot !== '';
    return true;
  };

  if (confirmed) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
        <ConfirmationScreen booking={confirmed} onBookAnother={handleReset} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
      <StepIndicator currentStep={step} />

      <div className="min-h-[300px]">
        {step === 1 && (
          <StepBranch
            branches={branches}
            selected={selectedBranch}
            onSelect={(b) => { setSelectedBranch(b); setApiError(''); }}
            loading={loadingBranches}
          />
        )}
        {step === 2 && (
          <StepDate
            selectedDate={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setApiError(''); }}
            branchName={selectedBranch?.name}
          />
        )}
        {step === 3 && (
          <StepTimeSlot
            slots={slots}
            selected={selectedSlot}
            onSelect={(t) => { setSelectedSlot(t); setApiError(''); }}
            loading={loadingSlots}
            branchName={selectedBranch?.name}
            date={selectedDate}
          />
        )}
        {step === 4 && (
          <StepDetails
            details={details}
            onChange={handleDetailChange}
            errors={fieldErrors}
          />
        )}
      </div>

      {apiError && (
        <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <HiExclamationCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {apiError}
        </div>
      )}

      <div className="mt-8 flex justify-between items-center pt-5 border-t border-gray-100">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-300
                     text-gray-700 font-medium text-sm hover:border-gray-400 hover:bg-gray-50
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <HiChevronLeft className="w-4 h-4" />
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white
                       font-semibold text-sm hover:bg-indigo-700 active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Next
            <HiChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white
                       font-semibold text-sm hover:bg-emerald-700 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {submitting ? (
              <>
                <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                Confirming…
              </>
            ) : (
              <>
                Confirm Booking
                <HiCheck className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
