import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { Developer } from '../../models/developer.model';
import { DEVELOPER_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { IDeveloperService } from '../interfaces/developer-service.interface';

@Injectable({
  providedIn: 'root',
})
export class DeveloperService
  extends BaseService<Developer>
  implements IDeveloperService
{
  constructor(
    @Inject(DEVELOPER_REPOSITORY_TOKEN) repository: IBaseRepository<Developer>
  ) {
    super(repository);
  }
}
