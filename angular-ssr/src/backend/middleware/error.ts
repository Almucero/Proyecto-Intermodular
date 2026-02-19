import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(`${req.method} ${req.path} - ${err.message}`);
  if (env.NODE_ENV !== 'production') {
    logger.error(err.stack);
  }

  const status = err.status || 500;
  const isProduction = env.NODE_ENV === 'production';
  const safeMessage =
    isProduction
      ? status === 400
        ? 'Datos inválidos'
        : status === 404
          ? 'Recurso no encontrado'
          : 'Error interno del servidor'
      : err.message || 'Error interno';

  res.status(status).json({ message: safeMessage });
}
