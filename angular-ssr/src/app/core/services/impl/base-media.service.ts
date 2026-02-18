import { Observable } from 'rxjs';

export abstract class BaseMediaService<T = number> {
  abstract upload(blob: Blob): Observable<T>;
}
