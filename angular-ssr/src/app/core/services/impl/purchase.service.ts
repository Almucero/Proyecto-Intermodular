import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base-service.service';
import {
  API_URL_TOKEN,
  PURCHASE_REPOSITORY_TOKEN,
  PURCHASE_RESOURCE_NAME_TOKEN,
} from '../../repositories/repository.tokens';
import type { IBaseRepository } from '../../repositories/interfaces/base-repository.interface';
import { Purchase } from '../../models/purchase.model';
import { IPurchaseService } from '../interfaces/purchase-service.interface';
import { BaseAuthenticationService } from './base-authentication.service';

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
    private http: HttpClient,
    @Inject(API_URL_TOKEN) private apiUrl: string,
    @Inject(PURCHASE_RESOURCE_NAME_TOKEN) private resource: string,
    private auth: BaseAuthenticationService,
  ) {
    super(repository);
  }

  private getAuthHeaders(): any {
    const headers: any = {};
    const token = this.auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  /**
   * Solicita el reembolso de una compra específica.
   * @param id ID de la compra a reembolsar.
   * @param reason Motivo por el cual se solicita el reembolso.
   * @returns Observable con la compra actualizada (estado 'refunded').
   */
  refund(id: number, reason: string) {
    return this.http.post<Purchase>(
      `${this.apiUrl}/${this.resource}/${id}/refund`,
      { reason },
      { headers: this.getAuthHeaders() },
    );
  }
}
