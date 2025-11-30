import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service.service';
import { Media } from '../../models/media.model';
import { IMediaService } from '../interfaces/media-service.interface';
import { IMediaRepository } from '../../repositories/interfaces/media-repository.interface';
import { MEDIA_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class MediaService extends BaseService<Media> implements IMediaService {
  constructor(
    @Inject(MEDIA_REPOSITORY_TOKEN)
    protected override repository: IMediaRepository
  ) {
    super(repository);
  }

  upload(file: File): Observable<Media> {
    return this.repository.upload(file);
  }
}
