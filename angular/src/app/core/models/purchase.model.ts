import { Model } from './base.model';
import { User } from './user.model';
import { PurchaseItem } from './purchase-item.model';

export interface Purchase extends Model {
  userId: number;
  totalPrice: number;
  status: string;
  refundReason?: string | null;
  purchasedAt: string;
  user?: User;
  items?: PurchaseItem[];
}
