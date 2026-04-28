import { prisma } from '../../config/db';
import { Prisma } from '@prisma/client';

type StockField =
  | 'stockPc'
  | 'stockPs5'
  | 'stockXboxX'
  | 'stockSwitch'
  | 'stockPs4'
  | 'stockXboxOne';

function getStockFieldByPlatformName(platformName: string): StockField {
  const normalized = platformName.trim().toLowerCase();
  if (normalized === 'pc') return 'stockPc';
  if (normalized === 'ps5' || normalized === 'playstation 5') return 'stockPs5';
  if (normalized === 'xbox x' || normalized === 'xbox series x') return 'stockXboxX';
  if (normalized === 'switch' || normalized === 'nintendo switch') return 'stockSwitch';
  if (normalized === 'ps4' || normalized === 'playstation 4') return 'stockPs4';
  if (normalized === 'xbox one') return 'stockXboxOne';
  throw new Error(`Plataforma no soportada para control de stock: ${platformName}`);
}

function getGameStockByField(game: any, stockField: StockField): number {
  if (stockField === 'stockPc') return Number(game.stockPc ?? 0);
  if (stockField === 'stockPs5') return Number(game.stockPs5 ?? 0);
  if (stockField === 'stockXboxX') return Number(game.stockXboxX ?? 0);
  if (stockField === 'stockSwitch') return Number(game.stockSwitch ?? 0);
  if (stockField === 'stockPs4') return Number(game.stockPs4 ?? 0);
  return Number(game.stockXboxOne ?? 0);
}

export async function completePurchase(userId: number, cartItemIds: number[]) {
  if (cartItemIds.length === 0) {
    throw new Error('Debe proporcionar al menos un artículo del carrito');
  }

  const cartItems = await prisma.cartItem.findMany({
    where: {
      id: { in: cartItemIds },
      userId,
    },
    include: {
      game: {
        select: {
          id: true,
          title: true,
          price: true,
          salePrice: true,
          isOnSale: true,
          rating: true,
          stockPc: true,
          stockPs5: true,
          stockXboxX: true,
          stockSwitch: true,
          stockPs4: true,
          stockXboxOne: true,
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

  if (cartItems.length !== cartItemIds.length) {
    throw new Error('Algunos artículos del carrito no fueron encontrados');
  }

  const totalPrice = cartItems.reduce(
    (sum: any, item: any) => {
      const gamePrice =
        item.game.isOnSale && item.game.salePrice !== null
          ? item.game.salePrice
          : item.game.price || new (Prisma as any).Decimal(0);
      return (sum as any).add(gamePrice.mul(item.quantity));
    },
    new (Prisma as any).Decimal(0),
  );

  const purchase = await prisma.$transaction(async (tx) => {
    for (const item of cartItems) {
      const stockField = getStockFieldByPlatformName(item.platform.name);
      const currentStock = getGameStockByField(item.game, stockField);
      if (currentStock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${item.game.title} en ${item.platform.name}`,
        );
      }
    }

    for (const item of cartItems) {
      const stockField = getStockFieldByPlatformName(item.platform.name);
      await tx.game.update({
        where: { id: item.gameId },
        data: {
          [stockField]: { decrement: item.quantity },
          numberOfSales: { increment: item.quantity },
        } as any,
        select: {
          id: true,
        },
      });
    }

    const createdPurchase = await tx.purchase.create({
      data: {
        userId,
        totalPrice,
        status: 'completed',
        items: {
          create: cartItems.map((item: any) => ({
            gameId: item.gameId,
            platformId: item.platformId,
            price:
              item.game.isOnSale && item.game.salePrice !== null
                ? item.game.salePrice
                : item.game.price || new (Prisma as any).Decimal(0),
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
                key: true,
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

    await tx.cartItem.deleteMany({
      where: {
        id: { in: cartItemIds },
        userId,
      },
    });

    return createdPurchase;
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
      key: item.game.key ?? null,
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
              key: true,
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
      key: item.game.key ?? null,
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
              key: true,
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
      key: item.game.key ?? null,
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
  const updated = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findFirst({
      where: {
        id: purchaseId,
        userId,
      },
      include: {
        items: {
          include: {
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

    if (purchase.status === 'refunded') {
      throw new Error('Esta compra ya ha sido reembolsada');
    }

    for (const item of purchase.items) {
      const stockField = getStockFieldByPlatformName(item.platform.name);
      await tx.game.update({
        where: { id: item.gameId },
        data: {
          [stockField]: { increment: item.quantity },
          numberOfSales: { decrement: item.quantity },
        } as any,
        select: {
          id: true,
        },
      });
    }

    return tx.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'refunded',
        refundReason: reason,
        purchasedAt: new Date(),
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
                key: true,
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
      key: item.game.key ?? null,
      itemId: item.id,
      purchasePrice: item.price,
      quantity: item.quantity,
      platform: item.platform,
    })),
  };
}
