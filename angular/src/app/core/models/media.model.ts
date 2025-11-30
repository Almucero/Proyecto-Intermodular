import { Model } from './base.model';
import { Game } from './game.model';
import { User } from './user.model';

export interface Media extends Model {
  url: string;
  publicId?: string | null;
  format?: string | null;
  resourceType?: string | null;
  bytes?: number | null;
  width?: number | null;
  height?: number | null;
  originalName?: string | null;
  folder?: string | null;
  altText?: string | null;
  gameId?: number | null;
  Game?: Game | null;
  userId?: number | null;
  User?: User | null;
}
