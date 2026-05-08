import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the pg pool before importing store
vi.mock('../db/database', () => ({
  default: { query: vi.fn() },
}));

import pool from '../db/database';
import {
  getBranches,
  getBranchById,
  getAvailableSlots,
  createBooking,
  cancelBooking,
} from '../data/store';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getBranches', () => {
  it('returns branch rows from the database', async () => {
    const branches = [
      { id: '1', name: 'City Centre', address: '1 Adderley St', phone: '021 001' },
    ];
    mockQuery.mockResolvedValue({ rows: branches });

    const result = await getBranches();
    expect(result).toEqual(branches);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
    );
  });
});

describe('getBranchById', () => {
  it('returns the branch when found', async () => {
    const branch = { id: '1', name: 'City Centre', address: '1 Adderley St', phone: '021 001' };
    mockQuery.mockResolvedValue({ rows: [branch] });

    const result = await getBranchById('1');
    expect(result).toEqual(branch);
  });

  it('returns null when branch does not exist', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const result = await getBranchById('999');
    expect(result).toBeNull();
  });
});

describe('getAvailableSlots', () => {
  it('returns 16 slots for a future date with none booked', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const slots = await getAvailableSlots('1', '2099-12-31');
    expect(slots).toHaveLength(16);
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it('marks booked slots as unavailable', async () => {
    mockQuery.mockResolvedValue({ rows: [{ time_slot: '09:00' }, { time_slot: '14:00' }] });

    const slots = await getAvailableSlots('1', '2099-12-31');
    const booked = slots.filter((s) => !s.available).map((s) => s.time);
    expect(booked).toContain('09:00');
    expect(booked).toContain('14:00');
    expect(slots.filter((s) => s.available)).toHaveLength(14);
  });

  it('marks past time slots as unavailable when booking for today', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    // Fix "now" to 10:15 on a known date
    const fakeNow = new Date('2026-05-08T10:15:00');
    vi.useFakeTimers();
    vi.setSystemTime(fakeNow);

    const slots = await getAvailableSlots('1', '2026-05-08');

    // 09:00, 09:30, 10:00 are at or before 10:15 — should be unavailable
    const nineAM  = slots.find((s) => s.time === '09:00');
    const nineThirty = slots.find((s) => s.time === '09:30');
    const tenAM   = slots.find((s) => s.time === '10:00');
    const tenThirty  = slots.find((s) => s.time === '10:30');

    expect(nineAM?.available).toBe(false);
    expect(nineThirty?.available).toBe(false);
    expect(tenAM?.available).toBe(false);
    expect(tenThirty?.available).toBe(true);

    vi.useRealTimers();
  });
});

describe('createBooking', () => {
  const input = {
    branchId: '1',
    date: '2026-06-01',
    timeSlot: '10:00',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerPhone: '0801234567',
  };

  it('returns ok:true with the booking on success', async () => {
    mockQuery.mockResolvedValue({
      rows: [{
        id: 'abc-123',
        branch_id: '1',
        date: '2026-06-01',
        time_slot: '10:00',
        customer_name: 'Jane Doe',
        customer_email: 'jane@example.com',
        customer_phone: '0801234567',
        status: 'confirmed',
        created_at: new Date().toISOString(),
      }],
    });

    const result = await createBooking(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.booking.customerName).toBe('Jane Doe');
      expect(result.booking.timeSlot).toBe('10:00');
      expect(result.booking.status).toBe('confirmed');
    }
  });

  it('returns ok:false on unique constraint violation (double-booking)', async () => {
    const pgUniqueError = Object.assign(new Error('duplicate key'), { code: '23505' });
    mockQuery.mockRejectedValue(pgUniqueError);

    const result = await createBooking(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/booked/i);
    }
  });

  it('rethrows unexpected database errors', async () => {
    mockQuery.mockRejectedValue(new Error('connection lost'));

    await expect(createBooking(input)).rejects.toThrow('connection lost');
  });
});

describe('cancelBooking', () => {
  it('returns true when a row was deleted', async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });
    expect(await cancelBooking('some-id')).toBe(true);
  });

  it('returns false when no row matched', async () => {
    mockQuery.mockResolvedValue({ rowCount: 0 });
    expect(await cancelBooking('ghost-id')).toBe(false);
  });
});
