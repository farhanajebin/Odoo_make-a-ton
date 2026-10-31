import { getPrismaClient } from './prisma.js';
import { env } from '../config/environment.js';
import { HealthCheckResponse } from '../types/index.js';

const startTime = Date.now();

export async function checkSystemHealth(): Promise<HealthCheckResponse> {
  let dbStatus: 'connected' | 'disconnected' | 'unconfigured' = 'unconfigured';
  let latencyMs: number | undefined;
  let dbError: string | undefined;

  const prisma = getPrismaClient();

  if (prisma) {
    const start = performance.now();
    try {
      // Execute a lightweight ping query
      await prisma.$queryRaw`SELECT 1`;
      latencyMs = Math.round(performance.now() - start);
      dbStatus = 'connected';
    } catch (err: unknown) {
      dbStatus = 'disconnected';
      dbError = err instanceof Error ? err.message.split('\n')[0] : 'Database connection error';
    }
  }

  const overallStatus = dbStatus === 'connected' 
    ? 'ok' 
    : dbStatus === 'unconfigured' 
      ? 'ok' // Graceful mode for local development when DB is pending
      : 'degraded';

  return {
    status: overallStatus,
    application: env.APP_NAME,
    version: env.APP_VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    database: {
      status: dbStatus,
      latencyMs,
      ...(dbError && { error: 'Database service unreachable. Check credentials and connection.' }),
    },
    features: {
      revenueRadar: 'planned',
      subscriptionHealthScore: 'planned',
      whatIfSimulator: 'planned',
      renewalCenter: 'planned',
      billingIntegrityGuardian: 'planned',
    },
  };
}
