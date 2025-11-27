import type { Request, Response } from "express";
import {
  listGames,
  findGameById,
  createGame,
  updateGame,
  deleteGame,
} from "./games.service.js";

export async function listGamesCtrl(req: Request, res: Response) {
  try {
    const filters: any = {};
    if (req.query.title) filters.title = req.query.title as string;
    if (req.query.price) filters.price = Number(req.query.price);
    if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
    if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);
    if (req.query.genre) filters.genre = String(req.query.genre);
    if (req.query.platform) filters.platform = String(req.query.platform);
    if (req.query.isOnSale !== undefined)
      filters.isOnSale =
        req.query.isOnSale === "true" || req.query.isOnSale === "1";
    const games = await listGames(filters);
    res.json(games);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getGameCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const game: any = await findGameById(id);
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    const response: any = { ...game };
    if (game.Publisher) {
      response.publisher = game.Publisher;
      delete response.Publisher;
    }
    if (game.Developer) {
      response.developer = game.Developer;
      delete response.Developer;
    }
    if (game.genres) {
      response.genres = game.genres;
    }
    if (game.platforms) {
      response.platforms = game.platforms;
    }
    if (game.media) {
      response.media = game.media;
    }
    delete response.publisherId;
    delete response.developerId;
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createGameCtrl(req: Request, res: Response) {
  try {
    const payload: any = { ...req.body };

    if (payload.releaseDate !== undefined && payload.releaseDate !== null) {
      const d = new Date(payload.releaseDate);
      if (isNaN(d.getTime())) {
        return res
          .status(400)
          .json({ message: "releaseDate inválido. Use YYYY-MM-DD o ISO-8601" });
      }
      payload.releaseDate = d;
    }

    if (payload.publisherId !== undefined)
      payload.publisherId = Number(payload.publisherId);
    if (payload.developerId !== undefined)
      payload.developerId = Number(payload.developerId);

    if (payload.genres && typeof payload.genres === "string") {
      payload.genres = payload.genres
        .split(/[,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (payload.platforms && typeof payload.platforms === "string") {
      payload.platforms = payload.platforms
        .split(/[,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.salePrice !== undefined)
      payload.salePrice = Number(payload.salePrice);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    const created = await createGame(payload);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Conflicto al crear el juego (posible duplicado)" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Referencia inválida: publisher o developer no encontrado",
      });
    }
    res.status(500).json({ message: error.message });
  }
}

export async function updateGameCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const payload: any = { ...req.body };

    if (payload.releaseDate !== undefined && payload.releaseDate !== null) {
      const d = new Date(payload.releaseDate);
      if (isNaN(d.getTime())) {
        return res
          .status(400)
          .json({ message: "releaseDate inválido. Use YYYY-MM-DD o ISO-8601" });
      }
      payload.releaseDate = d;
    }

    if (payload.publisherId !== undefined)
      payload.publisherId = Number(payload.publisherId);
    if (payload.developerId !== undefined)
      payload.developerId = Number(payload.developerId);

    if (payload.genres && typeof payload.genres === "string") {
      payload.genres = payload.genres
        .split(/[,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (payload.platforms && typeof payload.platforms === "string") {
      payload.platforms = payload.platforms
        .split(/[,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.salePrice !== undefined)
      payload.salePrice = Number(payload.salePrice);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    const updated = await updateGame(id, payload);
    res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    res.status(500).json({ message: error.message });
  }
}

export async function deleteGameCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    await deleteGame(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    res.status(500).json({ message: error.message });
  }
}
