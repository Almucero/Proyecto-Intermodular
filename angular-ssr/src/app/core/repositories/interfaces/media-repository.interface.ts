import { Media } from '../../models/media.model';
import { IBaseRepository } from './base-repository.interface';
import { Observable } from 'rxjs';

export interface IMediaRepository extends IBaseRepository<Media> {
  upload(file: File): Observable<Media>;
}
