import { Model } from './base.model';
import { User } from './user.model';
import { Game } from './game.model';

/**
 * Representa la asociación de un juego como favorito para un usuario.
 */
export interface Favorite extends Model {
  /** ID del usuario que marcó el juego como favorito. */
  userId: number;
  /** ID del juego favorito. */
  gameId: number;
  /** ID de la plataforma preferida para este favorito. */
  platformId: number;
  /** Objeto del usuario (opcional). */
  user?: User;
  /** Objeto del juego favorito (opcional). */
  game?: Game;
  /** Información simplificada de la plataforma asociada. */
  platform?: { id: number; name: string };
}
