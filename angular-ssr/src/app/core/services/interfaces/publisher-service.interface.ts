/**
 * @file: src/app/core/services/interfaces/publisher-service.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el servicio de distribuidoras.
 */

import { Publisher } from '../../models/publisher.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define el contrato para el servicio de distribuidoras.
 */
export interface IPublisherService extends IBaseService<Publisher> { }
