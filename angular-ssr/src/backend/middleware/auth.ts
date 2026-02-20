import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { findUserAuthInfo } from '../modules/users/users.service';

declare global {
  namespace Express {
    interface Request {
      user?: { sub: number; email: string; isAdmin?: boolean };
    }
  }
}

export async function auth(req: Request, res: Response, next: NextFunction) {
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
  
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const token = header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('sub' in payload) ||
      !('email' in payload) ||
      typeof payload.sub !== 'number' ||
      typeof payload.email !== 'string'
    ) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const userInfo = await findUserAuthInfo(payload.sub);
    if (userInfo?.passwordChangedAt && typeof (payload as any).iat === 'number') {
      const changedAt = Math.floor(new Date(userInfo.passwordChangedAt).getTime() / 1000);
      if ((payload as any).iat < changedAt) {
        return res.status(401).json({ message: 'Token expirado. Vuelve a iniciar sesión' });
      }
    }

    req.user = {
      sub: payload.sub,
      email: payload.email,
      isAdmin: (payload as any).isAdmin ?? false,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
