import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock store and email
vi.mock('../data/store', () => ({
  getBranches:      vi.fn(),
  getBranchById:    vi.fn(),
  getAvailableSlots: vi.fn(),
  createBooking:    vi.fn(),
  getAllBookings:    vi.fn(),
  cancelBooking:    vi.fn(),
}));

vi.mock('../services/emailService', () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue({ success: true, previewUrl: null }),
}));

// Mock database 
vi.mock('../db/database', () => ({
  default: { query: vi.fn() },
  initializeDatabase: vi.fn().mockResolvedValue(undefined),
}));

import app from '../app';
import * as store from '../data/store';

const mockStore = store as unknown as Record<string, ReturnType<typeof vi.fn>>;

const validBranch = { id: '1', name: 'City Centre', address: '1 Adderley St', phone: '021 001' };

beforeEach(() => vi.clearAllMocks());

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/branches', () => {
  it('returns branches list', async () => {
    mockStore.getBranches.mockResolvedValue([validBranch]);
    const res = await request(app).get('/api/branches');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([validBranch]);
  });
});

const validPayload = {
  branchId:      '1',
  date:          '2099-06-15',
  timeSlot:      '10:00',
  customerName:  'Tshepo Ninja',
  customerEmail: 'tshepo@example.com',
  customerPhone: '0006667777',
};

describe('POST /api/bookings — validation', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/bookings').send({ branchId: '1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('returns 400 for invalid date format', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...validPayload, date: '15-06-2099' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/date/i);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...validPayload, customerEmail: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 400 for a past date', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...validPayload, date: '2000-01-01' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/past/i);
  });

  it('returns 404 when branch does not exist', async () => {
    mockStore.getBranchById.mockResolvedValue(null);
    const res = await request(app).post('/api/bookings').send(validPayload);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/bookings — success and conflict', () => {
  it('returns 201 with booking on success', async () => {
    mockStore.getBranchById.mockResolvedValue(validBranch);
    mockStore.createBooking.mockResolvedValue({
      ok: true,
      booking: {
        id: 'uuid-1', branchId: '1', date: '2099-06-15', timeSlot: '10:00',
        customerName: 'Tshepo Ninja', customerEmail: 'tshepo@example.com',
        customerPhone: '0006667777', status: 'confirmed', createdAt: new Date().toISOString(),
      },
    });

    const res = await request(app).post('/api/bookings').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('uuid-1');
    expect(res.body.status).toBe('confirmed');
  });

  it('returns 409 when slot is already booked', async () => {
    mockStore.getBranchById.mockResolvedValue(validBranch);
    mockStore.createBooking.mockResolvedValue({
      ok: false,
      error: 'This time slot has just been booked. Please choose another.',
    });

    const res = await request(app).post('/api/bookings').send(validPayload);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/booked/i);
  });
});

describe('DELETE /api/bookings/:id', () => {
  it('returns 200 when booking is cancelled', async () => {
    mockStore.cancelBooking.mockResolvedValue(true);
    const res = await request(app).delete('/api/bookings/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(res.status).toBe(200);
  });

  it('returns 404 when booking is not found', async () => {
    mockStore.cancelBooking.mockResolvedValue(false);
    const res = await request(app).delete('/api/bookings/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid UUID', async () => {
    const res = await request(app).delete('/api/bookings/not-a-uuid');
    expect(res.status).toBe(400);
  });
});
