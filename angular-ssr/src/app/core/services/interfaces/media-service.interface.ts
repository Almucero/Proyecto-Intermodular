import { Observable } from 'rxjs';
import { Media } from '../../models/media.model';
import { IBaseService } from './base-service.interface';

export interface IMediaService extends IBaseService<Media> {
  upload(file: File): Observable<Media>;
}
