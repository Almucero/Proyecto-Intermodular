import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as favoritesService from "./favorites.service.js";
import { logger } from "../../utils/logger.js";

const gameIdSchema = z.object({
  gameId: z.coerce
    .number()
    .int()
    .positive("gameId debe ser un número positivo"),
});

/**
 * POST /api/favorites/:gameId
 * Agregar juego a favoritos
 */
export async function addToFavoritesCtrl(
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

    const favorite = await favoritesService.addToFavorites(user.sub, gameId);

    logger.info(`User ${user.sub} added game ${gameId} to favorites`);
    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/favorites/:gameId
 * Remover juego de favoritos
 */
export async function removeFromFavoritesCtrl(
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

    const result = await favoritesService.removeFromFavorites(user.sub, gameId);

    logger.info(`User ${user.sub} removed game ${gameId} from favorites`);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/favorites
 * Obtener favoritos del usuario
 */
export async function getUserFavoritesCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;

    const favorites = await favoritesService.getUserFavorites(user.sub);

    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/favorites/check/:gameId
 * Verificar si un juego está en favoritos
 */
export async function isFavoriteCtrl(
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

    const isFav = await favoritesService.isFavorite(user.sub, gameId);

    res.status(200).json({ isFavorite: isFav });
  } catch (error) {
    next(error);
  }
}
