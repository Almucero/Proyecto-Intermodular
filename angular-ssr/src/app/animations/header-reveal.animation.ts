import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';

/**
 * Animación de revelado para el encabezado (header).
 * Desplaza el header desde arriba hacia su posición original.
 */
export const headerRevealAnimation = trigger('headerRevealAnimation', [

  state(
    'hidden',
    style({
      opacity: 0,
      transform: 'translateY(-100%)',
    }),
  ),
  state(
    'visible',
    style({
      opacity: 1,
      transform: 'none',
    }),
  ),
  transition('hidden => visible', [
    animate('600ms {{delay}} cubic-bezier(0.4, 0, 0.2, 1)'),
  ]),
]);
