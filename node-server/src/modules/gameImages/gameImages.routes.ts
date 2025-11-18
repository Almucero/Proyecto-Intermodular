import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import {
  createGameImageSchema,
  updateGameImageSchema,
} from "./gameImages.schema.js";
import {
  listGameImagesCtrl,
  getGameImageCtrl,
  createGameImageCtrl,
  updateGameImageCtrl,
  deleteGameImageCtrl,
} from "./gameImages.controller.js";
import { auth } from "../../middleware/auth.js";
import { adminOnly } from "../../middleware/authorize.js";

const router = Router();

/**
 * @swagger
 * /api/game-images:
 *   get:
 *     summary: Lista todas las imágenes de juegos
 *     tags: [GameImages]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar por ID del juego
 *     responses:
 *       200:
 *         description: Lista de imágenes de juegos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameImage'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   - id: 1
 *                     url: "string"
 *                     altText: "string"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", listGameImagesCtrl);

/**
 * @swagger
 * /api/game-images/{id}:
 *   get:
 *     summary: Obtiene una imagen de juego por ID
 *     tags: [GameImages]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Información de la imagen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameImage'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   id: 1
 *                   url: "string"
 *                   altText: "string"
 *                   gameId: 1
 *                   game:
 *                     id: 1
 *                     title: "string"
 *                     description: "string"
 *                     price: 0
 *                     salePrice: null
 *                     isOnSale: false
 *                     isRefundable: false
 *                     numberOfSales: 0
 *                     rating: null
 *                     releaseDate: "2025-11-17"
 *       404:
 *         description: Imagen no encontrada
 */
router.get("/:id", getGameImageCtrl);

/**
 * @swagger
 * /api/game-images:
 *   post:
 *     summary: Crea una nueva imagen de juego (solo administradores)
 *     tags: [GameImages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGameImageInput'
 *     responses:
 *       201:
 *         description: Imagen creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameImage'
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.post(
  "/",
  auth,
  adminOnly,
  validate(createGameImageSchema),
  createGameImageCtrl
);

/**
 * @swagger
 * /api/game-images/{id}:
 *   patch:
 *     summary: Actualiza una imagen de juego (solo administradores)
 *     tags: [GameImages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la imagen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGameImageInput'
 *     responses:
 *       200:
 *         description: Imagen actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameImage'
 *       404:
 *         description: Imagen no encontrada
 */
router.patch(
  "/:id",
  auth,
  adminOnly,
  validate(updateGameImageSchema),
  updateGameImageCtrl
);

/**
 * @swagger
 * /api/game-images/{id}:
 *   delete:
 *     summary: Elimina una imagen de juego (solo administradores)
 *     tags: [GameImages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la imagen
 *     responses:
 *       204:
 *         description: Imagen eliminada
 *       404:
 *         description: Imagen no encontrada
 */
router.delete("/:id", auth, adminOnly, deleteGameImageCtrl);

export default router;
