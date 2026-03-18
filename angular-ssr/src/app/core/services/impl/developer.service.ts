import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { Developer } from '../../models/developer.model';
import { DEVELOPER_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { IDeveloperService } from '../interfaces/developer-service.interface';

/**
 * Servicio para la gestión de las empresas desarrolladoras de videojuegos.
 * Proporciona acceso a las operaciones CRUD básicas.
 */
@Injectable({
  providedIn: 'root',
})
export class DeveloperService
  extends BaseService<Developer>
  implements IDeveloperService
{
  /**
   * @param repository Repositorio de desarrolladoras inyectado.
   */
  constructor(
    @Inject(DEVELOPER_REPOSITORY_TOKEN) repository: IBaseRepository<Developer>,
  ) {
    super(repository);
  }
}
