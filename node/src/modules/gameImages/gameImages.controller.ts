import type { Request, Response } from "express";
import {
  listGameImages,
  findGameImageById,
  updateGameImageWithFile,
  deleteGameImage,
  uploadGameImage,
} from "./gameImages.service.js";

export async function listGameImagesCtrl(req: Request, res: Response) {
  try {
    const filters: any = {};
    if (req.query.gameId) filters.gameId = Number(req.query.gameId);
    if (req.query.folder) filters.folder = String(req.query.folder);
    if (req.query.format) filters.format = String(req.query.format);
    if (req.query.resourceType)
      filters.resourceType = String(req.query.resourceType);
    const items = await listGameImages(filters);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getGameImageCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const item = await findGameImageById(id);
    if (!item)
      return res.status(404).json({ message: "GameImage no encontrado" });
    // Map relation names to lowercase and remove foreign key
    const response: any = { ...item };
    if (item.Game) {
      response.game = item.Game;
      delete response.Game;
    }
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateGameImageWithFileCtrl(req: Request, res: Response) {
  try {
    // File is optional now
    // if (!req.file) { ... }
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const altText = req.body.altText;
    const newGameId = req.body.gameId ? Number(req.body.gameId) : undefined;

    if (newGameId !== undefined && isNaN(newGameId)) {
      return res.status(400).json({ message: "ID de juego inválido" });
    }

    const updated = await updateGameImageWithFile(
      id,
      req.file,
      altText,
      newGameId
    );
    res.json(updated);
  } catch (err: any) {
    if (err.message === "Image not found") {
      return res.status(404).json({ message: "GameImage no encontrado" });
    }
    if (err.message === "Target game not found") {
      return res.status(404).json({ message: "Juego destino no encontrado" });
    }
    res.status(500).json({ message: err.message });
  }
}

export async function deleteGameImageCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const deleted = await deleteGameImage(id);
    res.json(deleted);
  } catch (err: any) {
    if (err.code === "P2025")
      return res.status(404).json({ message: "GameImage no encontrado" });
    res.status(500).json({ message: err.message });
  }
}

export async function uploadGameImageCtrl(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se proporcionó ningún archivo" });
    }
    const gameId = Number(req.body.gameId);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: "ID de juego inválido" });
    }

    const altText = req.body.altText;
    const media = await uploadGameImage(gameId, req.file, altText);
    res.status(201).json(media);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
