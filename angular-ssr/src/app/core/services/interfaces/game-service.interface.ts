import { Game } from '../../models/game.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de videojuegos.
 */
export interface IGameService extends IBaseService<Game> {}
