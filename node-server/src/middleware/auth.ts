import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

declare global {
  namespace Express {
    interface Request {
      user?: { sub: number; email: string };
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  
  const token = header.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    
    if (
      typeof payload === 'object' && 
      payload !== null && 
      'sub' in payload && 
      'email' in payload &&
      typeof payload.sub === 'number' &&
      typeof payload.email === 'string'
    ) {
      req.user = { sub: payload.sub, email: payload.email };
      next();
    } else {
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

