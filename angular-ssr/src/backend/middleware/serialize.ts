/**
 * @file: src/backend/middleware/serialize.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Middleware que serializa respuestas JSON con tipos Prisma para evitar problemas de referencialidad.
 */

import type { Request, Response, NextFunction } from 'express';
import { serializePrisma } from '../utils/serialize';

/**
 * Middleware que serializa respuestas JSON con tipos Prisma.
 *
 * @param req Request HTTP.
 * @param res Response HTTP.
 * @param next Next middleware.
 */
export function responseSerializer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const originalJson = res.json.bind(res);

  res.json = ((data: any) => {
    try {
      const safe = serializePrisma(data);
      return originalJson(safe);
    } catch (err) {
      return originalJson(data);
    }
  }) as typeof res.json;

  next();
}
