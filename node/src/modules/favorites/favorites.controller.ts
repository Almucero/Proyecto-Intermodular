import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { addToFavoritesSchema } from "./favorites.schema.js";
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
    const bodyParsed = addToFavoritesSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }

    const { gameId, platformId } = bodyParsed.data;

    const favorite = await addToFavorites(user.sub, gameId, platformId);

    logger.info(
      `User ${user.sub} added game ${gameId} (platform ${platformId}) to favorites`
    );
    res.status(201).json(favorite);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Este juego ya está en favoritos para esta plataforma",
      });
    }
    if (error.code === "P2003") {
      return res
        .status(404)
        .json({ message: "Juego o plataforma no encontrado" });
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
    const platformId = Number(req.query.platformId);

    if (!platformId || isNaN(platformId)) {
      return res.status(400).json({ message: "platformId es requerido" });
    }

    const result = await removeFromFavorites(user.sub, gameId, platformId);

    logger.info(
      `User ${user.sub} removed game ${gameId} (platform ${platformId}) from favorites`
    );
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
    const platformId = Number(req.query.platformId);

    if (!platformId || isNaN(platformId)) {
      return res.status(400).json({ message: "platformId es requerido" });
    }

    const isFav = await isFavorite(user.sub, gameId, platformId);

    res.status(200).json({ isFavorite: isFav });
  } catch (error) {
    next(error);
  }
}
