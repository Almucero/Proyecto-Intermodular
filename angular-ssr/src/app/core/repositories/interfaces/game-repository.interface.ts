import { Game } from '../../models/game.model';
import { IBaseRepository } from './base-repository.interface';

export interface IGameRepository extends IBaseRepository<Game> {}
