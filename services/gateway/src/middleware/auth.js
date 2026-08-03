import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { dataService } from '../services/dataService.js';

export async function authenticate(req, res, next) {
  const value = req.headers.authorization;
  if (!value?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });

  try {
    const claims = jwt.verify(value.slice(7), config.jwtSecret);
    const { data: account } = await dataService.get(`/users/${claims.sub}/`);
    if (!account.is_active) return res.status(403).json({ message: 'This account is disabled' });

    // Authorization always uses the current database role, not a potentially
    // stale role embedded in a previously issued JWT.
    req.account = account;
    req.user = {
      ...claims,
      sub: String(account.id),
      role: account.role,
      email: account.email,
      name: account.name,
    };
    return next();
  } catch (error) {
    if (error.response?.status === 404) return res.status(401).json({ message: 'Account no longer exists' });
    if (error.response) return next(error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: 'Insufficient permissions' });
  return next();
};
