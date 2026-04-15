import { prisma } from '../../config/db';
import Stripe from 'stripe';
import { env } from '../../config/env';
import { completePurchase } from '../purchases/purchases.service';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function addToCart(
  userId: number,
  gameId: number,
  platformId: number,
  quantity = 1,
) {
  if (quantity < 1) {
    throw new Error('La cantidad debe ser al menos 1');
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, title: true, price: true },
  });

  if (!game) {
    throw new Error('Juego no encontrado');
  }

  if (!game.price || game.price.toNumber() <= 0) {
    throw new Error('El juego no tiene precio válido definido');
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
          Developer: {
            select: {
              id: true,
              name: true,
            },
          },
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
  platformId: number,
) {
  await prisma.cartItem.delete({
    where: {
      userId_gameId_platformId: { userId, gameId, platformId },
    },
  });
  return { message: 'Juego removido del carrito' };
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
          media: {
            select: {
              url: true,
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
    orderBy: { createdAt: 'desc' },
  });

  return cartItems.map((item: any) => ({
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
  quantity: number,
) {
  if (quantity < 1) {
    throw new Error('La cantidad debe ser al menos 1');
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
          Developer: {
            select: {
              id: true,
              name: true,
            },
          },
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

export async function createCheckoutSession(
  userId: number,
  origin: string,
  locale?: string,
) {
  const allowedLocales = [
    'auto',
    'es',
    'en',
    'fr',
    'de',
    'it',
    'pt',
    'nl',
  ] as const;
  type AllowedLocale = (typeof allowedLocales)[number];
  const normalizedLocale = (locale || 'auto').toLowerCase();
  const stripeLocale = allowedLocales.includes(normalizedLocale as AllowedLocale)
    ? (normalizedLocale as AllowedLocale)
    : 'auto';

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    select: {
      quantity: true,
      game: {
        select: {
          title: true,
          price: true,
          isOnSale: true,
          salePrice: true,
          media: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
      },
      platform: {
        select: {
          name: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new Error('El carrito está vacío');
  }

  const lineItems = cartItems.map((item) => {
      const unitPrice =
        item.game.isOnSale && item.game.salePrice !== null
          ? Number(item.game.salePrice)
          : Number(item.game.price);
      const unitAmount = Math.round(unitPrice * 100);

      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        throw new Error(`Precio inválido para ${item.game.title}`);
      }

      return {
        quantity: item.quantity,
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          product_data: {
            name: item.game.title,
            description: item.platform?.name
              ? `Plataforma: ${item.platform.name}`
              : undefined,
            images:
              item.game.media?.[0]?.url && /^https?:\/\//.test(item.game.media[0].url)
                ? [item.game.media[0].url]
                : undefined,
          },
        },
      };
    });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    ui_mode: 'embedded_page' as any,
    locale: stripeLocale,
    return_url: `${origin}/cart?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    redirect_on_completion: 'if_required' as any,
    line_items: lineItems,
    branding_settings: {
      background_color: '#0f172a',
      button_color: '#22d3ee',
      border_style: 'rounded',
      display_name: 'GameSage',
    },
    metadata: {
      userId: String(userId),
    },
  });

  if (!session.client_secret || !session.id) {
    throw new Error('No se pudo crear la sesión de pago embebida');
  }

  return {
    clientSecret: session.client_secret,
    sessionId: session.id,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  };
}

export async function confirmCheckoutSession(userId: number, sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session || session.payment_status !== 'paid') {
    throw new Error('La sesión de pago no está completada');
  }

  const metadataUserId = Number(session.metadata?.['userId'] || 0);
  if (metadataUserId !== userId) {
    throw new Error('La sesión de pago no pertenece al usuario autenticado');
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    select: { id: true },
  });

  if (cartItems.length === 0) {
    throw new Error('No hay artículos pendientes de compra');
  }

  return completePurchase(
    userId,
    cartItems.map((item) => item.id),
  );
}
