import { Publisher } from '../../models/publisher.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de distribuidoras.
 */
export interface IPublisherRepository extends IBaseRepository<Publisher> {}
