import multer from 'multer';
import { Router } from 'express';
import {
  listMediaCtrl,
  getMediaCtrl,
  updateMediaCtrl,
  deleteMediaCtrl,
  uploadMediaCtrl,
} from './media.controller';
import { auth } from '../../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/x-ms-bmp',
      'image/tiff',
      'image/svg+xml',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

/**
 * @swagger
 * /api/media:
 *   get:
 *     summary: Lista todos los archivos multimedia
 *     tags: [Media]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [user, game]
 *         required: false
 *         description: Tipo de entidad (user o game)
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
 *       - in: query
 *         name: publicId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por ID público de Cloudinary
 *       - in: query
 *         name: bytes
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar por tamaño en bytes
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar por ancho
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtrar por alto
 *       - in: query
 *         name: originalName
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por nombre original
 *       - in: query
 *         name: altText
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por texto alternativo
 *     responses:
 *       200:
 *         description: Lista de archivos multimedia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Media'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', listMediaCtrl);

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Sube un archivo multimedia a Cloudinary
 *     description: Admins pueden subir media de juegos y users. Usuarios autenticados pueden subir media para su propio perfil.
 *     tags: [Media]
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
 *               - type
 *               - id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen
 *               type:
 *                 type: string
 *                 enum: [user, game]
 *                 description: Tipo de entidad (user o game). Para game, requiere ser admin. Para user, solo puedes subir para tu propio perfil.
 *               id:
 *                 type: integer
 *                 description: ID de la entidad (usuario o juego). Para user, debe ser tu ID.
 *               altText:
 *                 type: string
 *                 description: Texto alternativo (opcional)
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       403:
 *         description: No tienes permiso para subir este tipo de media
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
router.post('/upload', auth, upload.single('file'), uploadMediaCtrl);

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     summary: Obtiene un archivo multimedia por ID
 *     tags: [Media]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del archivo
 *     responses:
 *       200:
 *         description: Información del archivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaDetail'
 *       404:
 *         description: Archivo no encontrado
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
router.get('/:id', getMediaCtrl);

/**
 * @swagger
 * /api/media/{id}/upload:
 *   put:
 *     summary: Actualiza un archivo multimedia
 *     description: Admins pueden editar media de juegos y users. Usuarios pueden editar solo su propia media.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del archivo
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
 *                 description: Nuevo archivo (opcional)
 *               altText:
 *                 type: string
 *                 description: Texto alternativo (opcional)
 *               type:
 *                 type: string
 *                 enum: [user, game]
 *                 description: Cambiar tipo de entidad (opcional, solo para admins)
 *               id:
 *                 type: integer
 *                 description: Cambiar ID de entidad (opcional, solo para admins)
 *     responses:
 *       200:
 *         description: Archivo actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       403:
 *         description: No tienes permiso para editar este archivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Archivo no encontrado
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
router.put('/:id/upload', auth, upload.single('file'), updateMediaCtrl);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     summary: Elimina un archivo multimedia
 *     description: Admins pueden eliminar media de juegos y users. Usuarios pueden eliminar solo su propia media.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del archivo
 *     responses:
 *       200:
 *         description: Archivo eliminado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaDetail'
 *       403:
 *         description: No tienes permiso para eliminar este archivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Archivo no encontrado
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
router.delete('/:id', auth, deleteMediaCtrl);

export default router;
