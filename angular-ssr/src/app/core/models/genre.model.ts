import { Model } from './base.model';
import { Game } from './game.model';

export interface Genre extends Model {
  name: string;
  games?: Game[];
}
