/**
 * @file: src/app/core/models/platform.model.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Modelo de datos para una plataforma de videojuegos.
 */

import { Model } from './base.model';
import { Game } from './game.model';

/**
 * Representa una plataforma de juego (ej. PC, PS5, Switch).
 */
export interface Platform extends Model {
  /** Nombre de la plataforma. */
  name: string;
  /** Lista de juegos disponibles en esta plataforma. */
  games?: Game[];
}
