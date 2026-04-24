import type { Request, Response, NextFunction } from 'express';

export function applySecurityHeaders(
  req: Request,
  res: Response,
  next?: NextFunction,
) {
  const isProduction = process.env['NODE_ENV'] === 'production';

  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  );

  if (
    req.protocol === 'https' ||
    req.headers['x-forwarded-proto'] === 'https'
  ) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  // Content Security Policy
  let csp =
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com https://accounts.google.com https://accounts.gstatic.com; " +
    "style-src-elem 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com https://accounts.google.com https://accounts.gstatic.com; " +
    "img-src 'self' data: https://res.cloudinary.com https://img.youtube.com https://upload.wikimedia.org blob:; " +
    "font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; " +
    "frame-src 'self' https://www.youtube-nocookie.com https://js.stripe.com https://hooks.stripe.com https://accounts.google.com; " +
    "frame-ancestors 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self' https://checkout.stripe.com https://hooks.stripe.com; " +
    "object-src 'none'; " +
    "media-src 'self' https://res.cloudinary.com blob:; " +
    "worker-src 'self' blob:; " +
    "manifest-src 'self'; ";

  if (isProduction) {
    // Producción: script-src más estricto sin unsafe-inline/eval, upgrade-insecure-requests
    csp +=
      "script-src 'self' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com https://js.stripe.com https://accounts.google.com https://accounts.gstatic.com; ";
    csp +=
      "connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com https://api.stripe.com https://r.stripe.com https://m.stripe.network https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://accounts.gstatic.com https://cdnjs.cloudflare.com; ";
    csp += 'upgrade-insecure-requests;';
  } else {
    // Desarrollo: permite WebSocket para HMR (Hot Module Replacement) e unsafe-inline/eval para debug
    csp +=
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com https://js.stripe.com https://accounts.google.com https://accounts.gstatic.com; ";
    csp +=
      "connect-src 'self' ws://localhost:* http://localhost:* https://res.cloudinary.com https://generativelanguage.googleapis.com https://api.stripe.com https://r.stripe.com https://m.stripe.network https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://accounts.gstatic.com https://cdnjs.cloudflare.com; ";
  }

  res.setHeader('Content-Security-Policy', csp);

  if (next) {
    next();
  }
}

export function applyNoCacheHeaders(res: Response) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}
