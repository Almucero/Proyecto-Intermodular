import { Observable } from 'rxjs';
import { Favorite } from '../../models/favorite.model';
import { IBaseService } from './base-service.interface';

/**
 * Interfaz que define las operaciones específicas para el servicio de favoritos.
 */
export interface IFavoriteService extends IBaseService<Favorite> {
  /**
   * Añade un juego a favoritos.
   * @param entity El favorito a añadir.
   * @returns Observable con el resultado.
   */
  add(entity: Favorite): Observable<Favorite>;
}
