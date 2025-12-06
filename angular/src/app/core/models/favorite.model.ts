import { Model } from './base.model';
import { User } from './user.model';
import { Game } from './game.model';

export interface Favorite extends Model {
  userId: number;
  gameId: number;
  user?: User;
  game?: Game;
}
