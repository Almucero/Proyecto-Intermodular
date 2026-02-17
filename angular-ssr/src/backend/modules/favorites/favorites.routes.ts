import { Router } from 'express';
import { auth } from '../../middleware/auth';
import {
  getUserFavoritesCtrl,
  addToFavoritesCtrl,
  removeFromFavoritesCtrl,
  isFavoriteCtrl,
} from './favorites.controller';

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
router.get('/', auth, getUserFavoritesCtrl);

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Agregar juego a favoritos
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - platformId
 *             properties:
 *               gameId:
 *                 type: integer
 *               platformId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Juego agregado a favoritos
 *       404:
 *         description: Juego o plataforma no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El juego ya está en favoritos para esta plataforma
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
router.post('/', auth, addToFavoritesCtrl);

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
 *       - in: query
 *         name: platformId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la plataforma
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
router.delete('/:gameId', auth, removeFromFavoritesCtrl);

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
 *       - in: query
 *         name: platformId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la plataforma
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
router.get('/check/:gameId', auth, isFavoriteCtrl);

export default router;
