import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { applySecurityHeaders, applyNoCacheHeaders } from '../../security-headers';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  applySecurityHeaders(req, res);
  applyNoCacheHeaders(res);
  
  let status = err.status || 500;
  let message = err.message || 'Error interno';

  if (err.name === 'ZodError') {
    status = 400;
    message = 'Datos inválidos o incompletos';
  } else if (err.code === 'P2021' || (err.message && String(err.message).includes('invalid byte sequence'))) {
    status = 400;
    message = 'Caracteres no válidos en la petición';
  }

  if (env.NODE_ENV !== 'production') {
    logger.error(`${req.method} ${req.path} - ${err.message}`);
    logger.error(err.stack);
  } else {
    if (status >= 500) {
      logger.error(`${req.method} ${req.path} - Error ${status}`);
    }
  }

  const isProduction = env.NODE_ENV === 'production';
  const safeMessage =
    isProduction
      ? status === 400
        ? message
        : status === 404
          ? 'Recurso no encontrado'
          : 'Error interno del servidor'
      : message;

  res.status(status).json({ message: safeMessage });
}
