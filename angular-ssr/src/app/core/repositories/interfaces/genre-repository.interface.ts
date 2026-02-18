import { Genre } from '../../models/genre.model';
import { IBaseRepository } from './base-repository.interface';

export interface IGenreRepository extends IBaseRepository<Genre> {}
