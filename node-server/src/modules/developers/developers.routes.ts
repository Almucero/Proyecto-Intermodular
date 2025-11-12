import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { adminOnly } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import {
  createDeveloperSchema,
  updateDeveloperSchema,
} from "./developers.schema.js";
import {
  listDevelopersCtrl,
  getDeveloperCtrl,
  createDeveloperCtrl,
  updateDeveloperCtrl,
  deleteDeveloperCtrl,
} from "./developers.controller.js";

const router = Router();

router.use(auth);

/**
 * @swagger
 * /api/developers:
 *   get:
 *     summary: Lista todos los desarrolladores
 *     tags: [Developers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de desarrolladores
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
router.get("/", listDevelopersCtrl);

/**
 * @swagger
 * /api/developers/{id}:
 *   get:
 *     summary: Obtiene un desarrollador por ID
 *     tags: [Developers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del desarrollador
 *     responses:
 *       200:
 *         description: Información del desarrollador
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Desarrollador no encontrado
 */
router.get("/:id", getDeveloperCtrl);

/**
 * @swagger
 * /api/developers:
 *   post:
 *     summary: Crea un nuevo desarrollador (solo administradores)
 *     tags: [Developers]
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
 *         description: Desarrollador creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post(
  "/",
  validate(createDeveloperSchema),
  /*adminOnly,*/
  createDeveloperCtrl
);

router.patch(
  "/:id",
  validate(updateDeveloperSchema),
  adminOnly,
  updateDeveloperCtrl
);
router.delete("/:id", adminOnly, deleteDeveloperCtrl);

export default router;
