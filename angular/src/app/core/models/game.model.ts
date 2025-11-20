import { Model } from './base.model';
import { Genre } from './genre.model';
import { Platform } from './platform.model';
import { GameImage } from './game-image.model';

export interface Game extends Model {
  title: string;
  description?: string | null;
  price?: number | null;
  salePrice?: number | null;
  isOnSale: boolean;
  isRefundable: boolean;
  numberOfSales: number;
  rating?: number | null;
  releaseDate?: string | null;
  developer?: { id: number; name: string } | null;
  publisher?: { id: number; name: string } | null;
  genres?: Genre[];
  platforms?: Platform[];
  images?: GameImage[];
}
