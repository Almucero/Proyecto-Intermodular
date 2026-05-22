/**
 * @file: src/app/core/services/impl/publisher.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio para la gestión de distribuidoras de videojuegos.
 */

import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { Publisher } from '../../models/publisher.model';
import { PUBLISHER_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import type { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { IPublisherService } from '../interfaces/publisher-service.interface';

/**
 * Servicio para la gestión de distribuidoras de videojuegos.
 */
@Injectable({
  providedIn: 'root',
})
export class PublisherService
  extends BaseService<Publisher>
  implements IPublisherService {
  /**
   * Documentado.
   * @param repository Repositorio de distribuidoras inyectado.
   */
  constructor(
    @Inject(PUBLISHER_REPOSITORY_TOKEN) repository: IBaseRepository<Publisher>,
  ) {
    super(repository);
  }
}
