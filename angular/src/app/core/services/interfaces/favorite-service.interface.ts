import { Observable } from 'rxjs';
import { Favorite } from '../../models/favorite.model';
import { IBaseService } from './base-service.interface';

export interface IFavoriteService extends IBaseService<Favorite> {
  add(entity: Favorite): Observable<Favorite>;
}
