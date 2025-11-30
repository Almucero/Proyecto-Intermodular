import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { Platform } from '../../models/platform.model';
import { PLATFORM_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class PlatformService extends BaseService<Platform> {
  constructor(
    @Inject(PLATFORM_REPOSITORY_TOKEN) repository: IBaseRepository<Platform>,
  ) {
    super(repository);
  }
}
