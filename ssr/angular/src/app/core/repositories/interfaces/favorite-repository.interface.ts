import { Favorite } from '../../models/favorite.model';
import { IBaseRepository } from './base-repository.interface';

export interface IFavoriteRepository extends IBaseRepository<Favorite> {}
