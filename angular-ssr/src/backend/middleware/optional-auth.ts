import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  const token = header.split(' ')[1];
  if (!token) return next();
  try {
    const payload: any = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
    if (
      typeof payload === 'object' &&
      payload !== null &&
      typeof payload.sub === 'number' &&
      typeof payload.email === 'string'
    ) {
      req.user = {
        sub: payload.sub,
        email: payload.email,
        isAdmin: payload.isAdmin ?? false,
      };
    }
  } catch {
  }
  next();
}
