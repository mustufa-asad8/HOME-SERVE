import type { Role } from './types';

export const dashboardPathFor = (role: Role) => {
  if (role === 'provider') return '/app/provider';
  if (role === 'admin') return '/app/admin';
  return '/app/customer';
};
