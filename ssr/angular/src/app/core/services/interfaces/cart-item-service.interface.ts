import { Observable } from 'rxjs';
import { CartItem } from '../../models/cart-item.model';
import { IBaseService } from './base-service.interface';

export interface ICartItemService extends IBaseService<CartItem> {
  add(entity: CartItem): Observable<CartItem>;
}
