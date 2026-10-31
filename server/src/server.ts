import { createApp } from './app.js';
import { env } from './config/environment.js';
import { disconnectPrisma } from './services/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`
======================================================
  LOOPNEX — Subscription & Revenue Operations API
======================================================
  Environment : ${env.NODE_ENV}
  Address     : http://${env.HOST}:${env.PORT}
  Health check: http://${env.HOST}:${env.PORT}/api/health
======================================================
  `);
});

// Graceful shutdown handlers
async function handleShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await disconnectPrisma();
    console.log('Database connections terminated.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
