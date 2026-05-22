/*
 * @file: src/backend/utils/serialize.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Serializa estructuras que contienen tipos Prisma a JSON seguro.
 */

/**
 * Serializa estructuras que contienen tipos Prisma a JSON seguro.
 *
 * @param value Valor a serializar.
 * @returns Estructura serializada.
 */
export function serializePrisma(value: any): any {
  if (value === null || value === undefined) return value;

  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    try {
      return value.toNumber();
    } catch {
      return value.toString();
    }
  }

  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) return value.map((v) => serializePrisma(v));

  if (typeof value === 'object') {
    const out: any = {};
    for (const k of Object.keys(value)) {

      out[k] = serializePrisma(value[k]);
    }
    return out;
  }

  return value;
}
