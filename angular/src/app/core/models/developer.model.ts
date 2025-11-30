import { Model } from './base.model';
import { Game } from './game.model';

export interface Developer extends Model {
  name: string;
  games?: Game[];
}
