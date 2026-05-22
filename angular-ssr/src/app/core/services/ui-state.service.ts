/**
 * @file: src/app/core/services/ui-state.service.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Servicio para gestionar el estado de la interfaz de usuario de forma reactiva.
 */

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

  /** Señal que indica si la búsqueda global está activa (se usa para sincronizar sombras de header/footer). */
  isSearchActive = signal(false);

  /** Señal que indica si la pantalla de carga inicial está visible. */
  isMainLoaderVisible = signal(true);

  /** Señal que se activa cuando la animación de salida del loader ha terminado completamente. */
  loaderAnimationDone = signal(false);

  /** Señal que indica si la barra lateral del chat de IA está abierta. */
  isChatSidebarOpen = signal(false);

  /** Alterna el estado del menú. */
  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  /**
   * Establece explícitamente el estado del menú.
   * @param isOpen Indica si el menú debe estar abierto o cerrado.
   */
  setMenuOpen(isOpen: boolean) {
    this.isMenuOpen.set(isOpen);
  }

  /**
   * Establece si la búsqueda está activa.
   * @param isActive Indica si la búsqueda está activa.
   */
  setSearchActive(isActive: boolean) {
    this.isSearchActive.set(isActive);
  }
}
