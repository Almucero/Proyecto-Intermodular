import { Platform } from '../../models/platform.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de plataformas.
 */
export interface IPlatformService extends IBaseService<Platform> {}
