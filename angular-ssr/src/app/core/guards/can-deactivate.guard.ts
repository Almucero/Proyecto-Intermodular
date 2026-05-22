/**
 * @file: src/app/core/guards/can-deactivate.guard.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Guard que previene la salida del usuario si tiene cambios no guardados.
 */

import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmNavigationService } from '../services/confirm-navigation.service';

/**
 * Interfaz que deben implementar los componentes que requieren confirmación al salir.
 */
export interface CanComponentDeactivate {
  /**
   * Método que determina si el componente tiene cambios sin guardar.
   * @returns Verdadero si hay cambios sin guardar, falso en caso contrario.
   */
  hasUnsavedChanges: () => boolean;
}

/**
 * Guard genérico que delega la confirmación de salida al
 * `ConfirmNavigationService` global, cuyo modal vive en el AppComponent
 * y no es destruido cuando el componente hijo se desmonta.
 */
export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate
) => {
  if (!component.hasUnsavedChanges || !component.hasUnsavedChanges()) {
    return true;
  }
  const confirmService = inject(ConfirmNavigationService);
  return confirmService.confirm();
};

