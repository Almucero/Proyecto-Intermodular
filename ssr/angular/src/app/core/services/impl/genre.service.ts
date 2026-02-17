import { Inject, Injectable } from '@angular/core';
import { GENRE_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { Genre } from '../../models/genre.model';
import { BaseService } from './base-service.service';
import { IGenreService } from '../interfaces/genre-service.interface';

@Injectable({
  providedIn: 'root',
})
export class GenreService extends BaseService<Genre> implements IGenreService {
  constructor(
    @Inject(GENRE_REPOSITORY_TOKEN) repository: IBaseRepository<Genre>
  ) {
    super(repository);
  }
}
