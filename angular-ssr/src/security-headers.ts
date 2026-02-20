import type { Request, Response, NextFunction } from 'express';

export function applySecurityHeaders(req: Request, res: Response, next?: NextFunction) {
  const isProduction = process.env['NODE_ENV'] === 'production';

  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  
  if (req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content Security Policy
  let csp = "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
    "img-src 'self' data: https://res.cloudinary.com https://img.youtube.com blob:; " +
    "font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; " +
    "frame-src 'self' https://www.youtube-nocookie.com; " +
    "frame-ancestors 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "object-src 'none'; " +
    "media-src 'self' https://res.cloudinary.com blob:; " +
    "worker-src 'self' blob:; " +
    "manifest-src 'self'; ";

  if (isProduction) {
    // Producción: script-src más estricto, upgrade-insecure-requests
    csp += "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; ";
    csp += "connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; ";
    csp += "upgrade-insecure-requests;";
  } else {
    // Desarrollo: permite WebSocket para HMR (Hot Module Replacement)
    csp += "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; ";
    csp += "connect-src 'self' ws://localhost:* http://localhost:* https://res.cloudinary.com https://generativelanguage.googleapis.com; ";
  }

  res.setHeader('Content-Security-Policy', csp);

  if (next) {
    next();
  }
}

export function applyNoCacheHeaders(res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}
