import { prisma } from '../../config/db';
import { Prisma } from '@prisma/client';

export async function completePurchase(userId: number, cartItemIds: number[]) {
  if (cartItemIds.length === 0) {
    throw new Error('Debe proporcionar al menos un artículo del carrito');
  }

  const cartItems = await prisma.cartItem.findMany({
    where: {
      id: { in: cartItemIds },
      userId,
    },
    include: { game: true, platform: true },
  });

  if (cartItems.length !== cartItemIds.length) {
    throw new Error('Algunos artículos del carrito no fueron encontrados');
  }

  const totalPrice = cartItems.reduce(
    (sum: any, item: any) => {
      const gamePrice = item.game.price || new (Prisma as any).Decimal(0);
      return (sum as any).add(gamePrice.mul(item.quantity));
    },
    new (Prisma as any).Decimal(0),
  );

  const purchase = await prisma.purchase.create({
    data: {
      userId,
      totalPrice,
      status: 'completed',
      items: {
        create: cartItems.map((item: any) => ({
          gameId: item.gameId,
          platformId: item.platformId,
          price: item.game.price || new (Prisma as any).Decimal(0),
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
          platform: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  await prisma.cartItem.deleteMany({
    where: {
      id: { in: cartItemIds },
      userId,
    },
  });

  return {
    id: purchase.id,
    userId: purchase.userId,
    totalPrice: purchase.totalPrice,
    status: purchase.status,
    refundReason: purchase.refundReason,
    purchasedAt: purchase.purchasedAt,
    items: purchase.items.map((item: any) => ({
      id: item.game.id,
      title: item.game.title,
      price: item.game.price,
      rating: item.game.rating,
      itemId: item.id,
      purchasePrice: item.price,
      quantity: item.quantity,
      platform: item.platform,
    })),
  };
}

export async function getUserPurchases(
  userId: number,
  status?: 'completed' | 'refunded',
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
          platform: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      purchasedAt: 'desc',
    },
  });

  return purchases.map((purchase: any) => ({
    id: purchase.id,
    totalPrice: purchase.totalPrice,
    status: purchase.status,
    refundReason: purchase.refundReason,
    purchasedAt: purchase.purchasedAt,
    items: purchase.items.map((item: any) => ({
      id: item.game.id,
      title: item.game.title,
      price: item.game.price,
      rating: item.game.rating,
      itemId: item.id,
      purchasePrice: item.price,
      quantity: item.quantity,
      platform: item.platform,
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
          platform: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!purchase) {
    throw new Error('Compra no encontrada');
  }

  return {
    id: purchase.id,
    totalPrice: purchase.totalPrice,
    status: purchase.status,
    refundReason: purchase.refundReason,
    purchasedAt: purchase.purchasedAt,
    items: purchase.items.map((item: any) => ({
      id: item.game.id,
      title: item.game.title,
      price: item.game.price,
      rating: item.game.rating,
      itemId: item.id,
      purchasePrice: item.price,
      quantity: item.quantity,
      platform: item.platform,
    })),
  };
}

export async function refundPurchase(
  userId: number,
  purchaseId: number,
  reason: string,
) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      id: purchaseId,
      userId,
    },
  });

  if (!purchase) {
    throw new Error('Compra no encontrada');
  }

  if (purchase.status === 'refunded') {
    throw new Error('Esta compra ya ha sido reembolsada');
  }

  const updated = await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      status: 'refunded',
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
          platform: {
            select: {
              id: true,
              name: true,
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
    items: updated.items.map((item: any) => ({
      id: item.game.id,
      title: item.game.title,
      price: item.game.price,
      rating: item.game.rating,
      itemId: item.id,
      purchasePrice: item.price,
      quantity: item.quantity,
      platform: item.platform,
    })),
  };
}
