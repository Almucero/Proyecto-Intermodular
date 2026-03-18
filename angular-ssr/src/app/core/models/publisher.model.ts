import { Model } from './base.model';
import { Game } from './game.model';

/**
 * Representa una distribuidora de videojuegos.
 */
export interface Publisher extends Model {
  /** Nombre de la distribuidora. */
  name: string;
  /** Lista de juegos publicados por esta empresa. */
  Game?: Game[];
}
