/**
 * @file: src/backend/config/db.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Configuración de conexión a base de datos con Prisma.
 */

import { PrismaClient } from '@prisma/client';
import { serializePrisma } from '../utils/serialize';

/** Cliente Prisma singleton para acceso a base de datos. */
export const prisma = new PrismaClient();

/**
 * Serializa valores Prisma a JSON plano.
 *
 * @param value Valor de entrada potencialmente con tipos Prisma.
 * @returns Valor serializado para transporte HTTP.
 */
export function prismaToJSON<T>(value: T): any {
  return serializePrisma(value);
}
