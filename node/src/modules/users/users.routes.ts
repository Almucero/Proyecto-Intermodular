import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { adminOnly } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import {
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "./users.schema.js";
import {
  listUsersCtrl,
  getUserCtrl,
  meCtrl,
  updateUserCtrl,
  deleteUserCtrl,
  updateProfileCtrl,
  changePasswordCtrl,
} from "./users.controller.js";

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos los usuarios (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por email del usuario
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por nombre del usuario
 *       - in: query
 *         name: nickname
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por apodo del usuario
 *       - in: query
 *         name: isAdmin
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filtrar por estado de administrador (true/false)
 *       - in: query
 *         name: minPoints
 *         schema:
 *           type: number
 *         required: false
 *         description: Puntos mínimos (para filtro de rango)
 *       - in: query
 *         name: maxPoints
 *         schema:
 *           type: number
 *         required: false
 *         description: Puntos máximos (para filtro de rango)
 *       - in: query
 *         name: minBalance
 *         schema:
 *           type: number
 *         required: false
 *         description: Saldo mínimo (para filtro de rango)
 *       - in: query
 *         name: maxBalance
 *         schema:
 *           type: number
 *         required: false
 *         description: Saldo máximo (para filtro de rango)
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   - id: 1
 *                     accountId: "21323fdd1234gs"
 *                     accountAt: "@jhon"
 *                     email: "user@gmail.com"
 *                     name: "John"
 *                     surname: "Doe"
 *                     nickname: "johndoe"
 *                     isAdmin: false
 *                     points: 100
 *                     balance: 50.00
 *                     addressLine1: "123 Main St"
 *                     addressLine2: null
 *                     city: "Madrid"
 *                     region: "Madrid"
 *                     postalCode: "28001"
 *                     country: "Spain"
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
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", auth, adminOnly, listUsersCtrl);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
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
 *   patch:
 *     summary: Actualiza el perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *       409:
 *         description: Email ya en uso
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
router.get("/me", auth, meCtrl);
router.patch("/me", auth, validate(updateProfileSchema), updateProfileCtrl);

/**
 * @swagger
 * /api/users/me/password:
 *   patch:
 *     summary: Cambia la contraseña del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Contraseña actual incorrecta o datos inválidos
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
 */
router.patch(
  "/me/password",
  auth,
  validate(changePasswordSchema),
  changePasswordCtrl,
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             examples:
 *               ejemplo:
 *                 value:
 *                   id: 1
 *                   accountId: "21323fdd1234gs"
 *                   accountAt: "@jhon"
 *                   email: "user@gmail.com"
 *                   name: "John"
 *                   surname: "Doe"
 *                   nickname: "johndoe"
 *                   isAdmin: false
 *                   points: 100
 *                   balance: 50.00
 *                   addressLine1: "123 Main St"
 *                   addressLine2: null
 *                   city: "Madrid"
 *                   region: "Madrid"
 *                   postalCode: "28001"
 *                   country: "Spain"
 *                   media:
 *                     - id: 501
 *                       url: "https://res.cloudinary.com/example/image/upload/users/1/avatar.jpg"
 *                       publicId: "users/1/avatar"
 *                       format: "jpg"
 *                       resourceType: "image"
 *                       bytes: 45230
 *                       width: 200
 *                       height: 200
 *                       originalName: "avatar.jpg"
 *                       folder: "users/1"
 *                       altText: "User avatar"
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
 *         description: Usuario no encontrado
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
 *   patch:
 *     summary: Actualiza un usuario por ID (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email ya en uso
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
 *   delete:
 *     summary: Elimina un usuario por ID (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario a eliminar
 *     responses:
 *       204:
 *         description: Usuario eliminado exitosamente
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
 *         description: Usuario no encontrado
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
router.get("/:id", auth, adminOnly, getUserCtrl);
router.patch(
  "/:id",
  auth,
  adminOnly,
  validate(updateUserSchema),
  updateUserCtrl,
);
router.delete("/:id", auth, adminOnly, deleteUserCtrl);

export default router;
