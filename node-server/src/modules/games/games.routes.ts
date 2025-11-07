import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createGameSchema, updateGameSchema } from './games.schema.js';
import { listGamesCtrl, getGameCtrl, createGameCtrl, updateGameCtrl, deleteGameCtrl } from './games.controller.js';

const router = Router();
router.use(auth);

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Lista todos los juegos
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de juegos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', listGamesCtrl);

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Obtiene un juego por ID
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del juego
 *     responses:
 *       200:
 *         description: Información del juego
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Juego no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getGameCtrl);

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Crea un nuevo juego (solo administradores)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGameInput'
 *     responses:
 *       201:
 *         description: Juego creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.post('/', validate(createGameSchema), adminOnly, createGameCtrl);

/**
 * @swagger
 * /api/games/{id}:
 *   patch:
 *     summary: Actualiza un juego por ID (solo administradores)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del juego a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGameInput'
 *     responses:
 *       200:
 *         description: Juego actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       400:
 *         description: ID inválido o datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Juego no encontrado
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.patch('/:id', validate(updateGameSchema), adminOnly, updateGameCtrl);

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     summary: Elimina un juego por ID (solo administradores)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del juego a eliminar
 *     responses:
 *       204:
 *         description: Juego eliminado exitosamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado (solo administradores)
 *       404:
 *         description: Juego no encontrado
 */
router.delete('/:id', adminOnly, deleteGameCtrl);
