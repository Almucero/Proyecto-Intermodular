import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmNavigationService } from '../services/confirm-navigation.service';

export interface CanComponentDeactivate {
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

