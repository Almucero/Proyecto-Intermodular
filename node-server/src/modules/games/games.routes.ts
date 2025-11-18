import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { adminOnly } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createGameSchema, updateGameSchema } from "./games.schema.js";
import {
  listGamesCtrl,
  getGameCtrl,
  createGameCtrl,
  updateGameCtrl,
  deleteGameCtrl,
} from "./games.controller.js";

const router = Router();

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Lista todos los juegos
 *     tags: [Games]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por título del juego
 *       - in: query
 *         name: price
 *         schema:
 *           type: number
 *         required: false
 *         description: Filtrar por precio exacto del juego
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         required: false
 *         description: Precio mínimo (para filtro de rango)
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         required: false
 *         description: Precio máximo (para filtro de rango)
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por nombre de género
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por nombre de plataforma
 *       - in: query
 *         name: isOnSale
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filtrar por si el juego está en oferta
 *     responses:
 *       200:
 *         description: Lista de juegos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   - id: 1
 *                     title: "string"
 *                     description: "string"
 *                     price: 0
 *                     salePrice: null
 *                     isOnSale: false
 *                     isRefundable: false
 *                     numberOfSales: 0
 *                     rating: null
 *                     releaseDate: "2025-11-17"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", listGamesCtrl);

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Obtiene un juego por ID
 *     tags: [Games]
 *     security: []
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
 *             examples:
 *               ejemplo:
 *                 value:
 *                   id: 1
 *                   title: "string"
 *                   description: "string"
 *                   price: 0
 *                   salePrice: null
 *                   isOnSale: false
 *                   isRefundable: false
 *                   numberOfSales: 0
 *                   rating: null
 *                   releaseDate: "2025-11-17"
 *                   developer:
 *                     id: 1
 *                     name: "string"
 *                   publisher:
 *                     id: 2
 *                     name: "string"
 *                   genres:
 *                     - id: 5
 *                       name: "string"
 *                   platforms:
 *                     - id: 3
 *                       name: "string"
 *                   images:
 *                     - id: 201
 *                       url: "string"
 *                       altText: "string"
 *                       order: 1
 *       400:
 *         description: ID inválido
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
router.get("/:id", getGameCtrl);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado (solo administradores)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflicto (por ejemplo, título duplicado)
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
router.post("/", auth, validate(createGameSchema), adminOnly, createGameCtrl);

/**
 * @swagger
 * /api/games/{id}:
 *   patch:
 *     summary: Actualiza un juego (solo administradores)
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
 *       403:
 *         description: Acceso denegado (solo administradores)
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
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/:id",
  auth,
  validate(updateGameSchema),
  adminOnly,
  updateGameCtrl
);

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     summary: Elimina un juego (solo administradores)
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
 *       204:
 *         description: Juego eliminado
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
 *       403:
 *         description: Acceso denegado (solo administradores)
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
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", auth, adminOnly, deleteGameCtrl);

export default router;
