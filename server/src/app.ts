import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/environment.js';
import apiRouter from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middlewares
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request tracing
  app.use(requestLogger);

  // Mount API Router
  app.use('/api', apiRouter);

  // Fallback for unmatched routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
