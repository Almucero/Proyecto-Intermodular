/**
 * @file: src/app/core/repositories/interfaces/publisher-repository.interface.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Interfaz para el repositorio de distribuidoras.
 */

import { Publisher } from '../../models/publisher.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de distribuidoras.
 */
export interface IPublisherRepository extends IBaseRepository<Publisher> { }
