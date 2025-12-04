import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { updateCartQuantitySchema } from "./cart.schema.js";
import * as cartService from "./cart.service.js";
import { logger } from "../../utils/logger.js";

const gameIdSchema = z.object({
  gameId: z.coerce
    .number()
    .int()
    .positive("gameId debe ser un número positivo"),
});

const addToCartSchema = z.object({
  quantity: z.coerce
    .number()
    .int()
    .positive("quantity debe ser un número positivo")
    .optional()
    .default(1),
});

/**
 * POST /api/cart/:gameId
 * Agregar juego al carrito
 */
export async function addToCartCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const gameIdParsed = gameIdSchema.safeParse({ gameId: req.params.gameId });
    const bodyParsed = addToCartSchema.safeParse(req.body);

    if (!gameIdParsed.success) {
      return res.status(400).json({ errors: gameIdParsed.error.flatten() });
    }

    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }

    const { gameId } = gameIdParsed.data;
    const { quantity } = bodyParsed.data;

    const cartItem = await cartService.addToCart(user.sub, gameId, quantity);

    logger.info(
      `User ${user.sub} added game ${gameId} to cart (qty: ${quantity})`
    );
    res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cart/:gameId
 * Remover juego del carrito
 */
export async function removeFromCartCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const parsed = gameIdSchema.safeParse({ gameId: req.params.gameId });

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { gameId } = parsed.data;

    const result = await cartService.removeFromCart(user.sub, gameId);

    logger.info(`User ${user.sub} removed game ${gameId} from cart`);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/cart/:gameId
 * Actualizar cantidad en carrito
 */
export async function updateCartQuantityCtrl(
  req: Request,
  res: Response,
  next: NextFunction
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
    const { quantity } = bodyParsed.data;

    const cartItem = await cartService.updateQuantity(
      user.sub,
      gameId,
      quantity
    );

    logger.info(
      `User ${user.sub} updated cart item ${gameId} quantity to ${quantity}`
    );
    res.status(200).json(cartItem);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/cart
 * Obtener carrito del usuario
 */
export async function getUserCartCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;

    const cartItems = await cartService.getUserCart(user.sub);

    res.status(200).json(cartItems);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cart
 * Vaciar carrito
 */
export async function clearCartCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;

    await cartService.clearCart(user.sub);

    logger.info(`User ${user.sub} cleared cart`);
    res.status(200).json({ message: "Carrito vaciado" });
  } catch (error) {
    next(error);
  }
}
