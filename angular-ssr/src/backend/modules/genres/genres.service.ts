/**
 * @file: src/backend/modules/genres/genres.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicios de géneros que implementan operaciones CRUD para géneros y gestión de relaciones.
 */

import { prisma } from '../../config/db';

/**
 * Lista géneros con filtro opcional por nombre.
 *
 * @param filters Filtros opcionales.
 * @returns Listado de géneros.
 */
export async function listGenres(filters?: { name?: string }) {
  const where: any = {};
  if (filters?.name)
    where.name = { contains: filters.name, mode: 'insensitive' };
  return await prisma.genre.findMany({
    where,
    select: { id: true, name: true },
    orderBy: { id: 'asc' } as any,
  });
}

/**
 * Busca un género por id.
 *
 * @param id Identificador del género.
 * @returns Género con juegos asociados.
 */
export async function findGenreById(id: number) {
  return await prisma.genre.findUnique({
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
 * Crea un género.
 *
 * @param data Datos de creación.
 * @returns Género creado.
 */
export async function createGenre(data: { name: string }) {
  return await prisma.genre.create({ data, select: { id: true, name: true } });
}

/**
 * Actualiza un género existente.
 *
 * @param id Identificador del género.
 * @param data Datos parciales.
 * @returns Género actualizado.
 */
export async function updateGenre(id: number, data: { name?: string }) {
  return await prisma.genre.update({
    where: { id } as any,
    data,
    select: { id: true, name: true },
  });
}

/**
 * Elimina un género por id.
 *
 * @param id Identificador del género.
 * @returns Registro eliminado.
 */
export async function deleteGenre(id: number) {
  return await prisma.genre.delete({ where: { id } as any });
}
