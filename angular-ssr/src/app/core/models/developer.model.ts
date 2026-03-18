import { Model } from './base.model';
import { Game } from './game.model';

/**
 * Representa una empresa desarrolladora de videojuegos.
 */
export interface Developer extends Model {
  /** Nombre del estudio de desarrollo. */
  name: string;
  /** Lista de juegos desarrollados por este estudio. */
  games?: Game[];
}
