import { Game } from '../../models/game.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de juegos.
 */
export interface IGameRepository extends IBaseRepository<Game> {}
