import { Model } from './base.model';
import { GamePreview } from './game-preview.model';

export interface GameImage extends Model {
  url: string;
  altText?: string | null;
  gameId: number;
  game?: GamePreview | null;
}
