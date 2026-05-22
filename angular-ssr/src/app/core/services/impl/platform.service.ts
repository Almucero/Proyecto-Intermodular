/**
 * @file: src/app/core/services/impl/platform.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio para la gestión de plataformas de videojuegos (PC, Consolas, etc.).
 */

import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { Platform } from '../../models/platform.model';
import { PLATFORM_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import type { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { IPlatformService } from '../interfaces/platform-service.interface';

/**
 * Servicio para la gestión de plataformas de videojuegos (PC, Consolas, etc.).
 */
@Injectable({
  providedIn: 'root',
})
export class PlatformService
  extends BaseService<Platform>
  implements IPlatformService {
  /**
   * Documentado.
   * @param repository Repositorio de plataformas inyectado.
   */
  constructor(
    @Inject(PLATFORM_REPOSITORY_TOKEN) repository: IBaseRepository<Platform>,
  ) {
    super(repository);
  }
}
