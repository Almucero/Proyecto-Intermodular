import { Publisher } from '../../models/publisher.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de distribuidoras.
 */
export interface IPublisherService extends IBaseService<Publisher> {}
