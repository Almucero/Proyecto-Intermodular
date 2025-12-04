import type { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as controller from "./favorites.controller.js";

export function favoritesRoutes(router: Router) {
  router.get("/favorites", auth, controller.getUserFavoritesCtrl);

  /**
   * @swagger
   * /api/favorites/{gameId}:
   *   post:
   *     summary: Agregar juego a favoritos
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: gameId
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       201:
   *         description: Juego agregado a favoritos
   *       404:
   *         description: Juego no encontrado
   *       409:
   *         description: El juego ya está en favoritos
   */
  router.post("/favorites/:gameId", auth, controller.addToFavoritesCtrl);

  /**
   * @swagger
   * /api/favorites/{gameId}:
   *   delete:
   *     summary: Remover juego de favoritos
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: gameId
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Juego removido de favoritos
   *       404:
   *         description: Favorito no encontrado
   */
  router.delete("/favorites/:gameId", auth, controller.removeFromFavoritesCtrl);

  /**
   * @swagger
   * /api/favorites/check/{gameId}:
   *   get:
   *     summary: Verificar si un juego está en favoritos
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: gameId
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Estado del favorito
   */
  router.get("/favorites/check/:gameId", auth, controller.isFavoriteCtrl);
}
