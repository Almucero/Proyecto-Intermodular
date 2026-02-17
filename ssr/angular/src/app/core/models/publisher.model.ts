import { Model } from './base.model';
import { Game } from './game.model';

export interface Publisher extends Model {
  name: string;
  Game?: Game[];
}
