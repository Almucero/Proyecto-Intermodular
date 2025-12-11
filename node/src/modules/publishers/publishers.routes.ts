import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { adminOnly } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import {
  createPublisherSchema,
  updatePublisherSchema,
} from "./publishers.schema.js";
import {
  listPublishersCtrl,
  getPublisherCtrl,
  createPublisherCtrl,
  updatePublisherCtrl,
  deletePublisherCtrl,
} from "./publishers.controller.js";

const router = Router();

/**
 * @swagger
 * /api/publishers:
 *   get:
 *     summary: Lista todos los publishers
 *     tags: [Publishers]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por nombre del publisher
 *     responses:
 *       200:
 *         description: Lista de publishers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublishersList'
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
router.get("/", listPublishersCtrl);

/**
 * @swagger
 * /api/publishers/{id}:
 *   get:
 *     summary: Obtiene un publisher por ID
 *     tags: [Publishers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del publisher
 *     responses:
 *       200:
 *         description: Información del publisher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublisherResponse'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   id: 2
 *                   name: "CD Projekt"
 *                   games:
 *                     - id: 1
 *                       title: "The Witcher 3"
 *                       description: "RPG de mundo abierto épico"
 *                       price: 39.99
 *                       salePrice: null
 *                       isOnSale: false
 *                       isRefundable: true
 *                       numberOfSales: 15000
 *                       stockPc: 50
 *                       stockPs5: 30
 *                       stockXboxX: 90
 *                       stockSwitch: 0
 *                       stockPs4: 2
 *                       stockXboxOne: 87
 *                       videoUrl: "https://www.youtube.com/watch?v=example"
 *                       rating: 4.8
 *                       releaseDate: "2015-05-19"
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Publisher no encontrado
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
router.get("/:id", getPublisherCtrl);

/**
 * @swagger
 * /api/publishers:
 *   post:
 *     summary: Crea un nuevo publisher (solo administradores)
 *     tags: [Publishers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePublisherInput'
 *     responses:
 *       201:
 *         description: Publisher creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublisherResponse'
 *       400:
 *         description: Datos inválidos
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
 *         description: Nombre ya en uso
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
router.post(
  "/",
  auth,
  validate(createPublisherSchema),
  adminOnly,
  createPublisherCtrl
);

/**
 * @swagger
 * /api/publishers/{id}:
 *   patch:
 *     summary: Actualiza un publisher (solo administradores)
 *     tags: [Publishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del publisher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePublisherInput'
 *     responses:
 *       200:
 *         description: Publisher actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublisherResponse'
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
 *         description: Publisher no encontrado
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
  validate(updatePublisherSchema),
  adminOnly,
  updatePublisherCtrl
);

/**
 * @swagger
 * /api/publishers/{id}:
 *   delete:
 *     summary: Elimina un publisher (solo administradores)
 *     tags: [Publishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del publisher
 *     responses:
 *       204:
 *         description: Publisher eliminado
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
 *         description: Publisher no encontrado
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
router.delete("/:id", auth, adminOnly, deletePublisherCtrl);

export default router;
