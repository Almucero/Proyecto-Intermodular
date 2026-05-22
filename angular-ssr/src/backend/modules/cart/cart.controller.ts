/**
 * @file: src/backend/modules/cart/cart.controller.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Controladores de carrito que manejan adición, eliminación, actualización y checkout de productos, con integración de Stripe.
 */

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { updateCartQuantitySchema, addToCartSchema } from './cart.schema';
import {
  addToCart,
  confirmCheckoutSession,
  confirmDirectCheckoutSession,
  createCheckoutSession,
  createDirectCheckoutSession,
  removeFromCart,
  updateQuantity,
  getUserCart,
  clearCart,
} from './cart.service';
import { notifyPurchaseStatus } from '../notifications';

/** Valida `gameId` de ruta como entero positivo. */
const gameIdSchema = z.object({
  gameId: z.coerce
    .number()
    .int()
    .positive('gameId debe ser un número positivo'),
});

/** Valida payload para confirmar una sesión de checkout Stripe. */
const confirmCheckoutSchema = z.object({
  sessionId: z.string().min(1, 'sessionId es requerido'),
});

/** Valida payload para crear checkout desde carrito. */
const createCheckoutSessionSchema = z.object({
  locale: z.string().trim().min(2).max(20).optional(),
});

/** Valida payload para checkout directo de un juego/plataforma. */
const createDirectCheckoutSessionSchema = z.object({
  gameId: z.coerce.number().int().positive('gameId debe ser un número positivo'),
  platformId: z.coerce
    .number()
    .int()
    .positive('platformId debe ser un número positivo'),
  locale: z.string().trim().min(2).max(20).optional(),
});

/**
 * Añade un juego/plataforma al carrito del usuario autenticado.
 *
 * @param req Request con usuario autenticado y payload de carrito.
 * @param res Response HTTP.
 * @param next Next middleware para propagación de errores.
 * @returns Respuesta con item de carrito creado/actualizado.
 */
export async function addToCartCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user!;

  try {
    const bodyParsed = addToCartSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }

    const { gameId, quantity, platformId } = bodyParsed.data;

    const cartItem = await addToCart(user.sub, gameId, platformId, quantity);

    res.status(201).json(cartItem);
  } catch (error: any) {
    if (error.code === 'P2002') {
      try {
        const bodyParsed = addToCartSchema.safeParse(req.body);
        if (bodyParsed.success) {
          const { gameId, quantity, platformId } = bodyParsed.data;
          const cartItem = await addToCart(user.sub, gameId, platformId, quantity);
          return res.status(201).json(cartItem);
        }
      } catch (retryError: any) {
        return next(retryError);
      }
    }
    if (error.message === 'Juego no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message === 'La cantidad debe ser al menos 1' ||
      error.message === 'El juego no tiene precio válido definido'
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * Elimina un juego/plataforma del carrito del usuario.
 *
 * @param req Request con `gameId` en params y `platformId` en query.
 * @param res Response HTTP.
 * @param next Next middleware para propagación de errores.
 * @returns Respuesta de eliminación.
 */
export async function removeFromCartCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const parsed = gameIdSchema.safeParse({ gameId: req.params.gameId });

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { gameId } = parsed.data;
    const platformId = Number(req.query.platformId);

    if (!platformId || isNaN(platformId)) {
      return res.status(400).json({ message: 'platformId es requerido' });
    }

    const result = await removeFromCart(user.sub, gameId, platformId);

    res.status(200).json(result);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res
        .status(404)
        .json({ message: 'Artículo del carrito no encontrado' });
    }
    next(error);
  }
}

/**
 * Actualiza la cantidad de un item existente en carrito.
 *
 * @param req Request con identificadores y nueva cantidad.
 * @param res Response HTTP.
 * @param next Next middleware para propagación de errores.
 * @returns Respuesta con item actualizado.
 */
export async function updateCartQuantityCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const gameIdParsed = gameIdSchema.safeParse({ gameId: req.params.gameId });
    const bodyParsed = updateCartQuantitySchema.safeParse(req.body);

    if (!gameIdParsed.success) {
      return res.status(400).json({ errors: gameIdParsed.error.flatten() });
    }

    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }

    const { gameId } = gameIdParsed.data;
    const { quantity, platformId } = bodyParsed.data;

    const cartItem = await updateQuantity(
      user.sub,
      gameId,
      platformId,
      quantity,
    );

    res.status(200).json(cartItem);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res
        .status(404)
        .json({ message: 'Artículo del carrito no encontrado' });
    }
    if (error.message === 'La cantidad debe ser al menos 1') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * Devuelve el carrito completo del usuario autenticado.
 *
 * @param req Request con usuario autenticado.
 * @param res Response HTTP.
 * @param next Next middleware para propagación de errores.
 * @returns Lista de items de carrito del usuario.
 */
export async function getUserCartCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;

    const cartItems = await getUserCart(user.sub);

    res.status(200).json(cartItems);
  } catch (error) {
    next(error);
  }
}

/**
 * Vacía por completo el carrito del usuario autenticado.
 *
 * @param req Request con usuario autenticado.
 * @param res Response HTTP.
 * @param next Next middleware para propagación de errores.
 * @returns Confirmación de carrito vaciado.
 */
export async function clearCartCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;

    await clearCart(user.sub);

    res.status(200).json({ message: 'Carrito vaciado' });
  } catch (error) {
    next(error);
  }
}

/**
 * Crea sesión de Stripe Checkout para todos los items del carrito.
 *
 * @param req Request con usuario autenticado y locale opcional.
 * @param res Response HTTP.
 * @param next Next middleware para propagación de errores.
 * @returns Credenciales cliente para Stripe embebido.
 */
export async function createCheckoutSessionCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const bodyParsed = createCheckoutSessionSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }
    const protocol =
      (req.headers['x-forwarded-proto'] as string) ||
      (req.secure ? 'https' : 'http');
    const host = req.get('host');
    const origin = `${protocol}://${host}`;
    const session = await createCheckoutSession(
      user.sub,
      origin,
      bodyParsed.data.locale,
    );
    res.status(200).json(session);
  } catch (error: any) {
    if (
      error.message === 'El carrito está vacío' ||
      error.message?.startsWith('Precio inválido para') ||
      error.message === 'No se pudo crear la sesión de pago embebida'
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * Crea sesión de Stripe Checkout para compra directa.
 *
 * @param req Request con usuario, juego, plataforma y locale opcional.
 * @param res Response HTTP.
 * @param next Next middleware para propagación de errores.
 * @returns Credenciales cliente para Stripe embebido.
 */
export async function createDirectCheckoutSessionCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const bodyParsed = createDirectCheckoutSessionSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }
    const protocol =
      (req.headers['x-forwarded-proto'] as string) ||
      (req.secure ? 'https' : 'http');
    const host = req.get('host');
    const origin = `${protocol}://${host}`;
    const session = await createDirectCheckoutSession(
      user.sub,
      origin,
      bodyParsed.data.gameId,
      bodyParsed.data.platformId,
      bodyParsed.data.locale,
    );
    res.status(200).json(session);
  } catch (error: any) {
    if (
      error.message === 'Juego no encontrado' ||
      error.message === 'Plataforma no válida para este juego' ||
      error.message?.startsWith('Precio inválido para') ||
      error.message === 'No se pudo crear la sesión de pago embebida'
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * Confirma el pago de checkout de carrito y dispara notificación de compra.
 *
 * @param req Request con usuario autenticado y `sessionId`.
 * @param res Response HTTP.
 * @param next Next middleware para propagación de errores.
 * @returns Compra confirmada.
 */
export async function confirmCheckoutSessionCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const parsed = confirmCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }
    const purchase = await confirmCheckoutSession(user.sub, parsed.data.sessionId);
    void notifyPurchaseStatus({
      userId: user.sub,
      type: 'purchase',
      games: (purchase.items || []).map((it: any) => ({
        title: it.title,
        platform: it.platform?.name || 'Platform',
        price: Number(it.purchasePrice ?? it.price ?? 0),
      })),
      total: Number(purchase.totalPrice ?? 0),
      reference: `STRIPE-${parsed.data.sessionId}`,
    });
    res.status(200).json(purchase);
  } catch (error: any) {
    if (
      error.message === 'La sesión de pago no está completada' ||
      error.message === 'La sesión de pago no pertenece al usuario autenticado' ||
      error.message === 'No hay artículos pendientes de compra' ||
      error.message?.startsWith('Stock insuficiente para')
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * Confirma el pago de checkout directo y dispara notificación de compra.
 *
 * @param req Request con usuario autenticado y `sessionId`.
 * @param res Response HTTP.
 * @param next Next middleware para propagación de errores.
 * @returns Compra directa confirmada.
 */
export async function confirmDirectCheckoutSessionCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const parsed = confirmCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }
    const purchase = await confirmDirectCheckoutSession(user.sub, parsed.data.sessionId);
    void notifyPurchaseStatus({
      userId: user.sub,
      type: 'purchase',
      games: (purchase.items || []).map((it: any) => ({
        title: it.title,
        platform: it.platform?.name || 'Platform',
        price: Number(it.purchasePrice ?? it.price ?? 0),
      })),
      total: Number(purchase.totalPrice ?? 0),
      reference: `STRIPE-${parsed.data.sessionId}`,
    });
    res.status(200).json(purchase);
  } catch (error: any) {
    if (
      error.message === 'La sesión de pago no está completada' ||
      error.message === 'La sesión de pago no pertenece al usuario autenticado' ||
      error.message === 'La sesión no corresponde a una compra directa' ||
      error.message === 'Metadatos inválidos de compra directa' ||
      error.message === 'Juego no encontrado' ||
      error.message === 'Plataforma no encontrada' ||
      error.message?.startsWith('Stock insuficiente para')
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}
