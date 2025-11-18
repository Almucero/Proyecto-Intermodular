import type { Request, Response } from "express";
import {
  listGameImages,
  findGameImageById,
  createGameImage,
  updateGameImage,
  deleteGameImage,
} from "./gameImages.service.js";

export async function listGameImagesCtrl(req: Request, res: Response) {
  try {
    const filters: any = {};
    if (req.query.gameId) filters.gameId = Number(req.query.gameId);
    const items = await listGameImages(filters);
    // Remove gameId from each item in the response
    const response = items.map(({ gameId, ...rest }) => rest);
    res.json(response);
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
    delete response.gameId;
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function createGameImageCtrl(req: Request, res: Response) {
  try {
    const payload = {
      gameId: Number(req.body.gameId),
      url: req.body.url,
      altText: req.body.altText,
    };
    const created = await createGameImage(payload);
    res.status(201).json(created);
  } catch (err: any) {
    if (err.code === "P2002")
      return res.status(409).json({ message: "GameImage duplicada" });
    res.status(500).json({ message: err.message });
  }
}

export async function updateGameImageCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const payload: any = {};
    if (req.body.url) payload.url = req.body.url;
    if (req.body.altText) payload.altText = req.body.altText;
    const updated = await updateGameImage(id, payload);
    res.json(updated);
  } catch (err: any) {
    if (err.code === "P2025")
      return res.status(404).json({ message: "GameImage no encontrado" });
    res.status(500).json({ message: err.message });
  }
}

export async function deleteGameImageCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    await deleteGameImage(id);
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025")
      return res.status(404).json({ message: "GameImage no encontrado" });
    res.status(500).json({ message: err.message });
  }
}
