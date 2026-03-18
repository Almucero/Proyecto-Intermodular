import { Developer } from '../../models/developer.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de desarrolladoras.
 */
export interface IDeveloperRepository extends IBaseRepository<Developer> {}
