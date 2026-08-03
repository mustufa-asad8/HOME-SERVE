import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { dataService } from '../services/dataService.js';

const router = Router();
router.use(authenticate, authorize('admin'));
router.get('/analytics', async (_req, res, next) => {
  try { const { data } = await dataService.get('/analytics/'); res.json(data); }
  catch (error) { next(error); }
});
export default router;
