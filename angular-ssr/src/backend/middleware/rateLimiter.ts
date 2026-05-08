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
