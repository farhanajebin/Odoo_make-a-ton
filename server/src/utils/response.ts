import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
): Response {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
}
