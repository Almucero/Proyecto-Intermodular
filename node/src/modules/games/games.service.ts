import { prisma } from "../../config/db.js";

export async function listGames(filters?: {
  title?: string | undefined;
  price?: number | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  genre?: string | undefined;
  platform?: string | undefined;
  isOnSale?: boolean | undefined;
}) {
  try {
    const where: any = {};
    if (filters?.title) {
      where.title = { contains: filters.title, mode: "insensitive" };
    }
    if (filters?.price !== undefined) {
      where.price = filters.price;
    }
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters?.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters?.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }
    if (filters?.isOnSale !== undefined) {
      where.isOnSale = filters.isOnSale;
    }
    if (filters?.genre) {
      where.genres = {
        some: { name: { contains: filters.genre, mode: "insensitive" } },
      };
    }
    if (filters?.platform) {
      where.platforms = {
        some: { name: { contains: filters.platform, mode: "insensitive" } },
      };
    }
    return await prisma.game.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        salePrice: true,
        isOnSale: true,
        isRefundable: true,
        numberOfSales: true,
        stock: true,
        videoUrl: true,
        rating: true,
        releaseDate: true,
      },
      orderBy: { id: "asc" } as any,
    });
  } catch (e: any) {
    if (e?.message && e.message.includes("does not exist")) {
      return [];
    }
    throw e;
  }
}

export async function findGameById(id: number) {
  try {
    return await prisma.game.findUnique({
      where: { id } as any,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        salePrice: true,
        isOnSale: true,
        isRefundable: true,
        numberOfSales: true,
        stock: true,
        videoUrl: true,
        rating: true,
        publisherId: true,
        developerId: true,
        releaseDate: true,
        genres: { select: { id: true, name: true } },
        platforms: { select: { id: true, name: true } },
        media: { select: { id: true, url: true, altText: true } },
        Developer: {
          select: {
            id: true,
            name: true,
          },
        },
        Publisher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (e: any) {
    if (e?.message && e.message.includes("does not exist")) {
      return null;
    }
    throw e;
  }
}

export async function createGame(data: any) {
  const payload: any = { ...data };
  // handle relations: genres and platforms can be passed as array of names or ids
  if (data.genres) {
    payload.genres = {
      connect: data.genres.map((g: any) =>
        typeof g === "number" ? { id: g } : { name: g }
      ),
    };
  }
  if (data.platforms) {
    payload.platforms = {
      connect: data.platforms.map((p: any) =>
        typeof p === "number" ? { id: p } : { name: p }
      ),
    };
  }

  return await prisma.game.create({
    data: payload,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      salePrice: true,
      isOnSale: true,
      isRefundable: true,
      numberOfSales: true,
      stock: true,
      videoUrl: true,
      rating: true,
      releaseDate: true,
      Publisher: { select: { id: true, name: true } },
      Developer: { select: { id: true, name: true } },
      genres: { select: { id: true, name: true } },
      platforms: { select: { id: true, name: true } },
      media: { select: { id: true, url: true, altText: true } },
    },
  });
}

export async function updateGame(id: number, data: any) {
  const payload: any = { ...data };
  if (data.genres) {
    payload.genres = {
      set: [],
      connect: data.genres.map((g: any) =>
        typeof g === "number" ? { id: g } : { name: g }
      ),
    };
  }
  if (data.platforms) {
    payload.platforms = {
      set: [],
      connect: data.platforms.map((p: any) =>
        typeof p === "number" ? { id: p } : { name: p }
      ),
    };
  }

  return await prisma.game.update({
    where: { id: payload.id },
    data: payload,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      salePrice: true,
      isOnSale: true,
      isRefundable: true,
      numberOfSales: true,
      stock: true,
      videoUrl: true,
      rating: true,
      releaseDate: true,
      Publisher: { select: { id: true, name: true } },
      Developer: { select: { id: true, name: true } },
      genres: { select: { id: true, name: true } },
      platforms: { select: { id: true, name: true } },
      media: { select: { id: true, url: true, altText: true } },
    },
  });
}

export async function deleteGame(id: number) {
  return await prisma.game.delete({ where: { id } as any });
}
