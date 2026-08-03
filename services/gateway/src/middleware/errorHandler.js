import { ZodError } from 'zod';

function extractMessage(payload) {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  if (payload.message) return payload.message;
  if (payload.detail) return payload.detail;

  const [field, value] = Object.entries(payload)[0] ?? [];
  if (!field) return null;
  const detail = Array.isArray(value) ? value[0] : value;
  return `${field.replaceAll('_', ' ')}: ${typeof detail === 'string' ? detail : 'Invalid value'}`;
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return res.status(400).json({ message: `${first.path.join('.') || 'request'}: ${first.message}` });
  }

  const status = error.response?.status ?? error.status ?? 500;
  const message = extractMessage(error.response?.data) ?? error.message ?? 'Unexpected server error';
  if (process.env.NODE_ENV !== 'test') console.error(error);
  return res.status(status).json({ message });
}
