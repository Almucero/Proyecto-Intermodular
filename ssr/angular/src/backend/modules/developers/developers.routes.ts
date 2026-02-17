import { Router } from "express";
import { auth } from "../../middleware/auth";
import { adminOnly } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import {
  createDeveloperSchema,
  updateDeveloperSchema,
} from "./developers.schema";
import {
  listDevelopersCtrl,
  getDeveloperCtrl,
  createDeveloperCtrl,
  updateDeveloperCtrl,
  deleteDeveloperCtrl,
} from "./developers.controller";

const router = Router();

/**
 * @swagger
 * /api/developers:
 *   get:
 *     summary: Lista todos los desarrolladores
 *     tags: [Developers]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por nombre del desarrollador
 *     responses:
 *       200:
 *         description: Lista de desarrolladores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DevelopersList'
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
router.get("/", listDevelopersCtrl);

/**
 * @swagger
 * /api/developers/{id}:
 *   get:
 *     summary: Obtiene un desarrollador por ID
 *     tags: [Developers]
 *     security: []
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeveloperResponse'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   id: 1
 *                   name: "CD Projekt Red"
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
 *                       stockPs5: 0
 *                       stockXboxX: 0
 *                       stockSwitch: 267
 *                       stockPs4: 12
 *                       stockXboxOne: 9
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
 *         description: Desarrollador no encontrado
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
 *             $ref: '#/components/schemas/CreateDeveloperInput'
 *     responses:
 *       201:
 *         description: Desarrollador creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeveloperResponse'
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
  validate(createDeveloperSchema),
  adminOnly,
  createDeveloperCtrl
);

/**
 * @swagger
 * /api/developers/{id}:
 *   patch:
 *     summary: Actualiza un desarrollador (solo administradores)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDeveloperInput'
 *     responses:
 *       200:
 *         description: Desarrollador actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeveloperResponse'
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
 *         description: Desarrollador no encontrado
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
  validate(updateDeveloperSchema),
  adminOnly,
  updateDeveloperCtrl
);

/**
 * @swagger
 * /api/developers/{id}:
 *   delete:
 *     summary: Elimina un desarrollador (solo administradores)
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
 *       204:
 *         description: Desarrollador eliminado
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
 *         description: Desarrollador no encontrado
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
router.delete("/:id", auth, adminOnly, deleteDeveloperCtrl);

export default router;
