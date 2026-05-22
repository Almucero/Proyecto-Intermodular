/**
 * @file: src/backend/middleware/validate.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Middleware de validación Zod que aplica headers de seguridad y caché.
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { applySecurityHeaders, applyNoCacheHeaders } from '../../security-headers';

/**
 * Genera middleware de validación Zod para `req.body`.
 *
 * @param schema Esquema Zod de entrada.
 * @returns Middleware Express.
 */
export const validate =
  (schema: ZodSchema<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
      applySecurityHeaders(req, res);
      applyNoCacheHeaders(res);

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
      }
      req.body = parsed.data;
      next();
    };
