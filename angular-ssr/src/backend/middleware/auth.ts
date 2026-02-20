import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { findUserAuthInfo } from '../modules/users/users.service';
import { applySecurityHeaders, applyNoCacheHeaders } from '../../security-headers';

declare global {
  namespace Express {
    interface Request {
      user?: { sub: number; email: string; isAdmin?: boolean };
    }
  }
}

export async function auth(req: Request, res: Response, next: NextFunction) {
  applySecurityHeaders(req, res);
  applyNoCacheHeaders(res);
  
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
