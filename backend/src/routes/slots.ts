import { Router, Request, Response } from 'express';
import { getAvailableSlots, getBranchById } from '../data/store';

const router = Router();
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/slots?branchId=&date=
router.get('/', (req: Request, res: Response) => {
  const { branchId, date } = req.query as Record<string, string | undefined>;

  if (!branchId || !date) {
    res.status(400).json({ error: 'branchId and date are required.' });
    return;
  }
  if (!DATE_REGEX.test(date)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(`${date}T00:00:00`) < today) {
    res.status(400).json({ error: 'Cannot book slots for past dates.' });
    return;
  }

  if (!getBranchById(branchId)) {
    res.status(404).json({ error: 'Branch not found.' });
    return;
  }

  res.json(getAvailableSlots(branchId, date));
});

export default router;
