import { Injectable, signal } from '@angular/core';

/**
 * Servicio para gestionar el estado de la interfaz de usuario de forma reactiva.
 * Utiliza Angular Signals para un rendimiento óptimo.
 */
@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  /** Señal que indica si el menú lateral está abierto. */
  isMenuOpen = signal(false);

  /** Alterna el estado del menú. */
  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  /** Establece explícitamente el estado del menú. */
  setMenuOpen(isOpen: boolean) {
    this.isMenuOpen.set(isOpen);
  }
}
