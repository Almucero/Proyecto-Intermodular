import { Model } from './base.model';
import { Game } from './game.model';
import { User } from './user.model';

export interface CartItem extends Model {
  userId: number;
  gameId: number;
  quantity: number;
  user?: User;
  game?: Game;
}
