import { CartItem } from '../../models/cart-item.model';
import { IBaseRepository } from './base-repository.interface';

/**
 * Interfaz para el repositorio de artículos del carrito.
 */
export interface ICartItemRepository extends IBaseRepository<CartItem> {}
