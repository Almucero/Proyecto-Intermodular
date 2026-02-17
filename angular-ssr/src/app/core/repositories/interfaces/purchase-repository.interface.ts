import { Purchase } from '../../models/purchase.model';
import { IBaseRepository } from './base-repository.interface';

export interface IPurchaseRepository extends IBaseRepository<Purchase> {}
