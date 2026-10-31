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
  DATABASE_URL: z.string().optional(),
  APP_NAME: z.string().default('LOOPNEX Platform'),
  APP_VERSION: z.string().default('0.1.0'),
});

const parsedEnv = environmentSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment configuration validation failed:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
