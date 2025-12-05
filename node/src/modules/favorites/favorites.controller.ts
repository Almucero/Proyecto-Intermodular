import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isFavorite,
} from "./favorites.service.js";
import { logger } from "../../utils/logger.js";

const gameIdSchema = z.object({
  gameId: z.coerce
    .number()
    .int()
    .positive("gameId debe ser un número positivo"),
});

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

    const favorite = await addToFavorites(user.sub, gameId);

    logger.info(`User ${user.sub} added game ${gameId} to favorites`);
    res.status(201).json(favorite);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Este juego ya está en favoritos" });
    }
    if (error.code === "P2003") {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    next(error);
  }
}

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

    const result = await removeFromFavorites(user.sub, gameId);

    logger.info(`User ${user.sub} removed game ${gameId} from favorites`);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Favorito no encontrado" });
    }
    next(error);
  }
}

export async function getUserFavoritesCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;

    const favorites = await getUserFavorites(user.sub);

    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
}

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

    const isFav = await isFavorite(user.sub, gameId);

    res.status(200).json({ isFavorite: isFav });
  } catch (error) {
    next(error);
  }
}
