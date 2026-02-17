import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { adminOnly } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createGameSchema, updateGameSchema } from './games.schema';
import {
  listGamesCtrl,
  getGameCtrl,
  createGameCtrl,
  updateGameCtrl,
  deleteGameCtrl,
} from './games.controller';

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
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         required: false
 *         description: "Relaciones a incluir (comma-separated). Values: genres, platforms, media, developer, publisher, favorites, cartitems, purchaseitems"
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
 *               sin_relaciones:
 *                 summary: Sin relaciones (por defecto)
 *                 value:
 *                   - id: 1
 *                     title: "The Witcher 3"
 *                     description: "RPG de mundo abierto épico"
 *                     price: 39.99
 *                     salePrice: null
 *                     isOnSale: false
 *                     isRefundable: true
 *                     numberOfSales: 15000
 *                     stockPc: 50
 *                     stockPs5: 30
 *                     stockXboxX: 90
 *                     stockSwitch: 0
 *                     stockPs4: 2
 *                     stockXboxOne: 87
 *                     videoUrl: "https://www.youtube.com/watch?v=example"
 *                     rating: 4.8
 *                     releaseDate: "2015-05-19"
 *               con_generos_y_media:
 *                 summary: Con include=genres,media
 *                 value:
 *                   - id: 1
 *                     title: "The Witcher 3"
 *                     description: "RPG de mundo abierto épico"
 *                     price: 39.99
 *                     salePrice: null
 *                     isOnSale: false
 *                     isRefundable: true
 *                     numberOfSales: 15000
 *                     stockPc: 50
 *                     stockPs5: 30
 *                     stockXboxX: 90
 *                     stockSwitch: 0
 *                     stockPs4: 2
 *                     stockXboxOne: 87
 *                     videoUrl: "https://www.youtube.com/watch?v=example"
 *                     rating: 4.8
 *                     releaseDate: "2015-05-19"
 *                     genres:
 *                       - id: 3
 *                         name: "RPG"
 *                       - id: 14
 *                         name: "Acción-Aventura"
 *                     media:
 *                       - id: 101
 *                         url: "https://cdn.example.com/game1/cover.jpg"
 *                         altText: "Cover art"
 *                         gameId: 1
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', listGamesCtrl);

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
 *                   title: "The Witcher 3"
 *                   description: "RPG de mundo abierto épico"
 *                   price: 39.99
 *                   salePrice: null
 *                   isOnSale: false
 *                   isRefundable: true
 *                   numberOfSales: 15000
 *                   stockPc: 50
 *                   stockPs5: 30
 *                   stockXboxX: 90
 *                   stockSwitch: 0
 *                   stockPs4: 2
 *                   stockXboxOne: 87
 *                   videoUrl: "https://www.youtube.com/watch?v=example"
 *                   rating: 4.8
 *                   releaseDate: "2015-05-19"
 *                   developer:
 *                     id: 1
 *                     name: "CD Projekt Red"
 *                   publisher:
 *                     id: 2
 *                     name: "CD Projekt"
 *                   genres:
 *                     - id: 3
 *                       name: "RPG"
 *                   platforms:
 *                     - id: 1
 *                       name: "PC"
 *                   media:
 *                     - id: 201
 *                       url: "https://res.cloudinary.com/example/image/upload/games/1/cover.jpg"
 *                       publicId: "games/1/cover"
 *                       format: "jpg"
 *                       resourceType: "image"
 *                       bytes: 125340
 *                       width: 1920
 *                       height: 1080
 *                       originalName: "witcher3_cover.jpg"
 *                       folder: "games/1"
 *                       altText: "Game cover"
 *                       gameId: 1
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
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getGameCtrl);

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
 *           examples:
 *             complete:
 *               summary: Ejemplo completo con todos los campos
 *               value:
 *                 title: "Cyberpunk 2077"
 *                 description: "Juego de rol de acción en mundo abierto ambientado en Night City"
 *                 price: 59.99
 *                 isOnSale: true
 *                 salePrice: 29.99
 *                 isRefundable: true
 *                 stockPc: 12
 *                 stockPs5: 89
 *                 stockXboxX: 23
 *                 stockSwitch: 902
 *                 stockPs4: 0
 *                 stockXboxOne: 0
 *                 videoUrl: "https://www.youtube.com/watch?v=8X2kIfS6fb8"
 *                 rating: 4.5
 *                 releaseDate: "2020-12-10"
 *                 publisherId: 2
 *                 developerId: 1
 *                 genres: ["Acción", "RPG"]
 *                 platforms: ["PC", "PlayStation", "Xbox"]
 *             minimal:
 *               summary: Ejemplo mínimo con campos requeridos
 *               value:
 *                 title: "Nuevo Juego"
 *                 price: 49.99
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
router.post('/', auth, validate(createGameSchema), adminOnly, createGameCtrl);

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
  '/:id',
  auth,
  validate(updateGameSchema),
  adminOnly,
  updateGameCtrl,
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
router.delete('/:id', auth, adminOnly, deleteGameCtrl);

export default router;
