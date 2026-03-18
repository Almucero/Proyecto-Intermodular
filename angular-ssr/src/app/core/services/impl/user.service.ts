import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { User } from '../../models/user.model';
import { USER_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import type { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { IUserService } from '../interfaces/user-service.interface';

/**
 * Implementación del servicio de gestión de usuarios.
 * Extiende de {@link BaseService} para funcionalidades CRUD estándar.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<User> implements IUserService {
  /**
   * @param repository Repositorio de usuarios inyectado.
   */
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) repository: IBaseRepository<User>,
  ) {
    super(repository);
  }
}
