import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { Publisher } from '../../models/publisher.model';
import { PUBLISHER_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class PublisherService extends BaseService<Publisher> {
  constructor(
    @Inject(PUBLISHER_REPOSITORY_TOKEN) repository: IBaseRepository<Publisher>
  ) {
    super(repository);
  }
  // Métodos específicos si los hay
}
