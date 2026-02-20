import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function adminOnly(req: Request, res: Response, next: NextFunction) {
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
  
  if (!req.user || !req.user.email) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const adminCsv = env.ADMIN_EMAILS ?? '';
  const admins = adminCsv
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if ((req.user as any).isAdmin) {
    return next();
  }

  if (admins.includes(req.user.email.toLowerCase())) {
    return next();
  }

  return res
    .status(403)
    .json({ message: 'Acceso denegado: solo administradores' });
}
