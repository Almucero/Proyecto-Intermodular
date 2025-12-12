import { Router } from "express";
import { chatCtrl } from "./chat.controller.js";

const router = Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat con la IA (Streaming)
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant, system]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Stream de respuesta de la IA
 */
router.post("/", chatCtrl);

export default router;
