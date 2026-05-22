/**
 * @file: src/app/core/repositories/interfaces/game-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de juegos.
 */

import { Game } from '../../models/game.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de juegos.
 */
export interface IGameRepository extends IBaseRepository<Game> { }
