import { prisma } from '../../config/db';

/**
 * Lista desarrolladores con filtro opcional por nombre.
 *
 * @param filters Filtros opcionales.
 * @returns Lista de desarrolladores.
 */
export async function listDevelopers(filters?: { name?: string | undefined }) {
  try {
    const where: any = {};
    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    return await prisma.developer.findMany({
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
 * Busca un desarrollador por id.
 *
 * @param id Identificador del desarrollador.
 * @returns Desarrollador encontrado o `null`.
 */
export async function findDeveloperById(id: number) {
  try {
    return await prisma.developer.findUnique({
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
  } catch (e: any) {
    if (e?.message && e.message.includes('does not exist')) {
      return null;
    }
    throw e;
  }
}

/**
 * Crea un desarrollador.
 *
 * @param data Datos de creación.
 * @returns Desarrollador creado.
 */
export async function createDeveloper(data: { name: string }) {
  return await prisma.developer.create({
    data,
    select: { id: true, name: true },
  });
}

/**
 * Actualiza un desarrollador existente.
 *
 * @param id Identificador del desarrollador.
 * @param data Datos parciales de actualización.
 * @returns Desarrollador actualizado.
 */
export async function updateDeveloper(id: number, data: { name?: string }) {
  return await prisma.developer.update({
    where: { id } as any,
    data,
    select: { id: true, name: true },
  });
}

/**
 * Elimina un desarrollador por id.
 *
 * @param id Identificador del desarrollador.
 * @returns Registro eliminado.
 */
export async function deleteDeveloper(id: number) {
  return await prisma.developer.delete({ where: { id } as any });
}
