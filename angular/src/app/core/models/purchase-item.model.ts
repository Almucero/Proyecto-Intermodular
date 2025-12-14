import { Model } from './base.model';
import { Purchase } from './purchase.model';
import { Game } from './game.model';

export interface PurchaseItem extends Model {
  purchaseId: number;
  gameId: number;
  platformId: number;
  price: number;
  quantity: number;
  purchase?: Purchase;
  game?: Game;
  platform?: { id: number; name: string };
}
