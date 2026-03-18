import { Developer } from '../../models/developer.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de desarrolladoras.
 */
export interface IDeveloperService extends IBaseService<Developer> {}
