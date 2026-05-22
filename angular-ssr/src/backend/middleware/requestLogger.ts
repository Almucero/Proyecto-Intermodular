/**
 * @file: src/backend/middleware/requestLogger.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Middleware de logging de request/response con duración.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware de logging de request/response con duración.
 *
 * @param req Request HTTP.
 * @param res Response HTTP.
 * @param next Next middleware.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });

  next();
}
