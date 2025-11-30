import { Model } from './base.model';
import { Genre } from './genre.model';
import { Platform } from './platform.model';
import { Media } from './media.model';
import { Developer } from './developer.model';
import { Publisher } from './publisher.model';

export interface Game extends Model {
  title: string;
  description?: string | null;
  price?: number | null;
  isOnSale: boolean;
  salePrice?: number | null;
  isRefundable: boolean;
  numberOfSales: number;
  stock: number;
  videoUrl?: string | null;
  rating?: number | null;
  releaseDate?: string | null;
  genres?: Genre[];
  platforms?: Platform[];
  media?: Media[];
  publisherId?: number | null;
  developerId?: number | null;
  Publisher?: Publisher | null;
  Developer?: Developer | null;
}
