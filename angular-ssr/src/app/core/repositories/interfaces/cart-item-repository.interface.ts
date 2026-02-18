import { CartItem } from '../../models/cart-item.model';
import { IBaseRepository } from './base-repository.interface';

export interface ICartItemRepository extends IBaseRepository<CartItem> {}
