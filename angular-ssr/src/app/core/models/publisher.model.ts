
/**
 * @file: src/app/core/models/publisher.model.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Modelo de datos para una distribuidora de videojuegos.
 */

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
