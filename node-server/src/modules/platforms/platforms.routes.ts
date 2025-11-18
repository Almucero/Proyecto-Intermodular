import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import {
  createPlatformSchema,
  updatePlatformSchema,
} from "./platforms.schema.js";
import {
  listPlatformsCtrl,
  getPlatformCtrl,
  createPlatformCtrl,
  updatePlatformCtrl,
  deletePlatformCtrl,
} from "./platforms.controller.js";
import { auth } from "../../middleware/auth.js";
import { adminOnly } from "../../middleware/authorize.js";

const router = Router();

/**
 * @swagger
 * /api/platforms:
 *   get:
 *     summary: Lista todas las plataformas
 *     tags: [Platforms]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por nombre de la plataforma
 *     responses:
 *       200:
 *         description: Lista de plataformas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Platform'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   - id: 1
 *                     name: "string"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", listPlatformsCtrl);

/**
 * @swagger
 * /api/platforms/{id}:
 *   get:
 *     summary: Obtiene una plataforma por ID
 *     tags: [Platforms]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la plataforma
 *     responses:
 *       200:
 *         description: Información de la plataforma con sus juegos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlatformDetail'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   id: 1
 *                   name: "string"
 *                   games:
 *                     - id: 1
 *                       title: "string"
 *                       description: "string"
 *                       price: 0
 *                       salePrice: null
 *                       isOnSale: false
 *                       isRefundable: false
 *                       numberOfSales: 0
 *                       rating: null
 *                       releaseDate: "2025-11-17"
 *       404:
 *         description: Plataforma no encontrada
 */
router.get("/:id", getPlatformCtrl);

/**
 * @swagger
 * /api/platforms:
 *   post:
 *     summary: Crea una nueva plataforma (solo administradores)
 *     tags: [Platforms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlatformInput'
 *     responses:
 *       201:
 *         description: Plataforma creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Platform'
 *       403:
 *         description: Acceso denegado (solo administradores)
 */
router.post(
  "/",
  auth,
  adminOnly,
  validate(createPlatformSchema),
  createPlatformCtrl
);

/**
 * @swagger
 * /api/platforms/{id}:
 *   patch:
 *     summary: Actualiza una plataforma (solo administradores)
 *     tags: [Platforms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la plataforma
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePlatformInput'
 *     responses:
 *       200:
 *         description: Plataforma actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Platform'
 *       404:
 *         description: Plataforma no encontrada
 */
router.patch(
  "/:id",
  auth,
  adminOnly,
  validate(updatePlatformSchema),
  updatePlatformCtrl
);

/**
 * @swagger
 * /api/platforms/{id}:
 *   delete:
 *     summary: Elimina una plataforma (solo administradores)
 *     tags: [Platforms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la plataforma
 *     responses:
 *       204:
 *         description: Plataforma eliminada
 *       404:
 *         description: Plataforma no encontrada
 */
router.delete("/:id", auth, adminOnly, deletePlatformCtrl);

export default router;
