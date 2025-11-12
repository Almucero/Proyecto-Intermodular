import type { Request, Response } from "express";
import {
  listGames,
  findGameById,
  createGame,
  updateGame,
  deleteGame,
} from "./games.service.js";

export async function listGamesCtrl(_req: Request, res: Response) {
  try {
    const games = await listGames();
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

    const game = await findGameById(id);
    if (!game) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    res.json(game);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createGameCtrl(req: Request, res: Response) {
  try {
    const payload: any = { ...req.body };

    // Normalize releaseDate if provided as a date string
    if (payload.releaseDate !== undefined && payload.releaseDate !== null) {
      const d = new Date(payload.releaseDate);
      if (isNaN(d.getTime())) {
        return res
          .status(400)
          .json({ message: "releaseDate inválido. Use YYYY-MM-DD o ISO-8601" });
      }
      payload.releaseDate = d;
    }

    // Ensure numeric ids
    if (payload.publisherId !== undefined)
      payload.publisherId = Number(payload.publisherId);
    if (payload.developerId !== undefined)
      payload.developerId = Number(payload.developerId);

    const created = await createGame(payload);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Conflicto al crear el juego (posible duplicado)" });
    }
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({
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
