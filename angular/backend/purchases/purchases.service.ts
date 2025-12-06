import { prisma } from "../../config/db.js";
import { Prisma } from "@prisma/client";

export async function completePurchase(userId: number, gameIds: number[]) {
  if (gameIds.length === 0) {
    throw new Error("Debe proporcionar al menos un juego");
  }

  const cartItems = await prisma.cartItem.findMany({
    where: {
      userId,
      gameId: { in: gameIds },
    },
    include: { game: true },
  });

  if (cartItems.length === 0) {
    throw new Error("No se encontraron artículos en el carrito");
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const gamePrice = item.game.price || new Prisma.Decimal(0);
    return sum.add(gamePrice.mul(item.quantity));
  }, new Prisma.Decimal(0));

  const purchase = await prisma.purchase.create({
    data: {
      userId,
      totalPrice,
      status: "completed",
      items: {
        create: cartItems.map((item) => ({
          gameId: item.gameId,
          price: item.game.price || new Prisma.Decimal(0),
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: {
        include: {
          game: {
            select: {
              id: true,
              title: true,
              price: true,
              rating: true,
            },
          },
        },
      },
    },
  });

  await prisma.cartItem.deleteMany({
    where: {
      userId,
      gameId: { in: gameIds },
    },
  });

  return {
    id: purchase.id,
    userId: purchase.userId,
    totalPrice: purchase.totalPrice,
    status: purchase.status,
    refundReason: purchase.refundReason,
    purchasedAt: purchase.purchasedAt,
    items: purchase.items.map((item) => ({
      id: item.game.id,
      title: item.game.title,
      price: item.game.price,
      rating: item.game.rating,
      itemId: item.id,
      purchasePrice: item.price,
      quantity: item.quantity,
    })),
  };
}

export async function getUserPurchases(
  userId: number,
  status?: "completed" | "refunded"
) {
  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    include: {
      items: {
        include: {
          game: {
            select: {
              id: true,
              title: true,
              price: true,
              rating: true,
            },
          },
        },
      },
    },
    orderBy: {
      purchasedAt: "desc",
    },
  });

  return purchases.map((purchase) => ({
    id: purchase.id,
    totalPrice: purchase.totalPrice,
    status: purchase.status,
    refundReason: purchase.refundReason,
    purchasedAt: purchase.purchasedAt,
    items: purchase.items.map((item) => ({
      id: item.game.id,
      title: item.game.title,
      price: item.game.price,
      rating: item.game.rating,
      itemId: item.id,
      purchasePrice: item.price,
      quantity: item.quantity,
    })),
  }));
}

export async function getPurchase(userId: number, purchaseId: number) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      id: purchaseId,
      userId,
    },
    include: {
      items: {
        include: {
          game: {
            select: {
              id: true,
              title: true,
              price: true,
              rating: true,
            },
          },
        },
      },
    },
  });

  if (!purchase) {
    throw new Error("Compra no encontrada");
  }

  return {
    id: purchase.id,
    totalPrice: purchase.totalPrice,
    status: purchase.status,
    refundReason: purchase.refundReason,
    purchasedAt: purchase.purchasedAt,
    items: purchase.items.map((item) => ({
      id: item.game.id,
      title: item.game.title,
      price: item.game.price,
      rating: item.game.rating,
      itemId: item.id,
      purchasePrice: item.price,
      quantity: item.quantity,
    })),
  };
}

export async function refundPurchase(
  userId: number,
  purchaseId: number,
  reason: string
) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      id: purchaseId,
      userId,
    },
  });

  if (!purchase) {
    throw new Error("Compra no encontrada");
  }

  if (purchase.status === "refunded") {
    throw new Error("Esta compra ya ha sido reembolsada");
  }

  const updated = await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      status: "refunded",
      refundReason: reason,
    },
    include: {
      items: {
        include: {
          game: {
            select: {
              id: true,
              title: true,
              price: true,
              rating: true,
            },
          },
        },
      },
    },
  });

  return {
    id: updated.id,
    totalPrice: updated.totalPrice,
    status: updated.status,
    refundReason: updated.refundReason,
    purchasedAt: updated.purchasedAt,
    items: updated.items.map((item) => ({
      id: item.game.id,
      title: item.game.title,
      price: item.game.price,
      rating: item.game.rating,
      itemId: item.id,
      purchasePrice: item.price,
      quantity: item.quantity,
    })),
  };
}
