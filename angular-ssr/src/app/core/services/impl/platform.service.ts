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
  implements IPlatformService
{
  /**
   * @param repository Repositorio de plataformas inyectado.
   */
  constructor(
    @Inject(PLATFORM_REPOSITORY_TOKEN) repository: IBaseRepository<Platform>,
  ) {
    super(repository);
  }
}
