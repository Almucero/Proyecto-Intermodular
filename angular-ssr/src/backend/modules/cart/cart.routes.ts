import { Router } from 'express';
import { auth } from '../../middleware/auth';
import {
  getUserCartCtrl,
  addToCartCtrl,
  removeFromCartCtrl,
  updateCartQuantityCtrl,
  clearCartCtrl,
  createCheckoutSessionCtrl,
  confirmCheckoutSessionCtrl,
} from './cart.controller';

const router = Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Obtener carrito del usuario
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', auth, getUserCartCtrl);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Agregar juego al carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - platformId
 *             properties:
 *               gameId:
 *                 type: integer
 *               platformId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Juego agregado al carrito
 *       400:
 *         description: Datos inválidos
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
router.post('/', auth, addToCartCtrl);

/**
 * @swagger
 * /api/cart/{gameId}:
 *   delete:
 *     summary: Remover juego del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: platformId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la plataforma
 *     responses:
 *       200:
 *         description: Juego removido del carrito
 *       404:
 *         description: Artículo no encontrado
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
router.delete('/:gameId', auth, removeFromCartCtrl);

/**
 * @swagger
 * /api/cart/{gameId}:
 *   patch:
 *     summary: Actualizar cantidad
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - platformId
 *             properties:
 *               quantity:
 *                 type: integer
 *               platformId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Artículo no encontrado
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
router.patch('/:gameId', auth, updateCartQuantityCtrl);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Vaciar carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/', auth, clearCartCtrl);

/**
 * @swagger
 * /api/cart/checkout-session:
 *   post:
 *     summary: Crear sesión de Stripe Checkout para el carrito actual
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos para renderizar Stripe Checkout embebido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *                 publishableKey:
 *                   type: string
 *       400:
 *         description: Carrito vacío o precios inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/checkout-session', auth, createCheckoutSessionCtrl);

/**
 * @swagger
 * /api/cart/checkout/confirm:
 *   post:
 *     summary: Confirmar pago de Stripe y completar compra
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compra registrada, stock descontado y carrito vaciado
 *       400:
 *         description: Sesión inválida/no pagada o sin artículos pendientes
 *       500:
 *         description: Error interno del servidor
 */
router.post('/checkout/confirm', auth, confirmCheckoutSessionCtrl);

export default router;
