import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { Media } from '../../models/media.model';
import { MEDIA_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class MediaService extends BaseService<Media> {
  constructor(
    @Inject(MEDIA_REPOSITORY_TOKEN) repository: IBaseRepository<Media>,
  ) {
    super(repository);
  }
}
