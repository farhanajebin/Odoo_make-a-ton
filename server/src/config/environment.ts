import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  APP_NAME: z.string().default('LOOPNEX Platform'),
  APP_VERSION: z.string().default('0.1.0'),
  JWT_ACCESS_SECRET: z.string().default('loopnex-access-secret-token-key-2026-production-ready'),
  JWT_REFRESH_SECRET: z.string().default('loopnex-refresh-secret-token-key-2026-production-ready'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.string().transform((val) => parseInt(val, 10)).default('7'),
  RESET_TOKEN_EXPIRES_MINUTES: z.string().transform((val) => parseInt(val, 10)).default('30'),
  COOKIE_SECURE: z.string().transform((val) => val === 'true').default('false'),
  EMAIL_FROM: z.string().default('LOOPNEX Security <security@loopnex.io>'),
});

const parsedEnv = environmentSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment configuration validation failed:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;

