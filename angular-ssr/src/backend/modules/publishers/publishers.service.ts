/**
 * @file: src/backend/modules/publishers/publishers.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicios de publisher que implementan operaciones CRUD para publishers y gestión de videojuegos asociados.
 */

import { prisma } from '../../config/db';

/**
 * Lista publishers con filtro opcional por nombre.
 *
 * @param filters Filtros opcionales.
 * @returns Listado de publishers.
 */
export async function listPublishers(filters?: { name?: string | undefined }) {
  try {
    const where: any = {};
    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    return await prisma.publisher.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { id: 'asc' } as any,
    });
  } catch (e: any) {
    if (e?.message && e.message.includes('does not exist')) {
      return [];
    }
    throw e;
  }
}

/**
 * Busca un publisher por id.
 *
 * @param id Identificador del publisher.
 * @returns Publisher encontrado o `null`.
 */
export async function findPublisherById(id: number) {
  try {
    return await prisma.publisher.findUnique({
      where: { id } as any,
      select: {
        id: true,
        name: true,
        Game: {
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
  } catch (e: any) {
    if (e?.message && e.message.includes('does not exist')) {
      return null;
    }
    throw e;
  }
}

/**
 * Crea un publisher.
 *
 * @param data Datos de creación.
 * @returns Publisher creado.
 */
export async function createPublisher(data: { name: string }) {
  return await prisma.publisher.create({
    data,
    select: { id: true, name: true },
  });
}

/**
 * Actualiza un publisher existente.
 *
 * @param id Identificador del publisher.
 * @param data Datos parciales.
 * @returns Publisher actualizado.
 */
export async function updatePublisher(id: number, data: { name?: string }) {
  return await prisma.publisher.update({
    where: { id } as any,
    data,
    select: { id: true, name: true },
  });
}

/**
 * Elimina un publisher por id.
 *
 * @param id Identificador del publisher.
 * @returns Registro eliminado.
 */
export async function deletePublisher(id: number) {
  return await prisma.publisher.delete({ where: { id } as any });
}
