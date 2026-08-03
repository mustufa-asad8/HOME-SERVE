import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { dataService } from '../services/dataService.js';
import { config } from '../config.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const credentials = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const safeUser = (user) => {
  const { password_hash, ...safe } = user;
  return safe;
};

const createToken = (user) => jwt.sign(
  { sub: user.id, role: user.role, email: user.email, name: user.name },
  config.jwtSecret,
  { expiresIn: config.jwtExpiresIn },
);

router.post('/login', async (req, res, next) => {
  try {
    const body = credentials.parse(req.body);
    const { data: user } = await dataService.get('/users/by-email/', { params: { email: body.email.toLowerCase() } });
    if (!user.is_active) return res.status(403).json({ message: 'This account is disabled' });

    const valid = await bcrypt.compare(body.password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    return res.json({ token: createToken(user), user: safeUser(user) });
  } catch (error) {
    if (error.response?.status === 404) return res.status(401).json({ message: 'Invalid email or password' });
    return next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const body = credentials.extend({
      name: z.string().trim().min(2).max(120),
      role: z.enum(['customer', 'provider']).default('customer'),
      city: z.string().trim().min(2).max(80),
    }).parse(req.body);

    const password_hash = await bcrypt.hash(body.password, 12);
    const { data: user } = await dataService.post('/users/', {
      name: body.name,
      email: body.email.toLowerCase(),
      role: body.role,
      city: body.city,
      password_hash,
      is_active: true,
    });

    return res.status(201).json({ token: createToken(user), user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  return res.json({ user: safeUser(req.account) });
});

export default router;
