import 'dotenv/config';

const requireValue = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  dataServiceUrl: requireValue('DATA_SERVICE_URL', 'http://localhost:8000'),
  internalServiceKey: requireValue('INTERNAL_SERVICE_KEY', 'development-internal-key-change-me'),
  jwtSecret: requireValue('JWT_SECRET', 'development-jwt-secret-change-me-123456'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  smtpUrl: process.env.SMTP_URL,
};
