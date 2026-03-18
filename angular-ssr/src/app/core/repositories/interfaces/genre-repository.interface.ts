import { Genre } from '../../models/genre.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de géneros de videojuegos.
 */
export interface IGenreRepository extends IBaseRepository<Genre> {}
