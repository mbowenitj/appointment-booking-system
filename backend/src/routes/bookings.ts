import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createBooking, getAllBookings, cancelBooking, getBranchById } from '../data/store';
import { sendConfirmationEmail } from '../services/emailService';

const router = Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX  = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX  = /^\d{2}:\d{2}$/;
const UUID_REGEX  = /^[0-9a-f-]{36}$/;

// Requires the x-admin-key header (or Authorization: Bearer <key>) to match ADMIN_API_KEY
function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    res.status(403).json({ error: 'Admin access is not enabled on this server.' });
    return;
  }
  const provided =
    (req.headers['x-admin-key'] as string | undefined) ??
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (!provided || provided !== adminKey) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  next();
}

// Limit booking creation to 20 attempts per IP per 15 minutes
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking requests. Please try again later.' },
});

// GET /api/bookings  — admin only
router.get('/', requireAdminKey, async (_req: Request, res: Response) => {
  res.json(await getAllBookings());
});

// POST /api/bookings
router.post('/', bookingLimiter, async (req: Request, res: Response) => {
  const { branchId, date, timeSlot, customerName, customerEmail, customerPhone } =
    req.body as Record<string, string | undefined>;

  if (!branchId || !date || !timeSlot || !customerName || !customerEmail) {
    res.status(400).json({ error: 'branchId, date, timeSlot, customerName and customerEmail are required.' });
    return;
  }
  if (customerName.trim().length > 200) {
    res.status(400).json({ error: 'customerName must be 200 characters or fewer.' });
    return;
  }
  if (customerPhone && customerPhone.trim().length > 30) {
    res.status(400).json({ error: 'customerPhone must be 30 characters or fewer.' });
    return;
  }
  if (!DATE_REGEX.test(date)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }
  if (!TIME_REGEX.test(timeSlot)) {
    res.status(400).json({ error: 'Invalid timeSlot format. Use HH:MM.' });
    return;
  }
  if (!EMAIL_REGEX.test(customerEmail)) {
    res.status(400).json({ error: 'Invalid email address.' });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(`${date}T00:00:00`) < today) {
    res.status(400).json({ error: 'Cannot book slots for past dates.' });
    return;
  }

  const branch = await getBranchById(branchId);
  if (!branch) {
    res.status(404).json({ error: 'Branch not found.' });
    return;
  }

  const result = await createBooking({
    branchId,
    date,
    timeSlot,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim().toLowerCase(),
    customerPhone: customerPhone?.trim(),
  });

  if (!result.ok) {
    res.status(409).json({ error: result.error });
    return;
  }

  const { booking } = result;
  const emailResult = await sendConfirmationEmail({
    to: booking.customerEmail,
    customerName: booking.customerName,
    branch,
    date,
    timeSlot,
    bookingId: booking.id,
  });

  res.status(201).json({ ...booking, emailPreviewUrl: emailResult.previewUrl });
});

// DELETE /api/bookings/:id  — admin only
router.delete('/:id', requireAdminKey, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ error: 'Invalid booking ID.' });
    return;
  }
  if (!await cancelBooking(id)) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  res.json({ message: 'Booking cancelled successfully.' });
});

export default router;
