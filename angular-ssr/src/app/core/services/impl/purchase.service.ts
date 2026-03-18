import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base-service.service';
import { PURCHASE_REPOSITORY_TOKEN } from '../../repositories/repository.tokens';
import type { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { Purchase } from '../../models/purchase.model';
import { IPurchaseService } from '../interfaces/purchase-service.interface';

/**
 * Servicio para la gestión de compras y transacciones.
 * Permite listar compras y gestionar reembolsos.
 */
@Injectable({
  providedIn: 'root',
})
export class PurchaseService
  extends BaseService<Purchase>
  implements IPurchaseService
{
  /**
   * @param repository Repositorio de compras inyectado.
   */
  constructor(
    @Inject(PURCHASE_REPOSITORY_TOKEN) repository: IBaseRepository<Purchase>,
  ) {
    super(repository);
  }

  /**
   * Solicita el reembolso de una compra específica.
   * @param id ID de la compra a reembolsar.
   * @param reason Motivo por el cual se solicita el reembolso.
   * @returns Observable con la compra actualizada (estado 'refunded').
   */
  refund(id: number, reason: string) {
    return this.update(id.toString(), {
      status: 'refunded',
      refundReason: reason,
    } as any);
  }
}
