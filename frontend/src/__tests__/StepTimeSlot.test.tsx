import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StepTimeSlot from '../components/StepTimeSlot';

const futureDate = '2099-12-31';

const makeSlots = (times: string[], bookedTimes: string[] = []) =>
  times.map((time) => ({ time, available: !bookedTimes.includes(time) }));

const allSlots = makeSlots([
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
]);

describe('StepTimeSlot', () => {
  describe('formatTime display', () => {
    it('formats 09:00 as "9:00 AM"', () => {
      render(
        <StepTimeSlot
          slots={makeSlots(['09:00'])}
          selected=""
          onSelect={vi.fn()}
          loading={false}
          date={futureDate}
        />,
      );
      expect(screen.getByRole('button', { name: '9:00 AM' })).toBeInTheDocument();
    });

    it('formats 13:30 as "1:30 PM"', () => {
      render(
        <StepTimeSlot
          slots={makeSlots(['13:30'])}
          selected=""
          onSelect={vi.fn()}
          loading={false}
          date={futureDate}
        />,
      );
      expect(screen.getByRole('button', { name: '1:30 PM' })).toBeInTheDocument();
    });

    it('formats 12:00 as "12:00 PM"', () => {
      render(
        <StepTimeSlot
          slots={makeSlots(['12:00'])}
          selected=""
          onSelect={vi.fn()}
          loading={false}
          date={futureDate}
        />,
      );
      expect(screen.getByRole('button', { name: '12:00 PM' })).toBeInTheDocument();
    });
  });

  describe('available vs unavailable slots', () => {
    it('enables available slots and disables booked slots', () => {
      const slots = makeSlots(['09:00', '10:00'], ['10:00']);
      render(
        <StepTimeSlot
          slots={slots}
          selected=""
          onSelect={vi.fn()}
          loading={false}
          date={futureDate}
        />,
      );
      expect(screen.getByRole('button', { name: '9:00 AM' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: '10:00 AM' })).toBeDisabled();
    });

    it('calls onSelect with the time when an available slot is clicked', async () => {
      const onSelect = vi.fn();
      render(
        <StepTimeSlot
          slots={makeSlots(['10:00'])}
          selected=""
          onSelect={onSelect}
          loading={false}
          date={futureDate}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '10:00 AM' }));
      expect(onSelect).toHaveBeenCalledWith('10:00');
    });

    it('does not call onSelect when a booked slot is clicked', async () => {
      const onSelect = vi.fn();
      render(
        <StepTimeSlot
          slots={makeSlots(['10:00'], ['10:00'])}
          selected=""
          onSelect={onSelect}
          loading={false}
          date={futureDate}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: '10:00 AM' }));
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('available count', () => {
    it('shows correct available count', () => {
      const slots = makeSlots(['09:00', '10:00', '11:00'], ['10:00']);
      render(
        <StepTimeSlot
          slots={slots}
          selected=""
          onSelect={vi.fn()}
          loading={false}
          date={futureDate}
        />,
      );
      expect(screen.getByText(/2 slots available/i)).toBeInTheDocument();
    });

    it('uses singular "slot" when only one is available', () => {
      const slots = makeSlots(['09:00', '10:00'], ['10:00']);
      render(
        <StepTimeSlot
          slots={slots}
          selected=""
          onSelect={vi.fn()}
          loading={false}
          date={futureDate}
        />,
      );
      expect(screen.getByText(/1 slot available/i)).toBeInTheDocument();
    });

    it('shows "No slots available" message when all slots are booked', () => {
      const slots = makeSlots(['09:00'], ['09:00']);
      render(
        <StepTimeSlot
          slots={slots}
          selected=""
          onSelect={vi.fn()}
          loading={false}
          date={futureDate}
        />,
      );
      expect(screen.getByText(/no slots available/i)).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('renders skeleton placeholders instead of buttons when loading', () => {
      render(
        <StepTimeSlot
          slots={[]}
          selected=""
          onSelect={vi.fn()}
          loading={true}
          date={futureDate}
        />,
      );
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('past-slot filtering for today', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-08T10:15:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('disables slots at or before the current time when date is today', () => {
      // 09:00 and 10:00 are past; 10:30 is future
      const slots = makeSlots(['09:00', '10:00', '10:30']);
      render(
        <StepTimeSlot
          slots={slots}
          selected=""
          onSelect={vi.fn()}
          loading={false}
          date="2026-05-08"
        />,
      );
      expect(screen.getByRole('button', { name: '9:00 AM' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '10:00 AM' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '10:30 AM' })).not.toBeDisabled();
    });
  });

  describe('branch name display', () => {
    it('renders the branch name when provided', () => {
      render(
        <StepTimeSlot
          slots={allSlots}
          selected=""
          onSelect={vi.fn()}
          loading={false}
          branchName="Sea Point"
          date={futureDate}
        />,
      );
      expect(screen.getByText('Sea Point')).toBeInTheDocument();
    });
  });
});
