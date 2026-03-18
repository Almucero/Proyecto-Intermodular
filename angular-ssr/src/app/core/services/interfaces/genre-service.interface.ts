import { Genre } from '../../models/genre.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de géneros.
 */
export interface IGenreService extends IBaseService<Genre> {}
