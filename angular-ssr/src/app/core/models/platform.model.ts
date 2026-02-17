import { Model } from './base.model';
import { Game } from './game.model';

export interface Platform extends Model {
  name: string;
  games?: Game[];
}
