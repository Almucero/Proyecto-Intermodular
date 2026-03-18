import { Model } from './base.model';
import { Game } from './game.model';
import { User } from './user.model';

/**
 * Representa un artículo dentro del carrito de compras de un usuario.
 */
export interface CartItem extends Model {
  /** ID del usuario dueño del carrito. */
  userId: number;
  /** ID del juego añadido al carrito. */
  gameId: number;
  /** ID de la plataforma seleccionada para el juego. */
  platformId: number;
  /** Cantidad de copias de este artículo. */
  quantity: number;
  /** Objeto del usuario (opcional). */
  user?: User;
  /** Objeto del juego (opcional). */
  game?: Game;
  /** Información simplificada de la plataforma elegida. */
  platform?: { id: number; name: string };
}
