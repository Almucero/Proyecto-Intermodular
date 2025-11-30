import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { User } from '../../models/user.model';
import { USER_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<User> {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) repository: IBaseRepository<User>
  ) {
    super(repository);
  }
  // Métodos específicos si los hay
}
