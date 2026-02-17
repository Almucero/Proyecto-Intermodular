import type { Request, Response } from "express";
import {
  listMedia,
  findMediaById,
  updateMedia,
  deleteMedia,
  uploadMedia,
} from "./media.service";

export async function listMediaCtrl(req: Request, res: Response) {
  try {
    const filters: any = {};
    if (req.query.type)
      filters.type = String(req.query.type) as "user" | "game";
    if (req.query.id) filters.id = Number(req.query.id);
    if (req.query.folder) filters.folder = String(req.query.folder);
    if (req.query.format) filters.format = String(req.query.format);
    if (req.query.resourceType)
      filters.resourceType = String(req.query.resourceType);
    const items = await listMedia(filters);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMediaCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const item = await findMediaById(id);
    if (!item) return res.status(404).json({ message: "Media no encontrado" });

    const response: any = { ...item };

    if (item.gameId !== null) {
      delete response.userId;
    } else if (item.userId !== null) {
      delete response.gameId;
    }

    if (item.Game) {
      response.game = item.Game;
      delete response.Game;
    }
    if (item.User) {
      response.user = item.User;
      delete response.User;
    }
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateMediaCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const media = await findMediaById(id);
    if (!media) {
      return res.status(404).json({ message: "Media no encontrado" });
    }

    const isAdmin = req.user?.isAdmin === true;
    if (media.gameId !== null) {
      if (!isAdmin) {
        return res.status(403).json({
          message: "Solo administradores pueden editar media de juegos",
        });
      }
    } else if (media.userId !== null) {
      if (req.user?.sub !== media.userId && !isAdmin) {
        return res
          .status(403)
          .json({ message: "Solo puedes editar tu propia media" });
      }
    }

    const altText = req.body.altText === "" ? undefined : req.body.altText;
    const newType = req.body.type as "user" | "game" | undefined;
    const newId = req.body.id ? Number(req.body.id) : undefined;

    if (newId !== undefined && isNaN(newId)) {
      return res.status(400).json({ message: "ID de destino inválido" });
    }

    const updated = await updateMedia(id, req.file, altText, newType, newId);

    const response: any = { ...updated };
    if (updated.gameId !== null) {
      delete response.userId;
    } else if (updated.userId !== null) {
      delete response.gameId;
    }

    res.json(response);
  } catch (err: any) {
    if (err.message === "Media not found") {
      return res.status(404).json({ message: "Media no encontrado" });
    }
    if (
      err.message === "Target game not found" ||
      err.message === "Target user not found"
    ) {
      return res.status(404).json({ message: "Destino no encontrado" });
    }
    res.status(500).json({ message: err.message });
  }
}

export async function deleteMediaCtrl(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const media = await findMediaById(id);
    if (!media) {
      return res.status(404).json({ message: "Media no encontrado" });
    }

    const isAdmin = req.user?.isAdmin === true;
    if (media.gameId !== null) {
      if (!isAdmin) {
        return res.status(403).json({
          message: "Solo administradores pueden eliminar media de juegos",
        });
      }
    } else if (media.userId !== null) {
      if (req.user?.sub !== media.userId && !isAdmin) {
        return res
          .status(403)
          .json({ message: "Solo puedes eliminar tu propia media" });
      }
    }

    const deleted = await deleteMedia(id);

    const response: any = { ...deleted };
    if (deleted.gameId !== null) {
      delete response.userId;
    } else if (deleted.userId !== null) {
      delete response.gameId;
    }

    res.json(response);
  } catch (err: any) {
    if (err.code === "P2025" || err.message === "Media not found")
      return res.status(404).json({ message: "Media no encontrado" });
    res.status(500).json({ message: err.message });
  }
}

export async function uploadMediaCtrl(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se proporcionó ningún archivo" });
    }
    const type = req.body.type as "user" | "game";
    const id = Number(req.body.id);

    if (!type || !["user", "game"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Tipo de media inválido (user o game)" });
    }
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const isAdmin = req.user?.isAdmin === true;
    if (type === "game") {
      if (!isAdmin) {
        return res.status(403).json({
          message: "Solo administradores pueden subir media de juegos",
        });
      }
    } else if (type === "user") {
      if (req.user?.sub !== id && !isAdmin) {
        return res
          .status(403)
          .json({ message: "Solo puedes subir media para tu propio perfil" });
      }
    }

    const altText = req.body.altText;
    const media = await uploadMedia(type, id, req.file, altText);

    const response: any = { ...media };
    if (media.gameId !== null) {
      delete response.userId;
    } else if (media.userId !== null) {
      delete response.gameId;
    }

    res.status(201).json(response);
  } catch (err: any) {
    if (err.message === "Game not found" || err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
}
