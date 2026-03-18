import { Model } from './base.model';
import { Purchase } from './purchase.model';
import { Game } from './game.model';

/**
 * Representa un artículo individual dentro de una compra finalizada.
 */
export interface PurchaseItem extends Model {
  /** ID de la compra a la que pertenece este artículo. */
  purchaseId: number;
  /** ID del juego adquirido. */
  gameId: number;
  /** ID de la plataforma seleccionada para el juego. */
  platformId: number;
  /** Precio unitario al que se compró el artículo. */
  price: number;
  /** Cantidad de unidades adquiridas. */
  quantity: number;
  /** Objeto de la compra principal. */
  purchase?: Purchase;
  /** Objeto del juego adquirido. */
  game?: Game;
  /** Información simplificada de la plataforma elegida. */
  platform?: { id: number; name: string };
  /** Título del juego en el momento de la compra. */
  title?: string;
  /** Precio de compra registrado. */
  purchasePrice?: number;
  /** Valoración del usuario para este artículo (opcional). */
  rating?: number;
}
