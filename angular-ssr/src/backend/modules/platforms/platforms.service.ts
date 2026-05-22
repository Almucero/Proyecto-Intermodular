/**
 * @file: src/backend/modules/platforms/platforms.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicios de plataformas que implementan operaciones CRUD para plataformas y gestión de videojuegos asociados.
 */

import { prisma } from '../../config/db';

/**
 * Lista plataformas con filtro opcional por nombre.
 *
 * @param filters Filtros opcionales.
 * @returns Listado de plataformas.
 */
export async function listPlatforms(filters?: { name?: string }) {
  const where: any = {};
  if (filters?.name)
    where.name = { contains: filters.name, mode: 'insensitive' };
  return await prisma.platform.findMany({
    where,
    select: { id: true, name: true },
    orderBy: { id: 'asc' } as any,
  });
}

/**
 * Busca una plataforma por id.
 *
 * @param id Identificador de plataforma.
 * @returns Plataforma con juegos asociados.
 */
export async function findPlatformById(id: number) {
  return await prisma.platform.findUnique({
    where: { id } as any,
    select: {
      id: true,
      name: true,
      games: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          salePrice: true,
          isOnSale: true,
          isRefundable: true,
          numberOfSales: true,
          stockPc: true,
          stockPs5: true,
          stockXboxX: true,
          stockSwitch: true,
          stockPs4: true,
          stockXboxOne: true,
          videoUrl: true,
          rating: true,
          releaseDate: true,
        },
      },
    },
  });
}

/**
 * Crea una plataforma.
 *
 * @param data Datos de creación.
 * @returns Plataforma creada.
 */
export async function createPlatform(data: { name: string }) {
  return await prisma.platform.create({
    data,
    select: { id: true, name: true },
  });
}

/**
 * Actualiza una plataforma existente.
 *
 * @param id Identificador de plataforma.
 * @param data Datos parciales.
 * @returns Plataforma actualizada.
 */
export async function updatePlatform(id: number, data: { name?: string }) {
  return await prisma.platform.update({
    where: { id } as any,
    data,
    select: { id: true, name: true },
  });
}

/**
 * Elimina una plataforma por id.
 *
 * @param id Identificador de plataforma.
 * @returns Registro eliminado.
 */
export async function deletePlatform(id: number) {
  return await prisma.platform.delete({ where: { id } as any });
}
