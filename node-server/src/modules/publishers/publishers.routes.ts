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

router.use(auth);

/**
 * @swagger
 * /api/publishers:
 *   get:
 *     summary: Lista todos los publishers
 *     tags: [Publishers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de publishers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/", listPublishersCtrl);

/**
 * @swagger
 * /api/publishers/{id}:
 *   get:
 *     summary: Obtiene un publisher por ID
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
 *       200:
 *         description: Información del publisher
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Publisher no encontrado
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
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Publisher creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post(
  "/",
  validate(createPublisherSchema),
  adminOnly,
  createPublisherCtrl
);
router.patch(
  "/:id",
  validate(updatePublisherSchema),
  adminOnly,
  updatePublisherCtrl
);
router.delete("/:id", adminOnly, deletePublisherCtrl);

export default router;
