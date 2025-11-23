import multer from "multer";
import { Router } from "express";
import {
  listGameImagesCtrl,
  getGameImageCtrl,
  updateGameImageWithFileCtrl,
  deleteGameImageCtrl,
  uploadGameImageCtrl,
} from "./gameImages.controller.js";
import { auth } from "../../middleware/auth.js";
import { adminOnly } from "../../middleware/authorize.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },
});

/**
 * @swagger
 * /api/game-images:
 *   get:
 *     summary: Lista todas las imágenes de juegos
 *     tags: [GameImages]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar por ID del juego
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por carpeta
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por formato (jpg, png, etc)
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por tipo de recurso
 *     responses:
 *       200:
 *         description: Lista de imágenes de juegos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameImage'
 */
router.get("/", listGameImagesCtrl);

/**
 * @swagger
 * /api/game-images/upload:
 *   post:
 *     summary: Sube una imagen de juego a Cloudinary (solo administradores)
 *     tags: [GameImages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - gameId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen
 *               gameId:
 *                 type: integer
 *                 description: ID del juego
 *                 example: ""
 *               altText:
 *                 type: string
 *                 description: Texto alternativo (opcional)
 *                 example: ""
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameImage'
 */
router.post(
  "/upload",
  auth,
  adminOnly,
  upload.single("file"),
  uploadGameImageCtrl
);

/**
 * @swagger
 * /api/game-images/{id}:
 *   get:
 *     summary: Obtiene una imagen de juego por ID
 *     tags: [GameImages]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Información de la imagen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameImageDetail'
 *       404:
 *         description: Imagen no encontrada
 */
router.get("/:id", getGameImageCtrl);

/**
 * @swagger
 * /api/game-images/{id}/upload:
 *   put:
 *     summary: Actualiza una imagen de juego (solo administradores)
 *     tags: [GameImages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la imagen
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo de imagen (opcional)
 *               altText:
 *                 type: string
 *                 description: Texto alternativo (opcional)
 *                 example: ""
 *               gameId:
 *                 type: integer
 *                 description: Cambiar juego (opcional, mueve a carpeta del nuevo juego)
 *                 example: ""
 *     responses:
 *       200:
 *         description: Imagen actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameImage'
 *       404:
 *         description: Imagen no encontrada
 */
router.put(
  "/:id/upload",
  auth,
  adminOnly,
  upload.single("file"),
  updateGameImageWithFileCtrl
);

/**
 * @swagger
 * /api/game-images/{id}:
 *   delete:
 *     summary: Elimina una imagen de juego (solo administradores)
 *     tags: [GameImages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameImageDetail'
 *       404:
 *         description: Imagen no encontrada
 */
router.delete("/:id", auth, adminOnly, deleteGameImageCtrl);

export default router;
