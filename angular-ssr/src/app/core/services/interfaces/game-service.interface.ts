/**
 * @file: src/app/core/services/interfaces/game-service.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el servicio de videojuegos.
 */

import { Game } from '../../models/game.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de videojuegos.
 */
export interface IGameService extends IBaseService<Game> { }
