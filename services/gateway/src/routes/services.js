import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth.js';
import { dataService } from '../services/dataService.js';

const router = Router();
const unwrap = (data) => data?.results ?? data;

router.get('/categories', async (_req, res, next) => {
  try {
    const { data } = await dataService.get('/categories/');
    return res.json(unwrap(data));
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { data } = await dataService.get('/services/', { params: { ...req.query, is_active: true } });
    return res.json(unwrap(data));
  } catch (error) {
    return next(error);
  }
});

router.get('/mine', authenticate, authorize('provider'), async (req, res, next) => {
  try {
    const { data } = await dataService.get('/services/', { params: { provider: req.user.sub } });
    return res.json(unwrap(data));
  } catch (error) {
    return next(error);
  }
});

router.post('/', authenticate, authorize('provider'), async (req, res, next) => {
  try {
    const body = z.object({
      category: z.string().min(1),
      title: z.string().trim().min(3).max(160),
      description: z.string().trim().min(20),
      city: z.string().trim().min(2).max(80),
      price: z.coerce.number().positive(),
      price_unit: z.string().trim().min(2).max(50).default('visit'),
      duration_minutes: z.coerce.number().int().min(15).max(1440),
      image_url: z.string().url().or(z.literal('')).default(''),
    }).parse(req.body);

    const { data } = await dataService.post('/services/', {
      ...body,
      provider: req.user.sub,
      is_active: true,
    });
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data } = await dataService.get(`/services/${req.params.id}/`);
    if (!data.is_active) return res.status(404).json({ message: 'Service not found' });
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

export default router;
