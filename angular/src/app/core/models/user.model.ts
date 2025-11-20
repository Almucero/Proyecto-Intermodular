import { Model } from './base.model';

export interface User extends Model {
  accountId?: string | null;
  accountAt?: string | null;
  email: string;
  nickname?: string | null;
  name: string;
  surname?: string | null;
  balance?: number | null;
  points: number;
  isAdmin: boolean;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
}
