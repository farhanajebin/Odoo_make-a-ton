import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';
import { env } from '../config/environment.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  console.error('[Error Handler Caught Exception]:', err);

  if (err instanceof ZodError) {
    sendError(
      res,
      'Validation Error',
      400,
      'VALIDATION_FAILED',
      err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
    );
    return;
  }

  if (err instanceof Error) {
    const isProd = env.NODE_ENV === 'production';
    sendError(
      res,
      isProd ? 'An unexpected server error occurred' : err.message,
      500,
      'INTERNAL_SERVER_ERROR',
      isProd ? undefined : { stack: err.stack }
    );
    return;
  }

  sendError(res, 'Internal Server Error', 500, 'UNKNOWN_ERROR');
}
