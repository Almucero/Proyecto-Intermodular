import { Injectable, signal } from '@angular/core';

/**
 * Servicio global que gestiona el modal de confirmación de navegación
 * (cambios sin guardar). Debe inyectarse en el AppComponent para que
 * el modal sobreviva a la destrucción de los componentes hijos.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmNavigationService {
  /** Indica si el modal está visible. */
  readonly visible = signal(false);

  private resolveFn?: (confirmed: boolean) => void;

  /**
   * Muestra el modal y devuelve una promesa que se resolverá cuando el
   * usuario confirme o cancele la acción.
   */
  confirm(): Promise<boolean> {
    this.visible.set(true);
    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  /** Confirma la acción: cierra el modal y resuelve con `true`. */
  accept(): void {
    this.visible.set(false);
    this.resolveFn?.(true);
    this.resolveFn = undefined;
  }

  /** Cancela la acción: cierra el modal y resuelve con `false`. */
  cancel(): void {
    this.visible.set(false);
    this.resolveFn?.(false);
    this.resolveFn = undefined;
  }
}
