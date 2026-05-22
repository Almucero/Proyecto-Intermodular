/**
 * @file: src/backend/middleware/rateLimiter.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Middlewares limitadores de tasa para controlar el tráfico de API y proteger contra abusos.
 */

import rateLimit from 'express-rate-limit';

/** Limitador general para tráfico de API. */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message:
      'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Limitador estricto para endpoints de autenticación. */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    message:
      'Demasiados intentos de autenticación, intenta de nuevo en 1 hora',
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});
