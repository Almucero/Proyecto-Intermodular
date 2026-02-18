import { Router } from 'express';
import { auth } from '../../middleware/auth';
import {
  chatCtrl,
  listSessionsCtrl,
  getSessionCtrl,
  deleteSessionCtrl,
} from './chat.controller';

const router = Router();

/**
 * @swagger
 * /api/chat/sessions:
 *   get:
 *     summary: Listar sesiones de chat del usuario
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sesiones de chat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Busco juegos de terror"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:35:00Z"
 *                   _count:
 *                     type: object
 *                     properties:
 *                       messages:
 *                         type: integer
 *                         example: 4
 *             example:
 *               - id: 1
 *                 title: "Busco juegos de terror"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-15T10:35:00Z"
 *                 _count:
 *                   messages: 4
 *               - id: 2
 *                 title: "Recomendaciones RPG"
 *                 createdAt: "2024-01-14T15:20:00Z"
 *                 updatedAt: "2024-01-14T15:25:00Z"
 *                 _count:
 *                   messages: 6
 *       401:
 *         description: No autorizado
 */
router.get('/sessions', auth, listSessionsCtrl);

/**
 * @swagger
 * /api/chat/sessions/{id}:
 *   get:
 *     summary: Obtener una sesión con todos sus mensajes
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sesión
 *         example: 1
 *     responses:
 *       200:
 *         description: Sesión con mensajes
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               title: "Busco juegos de terror"
 *               createdAt: "2024-01-15T10:30:00Z"
 *               updatedAt: "2024-01-15T10:35:00Z"
 *               messages:
 *                 - id: 1
 *                   role: "user"
 *                   content: "Hola, recomiéndame juegos de terror"
 *                   createdAt: "2024-01-15T10:30:00Z"
 *                 - id: 2
 *                   role: "assistant"
 *                   content: "¡Hola! Te recomiendo Resident Evil 4 Remake..."
 *                   createdAt: "2024-01-15T10:30:05Z"
 *       404:
 *         description: Sesión no encontrada
 *         content:
 *           application/json:
 *             example:
 *               message: "Sesión no encontrada"
 *       401:
 *         description: No autorizado
 */
router.get('/sessions/:id', auth, getSessionCtrl);

/**
 * @swagger
 * /api/chat/sessions/{id}:
 *   delete:
 *     summary: Eliminar una sesión de chat
 *     description: Elimina la sesión y todos sus mensajes asociados
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sesión a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Sesión eliminada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               deleted: true
 *       404:
 *         description: Sesión no encontrada
 *         content:
 *           application/json:
 *             example:
 *               message: "Sesión no encontrada"
 *       401:
 *         description: No autorizado
 */
router.delete('/sessions/:id', auth, deleteSessionCtrl);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Enviar mensaje al chat IA
 *     description: |
 *       Envía un mensaje al asistente Sage.
 *
 *       **Para crear un nuevo chat:** NO envíes `sessionId` (omítelo del body).
 *
 *       **Para continuar un chat existente:** Incluye el `sessionId` del chat que quieres continuar.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               sessionId:
 *                 type: integer
 *                 description: ID de sesión existente. **Omitir para crear un chat nuevo.**
 *                 example: 1
 *               message:
 *                 type: string
 *                 description: Mensaje del usuario
 *                 example: "Recomiéndame juegos de acción"
 *           examples:
 *             nuevoChat:
 *               summary: Crear chat nuevo
 *               description: Omite sessionId para crear una nueva conversación
 *               value:
 *                 message: "Hola, busco juegos de terror"
 *             continuarChat:
 *               summary: Continuar chat existente
 *               description: Incluye sessionId para continuar una conversación
 *               value:
 *                 sessionId: 1
 *                 message: "¿Tienes más opciones?"
 *     responses:
 *       200:
 *         description: Respuesta del chat
 *         content:
 *           application/json:
 *             example:
 *               sessionId: 1
 *               text: "¡Claro! Te recomiendo estos juegos de terror: Resident Evil 4 Remake (39.99€, PS5/PC/Xbox Series X)..."
 *               games:
 *                 - id: 61
 *                   title: "Resident Evil 4 Remake"
 *                   price: "39.99"
 *                   genres: "Accion, Survival Horror"
 *                   platforms: "Xbox Series X, PS5, PC"
 *                 - id: 69
 *                   title: "Dead Space Remake"
 *                   price: "39.99"
 *                   genres: "Accion, Ciencia Ficción, Survival Horror"
 *                   platforms: "Xbox Series X, PS5, PC"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Sesión no encontrada (si se proporciona sessionId inválido)
 *         content:
 *           application/json:
 *             example:
 *               message: "Sesión no encontrada"
 */
router.post('/', auth, chatCtrl);

export default router;
