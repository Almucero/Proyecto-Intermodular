import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { createGenreSchema, updateGenreSchema } from "./genres.schema.js";
import {
  listGenresCtrl,
  getGenreCtrl,
  createGenreCtrl,
  updateGenreCtrl,
  deleteGenreCtrl,
} from "./genres.controller.js";
import { auth } from "../../middleware/auth.js";
import { adminOnly } from "../../middleware/authorize.js";

const router = Router();

/**
 * @swagger
 * /api/genres:
 *   get:
 *     summary: Lista todos los géneros
 *     tags: [Genres]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por nombre del género
 *     responses:
 *       200:
 *         description: Lista de géneros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Genre'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   - id: 1
 *                     name: "string"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", listGenresCtrl);

/**
 * @swagger
 * /api/genres/{id}:
 *   get:
 *     summary: Obtiene un género por ID
 *     tags: [Genres]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del género
 *     responses:
 *       200:
 *         description: Información del género con sus juegos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenreDetail'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   id: 3
 *                   name: "RPG"
 *                   games:
 *                     - id: 1
 *                       title: "The Witcher 3"
 *                       description: "RPG de mundo abierto épico"
 *                       price: 39.99
 *                       salePrice: null
 *                       isOnSale: false
 *                       isRefundable: true
 *                       numberOfSales: 15000
 *                       stock: 50
 *                       videoUrl: "https://www.youtube.com/watch?v=example"
 *                       rating: 4.8
 *                       releaseDate: "2015-05-19"
 *       404:
 *         description: Género no encontrado
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
router.get("/:id", getGenreCtrl);

/**
 * @swagger
 * /api/genres:
 *   post:
 *     summary: Crea un nuevo género (solo administradores)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGenreInput'
 *     responses:
 *       201:
 *         description: Género creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genre'
 *       403:
 *         description: Acceso denegado (solo administradores)
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
router.post("/", auth, adminOnly, validate(createGenreSchema), createGenreCtrl);

/**
 * @swagger
 * /api/genres/{id}:
 *   patch:
 *     summary: Actualiza un género (solo administradores)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del género
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGenreInput'
 *     responses:
 *       200:
 *         description: Género actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genre'
 *       404:
 *         description: Género no encontrado
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
  adminOnly,
  validate(updateGenreSchema),
  updateGenreCtrl
);

/**
 * @swagger
 * /api/genres/{id}:
 *   delete:
 *     summary: Elimina un género (solo administradores)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del género
 *     responses:
 *       204:
 *         description: Género eliminado
 *       404:
 *         description: Género no encontrado
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
router.delete("/:id", auth, adminOnly, deleteGenreCtrl);

export default router;
