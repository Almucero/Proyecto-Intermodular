/**
 * @file: src/app/core/models/genre.model.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Modelo de datos para un género de videojuegos.
 */

import { Model } from './base.model';
import { Game } from './game.model';

/**
 * Representa una categoría o género de videojuegos (ej. Acción, RPG).
 */
export interface Genre extends Model {
  /** Nombre del género. */
  name: string;
  /** Lista de juegos que pertenecen a este género. */
  games?: Game[];
}
