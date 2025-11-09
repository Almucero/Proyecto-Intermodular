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
    const created = await createGame(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateGameCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const updated = await updateGame(id, req.body);
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

// Recommendations endpoint removed
