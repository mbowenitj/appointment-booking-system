import { Router } from 'express';
import { getBranches } from '../data/store';

const router = Router();

// GET /api/branches
router.get('/', async (_req, res) => {
  res.json(await getBranches());
});

export default router;
