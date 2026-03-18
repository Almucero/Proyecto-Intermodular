import { Favorite } from '../../models/favorite.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de juegos favoritos.
 */
export interface IFavoriteRepository extends IBaseRepository<Favorite> {}
