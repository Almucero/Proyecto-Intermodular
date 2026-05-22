/**
 * @file: src/backend/middleware/authorize.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Middleware que restringe el acceso a rutas solo para usuarios administradores.
 */

import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { applySecurityHeaders, applyNoCacheHeaders } from '../../security-headers';

/**
 * Middleware de autorización exclusiva para administradores.
 *
 * @param req Request HTTP.
 * @param res Response HTTP.
 * @param next Next middleware.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  applySecurityHeaders(req, res);
  applyNoCacheHeaders(res);

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
