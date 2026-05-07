import { Router } from 'express';
import { getBranches } from '../data/store';

const router = Router();

// GET /api/branches
router.get('/', (_req, res) => {
  res.json(getBranches());
});

export default router;
