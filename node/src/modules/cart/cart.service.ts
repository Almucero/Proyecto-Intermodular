import { prisma } from "../../config/db.js";

export async function addToCart(
  userId: number,
  gameId: number,
  platformId: number,
  quantity = 1
) {
  if (quantity < 1) {
    throw new Error("La cantidad debe ser al menos 1");
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, title: true, price: true },
  });

  if (!game) {
    throw new Error("Juego no encontrado");
  }

  if (!game.price || game.price.toNumber() <= 0) {
    throw new Error("El juego no tiene precio válido definido");
  }

  return await prisma.cartItem.upsert({
    where: {
      userId_gameId_platformId: { userId, gameId, platformId },
    },
    create: { userId, gameId, platformId, quantity },
    update: { quantity: { increment: quantity } },
    select: {
      id: true,
      userId: true,
      gameId: true,
      platformId: true,
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
      platform: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function removeFromCart(
  userId: number,
  gameId: number,
  platformId: number
) {
  await prisma.cartItem.delete({
    where: {
      userId_gameId_platformId: { userId, gameId, platformId },
    },
  });
  return { message: "Juego removido del carrito" };
}

export async function getUserCart(userId: number) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    select: {
      id: true,
      quantity: true,
      createdAt: true,
      updatedAt: true,
      game: {
        select: {
          id: true,
          title: true,
          price: true,
          isOnSale: true,
          salePrice: true,
          rating: true,
          Developer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      platform: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return cartItems.map((item) => ({
    cartItemId: item.id,
    quantity: item.quantity,
    addedAt: item.createdAt,
    ...item.game,
    platform: item.platform,
  }));
}

export async function updateQuantity(
  userId: number,
  gameId: number,
  platformId: number,
  quantity: number
) {
  if (quantity < 1) {
    throw new Error("La cantidad debe ser al menos 1");
  }

  return await prisma.cartItem.update({
    where: { userId_gameId_platformId: { userId, gameId, platformId } },
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
      platform: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function clearCart(userId: number) {
  return prisma.cartItem.deleteMany({
    where: { userId },
  });
}
