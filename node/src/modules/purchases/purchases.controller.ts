import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { checkoutSchema, refundSchema } from "./purchases.schema.js";
import * as purchasesService from "./purchases.service.js";
import { logger } from "../../utils/logger.js";

const purchaseIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive("ID de compra debe ser un número positivo"),
});

export async function checkoutCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const parsed = checkoutSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { gameIds } = parsed.data;

    const purchases = await purchasesService.completePurchase(
      user.sub,
      gameIds
    );

    logger.info(
      `User ${user.sub} completed purchase for ${gameIds.length} games`
    );
    res.status(201).json({
      message: "Compra completada exitosamente",
      purchases,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/purchases
 * Obtener todas las compras del usuario
 */
export async function getUserPurchasesCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;

    const purchases = await purchasesService.getUserPurchases(user.sub);

    res.status(200).json(purchases);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/purchases/:id
 * Obtener detalles de una compra
 */
export async function getPurchaseCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const parsed = purchaseIdSchema.safeParse({ id: req.params.id });

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { id: purchaseId } = parsed.data;

    const purchase = await purchasesService.getPurchase(user.sub, purchaseId);

    res.status(200).json(purchase);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/purchases/:id/refund
 * Solicitar reembolso
 */
export async function refundPurchaseCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const idParsed = purchaseIdSchema.safeParse({ id: req.params.id });
    const bodyParsed = refundSchema.safeParse(req.body);

    if (!idParsed.success) {
      return res.status(400).json({ errors: idParsed.error.flatten() });
    }

    if (!bodyParsed.success) {
      return res.status(400).json({ errors: bodyParsed.error.flatten() });
    }

    const { id: purchaseId } = idParsed.data;
    const { reason } = bodyParsed.data;

    const purchase = await purchasesService.refundPurchase(
      user.sub,
      purchaseId,
      reason
    );

    logger.info(`User ${user.sub} requested refund for purchase ${purchaseId}`);
    res.status(200).json({
      message: "Reembolso solicitado",
      purchase,
    });
  } catch (error) {
    next(error);
  }
}
