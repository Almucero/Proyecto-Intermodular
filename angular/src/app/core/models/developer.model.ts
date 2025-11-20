import { Model } from './base.model';
import { GamePreview } from './game-preview.model';

export interface Developer extends Model {
  name: string;
  games?: GamePreview[];
}
