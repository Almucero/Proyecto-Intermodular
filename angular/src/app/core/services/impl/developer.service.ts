import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { DEVELOPER_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { Developer } from '../../models/developer.model';

@Injectable({
  providedIn: 'root',
})
export class DeveloperService extends BaseService<Developer> {
  constructor(
    @Inject(DEVELOPER_REPOSITORY_TOKEN) repository: IBaseRepository<Developer>,
  ) {
    super(repository);
  }
  // Métodos específicos si los hay
}
