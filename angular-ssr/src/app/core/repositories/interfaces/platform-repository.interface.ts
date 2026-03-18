import { Platform } from '../../models/platform.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de plataformas.
 */
export interface IPlatformRepository extends IBaseRepository<Platform> {}
