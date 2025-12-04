import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/errors.js";

/**
 * Agregar juego al carrito
 */
export async function addToCart(userId: number, gameId: number, quantity = 1) {
  if (quantity < 1) {
    throw new AppError("La cantidad debe ser al menos 1", 400);
  }

  // Verificar que el juego existe
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, title: true, price: true },
  });

  if (!game) {
    throw new AppError("Juego no encontrado", 404);
  }

  if (!game.price || game.price.toNumber() <= 0) {
    throw new AppError("El juego no tiene precio válido definido", 400);
  }

  try {
    return await prisma.cartItem.upsert({
      where: {
        userId_gameId: { userId, gameId },
      },
      create: { userId, gameId, quantity },
      update: { quantity: { increment: quantity } },
      select: {
        id: true,
        userId: true,
        gameId: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
        game: {
          select: {
            id: true,
            title: true,
            price: true,
            description: true,
            media: {
              select: {
                id: true,
                url: true,
                publicId: true,
                format: true,
                resourceType: true,
                bytes: true,
                width: true,
                height: true,
                originalName: true,
                folder: true,
                altText: true,
              },
              take: 1,
            },
          },
        },
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError("Error al agregar al carrito", 500);
  }
}

/**
 * Remover juego del carrito
 */
export async function removeFromCart(userId: number, gameId: number) {
  try {
    await prisma.cartItem.delete({
      where: {
        userId_gameId: { userId, gameId },
      },
    });
    return { message: "Juego removido del carrito" };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new AppError("Artículo del carrito no encontrado", 404);
    }
    throw new AppError("Error al remover del carrito", 500);
  }
}

/**
 * Obtener carrito del usuario
 */
export async function getUserCart(userId: number) {
  return prisma.cartItem.findMany({
    where: { userId },
    select: {
      id: true,
      userId: true,
      gameId: true,
      quantity: true,
      createdAt: true,
      updatedAt: true,
      game: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          rating: true,
          media: {
            select: {
              id: true,
              url: true,
              publicId: true,
              format: true,
              resourceType: true,
              bytes: true,
              width: true,
              height: true,
              originalName: true,
              folder: true,
              altText: true,
            },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Actualizar cantidad en carrito
 */
export async function updateQuantity(
  userId: number,
  gameId: number,
  quantity: number
) {
  if (quantity < 1) {
    throw new AppError("La cantidad debe ser al menos 1", 400);
  }

  try {
    return await prisma.cartItem.update({
      where: { userId_gameId: { userId, gameId } },
      data: { quantity },
      select: {
        id: true,
        userId: true,
        gameId: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
        game: {
          select: {
            id: true,
            title: true,
            price: true,
            media: {
              select: {
                id: true,
                url: true,
                publicId: true,
                format: true,
                resourceType: true,
                bytes: true,
                width: true,
                height: true,
                originalName: true,
                folder: true,
                altText: true,
              },
              take: 1,
            },
          },
        },
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new AppError("Artículo del carrito no encontrado", 404);
    }
    throw new AppError("Error al actualizar cantidad", 500);
  }
}

/**
 * Vaciar carrito
 */
export async function clearCart(userId: number) {
  return prisma.cartItem.deleteMany({
    where: { userId },
  });
}
