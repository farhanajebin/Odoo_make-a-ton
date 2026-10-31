import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(2);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
}
