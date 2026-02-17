import type { Request, Response } from "express";
import {
  listPublishers,
  findPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
} from "./publishers.service";

export async function listPublishersCtrl(req: Request, res: Response) {
  try {
    const filters: any = {};
    if (req.query.name) filters.name = req.query.name as string;
    const items = await listPublishers(filters);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getPublisherCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const item = await findPublisherById(id);
    if (!item)
      return res.status(404).json({ message: "Publisher no encontrado" });

    const response: any = { ...item };
    if (item.Game) {
      response.games = item.Game;
      delete response.Game;
    }
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createPublisherCtrl(req: Request, res: Response) {
  try {
    const created = await createPublisher(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(409).json({ message: "Nombre ya en uso" });
    res.status(500).json({ message: error.message });
  }
}

export async function updatePublisherCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const updated = await updatePublisher(id, req.body);
    res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Publisher no encontrado" });
    res.status(500).json({ message: error.message });
  }
}

export async function deletePublisherCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    await deletePublisher(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Publisher no encontrado" });
    res.status(500).json({ message: error.message });
  }
}
