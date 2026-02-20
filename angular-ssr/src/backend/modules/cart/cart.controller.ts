import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { updateCartQuantitySchema, addToCartSchema } from './cart.schema';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  getUserCart,
  clearCart,
} from './cart.service';
import { logger } from '../../utils/logger';

const gameIdSchema = z.object({
  gameId: z.coerce
    .number()
    .int()
    .positive('gameId debe ser un número positivo'),
});

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

    logger.info(
      `User ${user.sub} added game ${gameId} (platform ${platformId}) to cart (qty: ${quantity})`,
    );
    res.status(201).json(cartItem);
  } catch (error: any) {
    if (error.code === 'P2002') {
      try {
        const bodyParsed = addToCartSchema.safeParse(req.body);
        if (bodyParsed.success) {
          const { gameId, quantity, platformId } = bodyParsed.data;
          const cartItem = await addToCart(user.sub, gameId, platformId, quantity);
          logger.info(
            `User ${user.sub} added game ${gameId} (platform ${platformId}) to cart (qty: ${quantity}) - retry after conflict`,
          );
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

    logger.info(
      `User ${user.sub} removed game ${gameId} (platform ${platformId}) from cart`,
    );
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

    logger.info(
      `User ${user.sub} updated cart item ${gameId} (platform ${platformId}) quantity to ${quantity}`,
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

export async function clearCartCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;

    await clearCart(user.sub);

    logger.info(`User ${user.sub} cleared cart`);
    res.status(200).json({ message: 'Carrito vaciado' });
  } catch (error) {
    next(error);
  }
}
