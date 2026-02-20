import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (env.NODE_ENV !== 'production') {
    logger.error(`${req.method} ${req.path} - ${err.message}`);
    logger.error(err.stack);
  } else {
    logger.error(`${req.method} ${req.path} - Error ${err.status || 500}`);
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
