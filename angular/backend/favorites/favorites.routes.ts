import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import {
  getUserFavoritesCtrl,
  addToFavoritesCtrl,
  removeFromFavoritesCtrl,
  isFavoriteCtrl,
} from "./favorites.controller.js";

const router = Router();

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Obtener favoritos del usuario
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de favoritos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", auth, getUserFavoritesCtrl);

/**
 * @swagger
 * /api/favorites/{gameId}:
 *   post:
 *     summary: Agregar juego a favoritos
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       201:
 *         description: Juego agregado a favoritos
 *       404:
 *         description: Juego no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El juego ya está en favoritos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:gameId", auth, addToFavoritesCtrl);

/**
 * @swagger
 * /api/favorites/{gameId}:
 *   delete:
 *     summary: Remover juego de favoritos
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Juego removido de favoritos
 *       404:
 *         description: Favorito no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:gameId", auth, removeFromFavoritesCtrl);

/**
 * @swagger
 * /api/favorites/check/{gameId}:
 *   get:
 *     summary: Verificar si un juego está en favoritos
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Estado del favorito
 *       404:
 *         description: Favorito no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/check/:gameId", auth, isFavoriteCtrl);

export default router;
