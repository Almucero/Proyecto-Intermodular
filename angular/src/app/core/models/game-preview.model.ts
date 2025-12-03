import { Model } from './base.model';

export interface GamePreview extends Model {
  title: string;
  price?: number | null;
  releaseDate?: string | null;
}
