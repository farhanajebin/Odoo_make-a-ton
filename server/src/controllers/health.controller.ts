import { Request, Response, NextFunction } from 'express';
import { checkSystemHealth } from '../services/health.service.js';

export async function getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const health = await checkSystemHealth();
    const httpStatus = health.status === 'error' ? 503 : 200;
    res.status(httpStatus).json(health);
  } catch (error) {
    next(error);
  }
}
