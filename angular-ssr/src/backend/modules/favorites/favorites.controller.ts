import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { addToFavoritesSchema } from './favorites.schema';
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isFavorite,
} from './favorites.service';
import { notifyFavoriteOfferImmediate } from '../notifications';
import { logger } from '../../utils/logger';

/** Valida `gameId` de params como entero positivo. */
const gameIdSchema = z.object({
  gameId: z.coerce
    .number()
    .int()
    .positive('gameId debe ser un número positivo'),
});

/**
 * Añade un favorito para el usuario autenticado.
 *
 * @param req Request con payload de favorito.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Favorito creado.
 */
export async function addToFavoritesCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const bodyParsed = addToFavoritesSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }

    const { gameId, platformId } = bodyParsed.data;

    const favorite = await addToFavorites(user.sub, gameId, platformId);
    void notifyFavoriteOfferImmediate({
      userId: user.sub,
      gameId,
      gameTitle: (favorite as any).game?.title ?? 'Juego',
      platformName: (favorite as any).platform?.name ?? 'Plataforma',
      isOnSale: Boolean((favorite as any).game?.isOnSale),
      salePrice: (favorite as any).game?.salePrice != null ? Number((favorite as any).game?.salePrice) : null,
      price: (favorite as any).game?.price != null ? Number((favorite as any).game?.price) : null,
    });

    res.status(201).json(favorite);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Este juego ya está en favoritos para esta plataforma',
      });
    }
    if (error.code === 'P2003') {
      return res
        .status(404)
        .json({ message: 'Juego o plataforma no encontrado' });
    }
    next(error);
  }
}

/**
 * Elimina un favorito del usuario autenticado.
 *
 * @param req Request con `gameId` y `platformId`.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Confirmación de eliminación.
 */
export async function removeFromFavoritesCtrl(
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

    const result = await removeFromFavorites(user.sub, gameId, platformId);

    res.status(200).json(result);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Favorito no encontrado' });
    }
    next(error);
  }
}

/**
 * Lista favoritos del usuario autenticado.
 *
 * @param req Request autenticada.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Listado de favoritos.
 */
export async function getUserFavoritesCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;

    const favorites = await getUserFavorites(user.sub);

    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
}

/**
 * Comprueba si un juego/plataforma está en favoritos del usuario.
 *
 * @param req Request con `gameId` y `platformId`.
 * @param res Response HTTP.
 * @param next Next middleware.
 * @returns Estado booleano `isFavorite`.
 */
export async function isFavoriteCtrl(
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

    const isFav = await isFavorite(user.sub, gameId, platformId);

    res.status(200).json({ isFavorite: isFav });
  } catch (error) {
    next(error);
  }
}
