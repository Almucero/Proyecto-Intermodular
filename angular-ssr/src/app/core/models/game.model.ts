import { Model } from './base.model';
import { Genre } from './genre.model';
import { Platform } from './platform.model';
import { Media } from './media.model';
import { Developer } from './developer.model';
import { Publisher } from './publisher.model';
import { Favorite } from './favorite.model';
import { CartItem } from './cart-item.model';
import { PurchaseItem } from './purchase-item.model';

/**
 * Representa un videojuego disponible en la tienda.
 */
export interface Game extends Model {
  /** Título oficial del videojuego. */
  title: string;
  /** Descripción detallada del contenido del juego. */
  description?: string | null;
  /** Precio base de venta. */
  price?: number | null;
  /** Indica si el juego tiene actualmente una oferta activa. */
  isOnSale: boolean;
  /** Precio rebajado si está en oferta. */
  salePrice?: number | null;
  /** Indica si el juego permite reembolsos tras la compra. */
  isRefundable: boolean;
  /** Número total de copias vendidas. */
  numberOfSales: number;
  /** Unidades disponibles para la plataforma PC. */
  stockPc: number;
  /** Unidades disponibles para PlayStation 5. */
  stockPs5: number;
  /** Unidades disponibles para Xbox Series X/S. */
  stockXboxX: number;
  /** Unidades disponibles para Nintendo Switch. */
  stockSwitch: number;
  /** Unidades disponibles para PlayStation 4. */
  stockPs4: number;
  /** Unidades disponibles para Xbox One. */
  stockXboxOne: number;
  /** Enlace a un vídeo de demostración o tráiler (normalmente YouTube). */
  videoUrl?: string | null;
  /** Valoración media otorgada por los usuarios (0-5). */
  rating?: number | null;
  /** Fecha oficial de lanzamiento. */
  releaseDate?: string | null;
  /** Géneros a los que pertenece el juego. */
  genres?: Genre[];
  /** Plataformas en las que está disponible. */
  platforms?: Platform[];
  /** Recursos multimedia asociados (imágenes, capturas de pantalla). */
  media?: Media[];
  /** ID de la distribuidora (Publisher). */
  publisherId?: number | null;
  /** ID de la desarrolladora (Developer). */
  developerId?: number | null;
  /** Objeto completo de la distribuidora. */
  Publisher?: Publisher | null;
  /** Objeto completo de la desarrolladora. */
  Developer?: Developer | null;
  /** Usuarios que han marcado este juego como favorito. */
  favorites?: Favorite[];
  /** Referencias en carritos de compra activos. */
  cartItems?: CartItem[];
  /** Registro de ventas individuales de este juego. */
  purchaseItems?: PurchaseItem[];
}
