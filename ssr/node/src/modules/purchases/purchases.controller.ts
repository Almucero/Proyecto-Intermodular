import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  completePurchase,
  getUserPurchases,
  getPurchase,
  refundPurchase,
} from "./purchases.service.js";
import { logger } from "../../utils/logger.js";
import { error } from "console";

const checkoutSchema = z.object({
  cartItemIds: z
    .array(z.coerce.number().int().positive())
    .min(1, "Al menos un juego es requerido"),
});

const refundSchema = z.object({
  reason: z
    .string()
    .min(5, "La razón debe tener al menos 5 caracteres")
    .max(500),
});

const purchaseIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

const statusQuerySchema = z.object({
  status: z.enum(["completed", "refunded"]).optional(),
});

export async function checkoutCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const bodyParsed = checkoutSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }

    const { cartItemIds } = bodyParsed.data;

    const purchase = await completePurchase(user.sub, cartItemIds);

    logger.info(
      `User ${user.sub} completed purchase with items: ${cartItemIds.join(
        ", "
      )}`
    );
    res.status(201).json(purchase);
  } catch (error: any) {
    if (
      error.message === "Algunos artículos del carrito no fueron encontrados"
    ) {
      return res.status(404).json({ message: error.message });
    }
    logger.error("Error in checkoutCtrl:", error);
    return res.status(400).json({ message: error.message });
  }
}

export async function getUserPurchasesCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const queryParsed = statusQuerySchema.safeParse(req.query);

    if (!queryParsed.success) {
      return res.status(400).json({
        message: "Parámetros de consulta inválidos",
        errors: queryParsed.error.issues,
      });
    }

    const purchases = await getUserPurchases(user.sub, queryParsed.data.status);
    res.json(purchases);
  } catch (error: any) {
    logger.error("Error in getUserPurchasesCtrl:", error);
    res.status(500).json({ message: "Error al obtener compras" });
  }
}

export async function getPurchaseCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const paramsParsed = purchaseIdSchema.safeParse({ id: req.params.id });

    if (!paramsParsed.success) {
      return res.status(400).json({
        message: "ID inválido",
        errors: paramsParsed.error.issues,
      });
    }

    const purchase = await getPurchase(user.sub, paramsParsed.data.id);
    res.json(purchase);
  } catch (error: any) {
    if (error.message === "Compra no encontrada") {
      return res.status(404).json({ message: error.message });
    }
    logger.error("Error in getPurchaseCtrl:", error);
    res.status(500).json({ message: "Error al obtener la compra" });
  }
}

export async function refundPurchaseCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const paramsParsed = purchaseIdSchema.safeParse({ id: req.params.id });
    const bodyParsed = refundSchema.safeParse(req.body);

    if (!paramsParsed.success) {
      return res.status(400).json({
        message: "ID inválido",
        errors: paramsParsed.error.issues,
      });
    }

    if (!bodyParsed.success) {
      return res.status(400).json({
        message: "Datos de entrada inválidos",
        errors: bodyParsed.error.issues,
      });
    }

    const purchase = await refundPurchase(
      user.sub,
      paramsParsed.data.id,
      bodyParsed.data.reason
    );
    res.json(purchase);
  } catch (error: any) {
    if (error.message === "Compra no encontrada") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Esta compra ya ha sido reembolsada") {
      return res.status(400).json({ message: error.message });
    }
    logger.error("Error in refundPurchaseCtrl:", error);
    res.status(500).json({ message: "Error al procesar el reembolso" });
  }
}
