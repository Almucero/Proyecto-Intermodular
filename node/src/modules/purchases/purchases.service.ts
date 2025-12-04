import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/errors.js";
import { Prisma } from "@prisma/client";

export async function completePurchase(userId: number, gameIds: number[]) {
  if (gameIds.length === 0) {
    throw new AppError("Debe proporcionar al menos un juego", 400);
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId,
        gameId: { in: gameIds },
      },
      include: { game: true },
    });

    if (cartItems.length === 0) {
      throw new AppError("No se encontraron artículos en el carrito", 404);
    }

    const purchases = await Promise.all(
      cartItems.map((item) =>
        prisma.purchase.create({
          data: {
            userId,
            gameId: item.gameId,
            price: item.game.price || new Prisma.Decimal(0),
            status: "completed",
          },
          select: {
            id: true,
            userId: true,
            gameId: true,
            price: true,
            status: true,
            refundReason: true,
            purchasedAt: true,
            game: {
              select: {
                id: true,
                title: true,
                price: true,
                description: true,
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
        })
      )
    );

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        gameId: { in: gameIds },
      },
    });

    return purchases;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError("Error al completar la compra", 500);
  }
}

export async function getUserPurchases(userId: number) {
  return prisma.purchase.findMany({
    where: { userId },
    select: {
      id: true,
      userId: true,
      gameId: true,
      price: true,
      status: true,
      refundReason: true,
      purchasedAt: true,
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
    orderBy: { purchasedAt: "desc" },
  });
}

export async function refundPurchase(
  userId: number,
  purchaseId: number,
  reason: string
) {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new AppError("Compra no encontrada", 404);
    }

    if (purchase.userId !== userId) {
      throw new AppError("No tienes permiso para reembolsar esta compra", 403);
    }

    if (purchase.status === "refunded") {
      throw new AppError("Esta compra ya fue reembolsada", 400);
    }

    return await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: "refunded",
        refundReason: reason,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError("Error al procesar reembolso", 500);
  }
}

export async function getPurchase(userId: number, purchaseId: number) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    select: {
      id: true,
      userId: true,
      gameId: true,
      price: true,
      status: true,
      refundReason: true,
      purchasedAt: true,
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
  });

  if (!purchase) {
    throw new AppError("Compra no encontrada", 404);
  }

  if (purchase.userId !== userId) {
    throw new AppError("No tienes permiso para ver esta compra", 403);
  }

  return purchase;
}
