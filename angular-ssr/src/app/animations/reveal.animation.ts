import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';

/**
 * Animación de revelado suave para elementos de la interfaz.
 * Aplica una transición de opacidad y desplazamiento vertical (Y).
 */
export const revealAnimation = trigger('revealAnimation', [

  state(
    'hidden',
    style({
      opacity: 0,
      transform: 'translateY(15px) scale(0.98)',
    }),
  ),
  state(
    'visible',
    style({
      opacity: 1,
      transform: 'none',
    }),
  ),
  transition('hidden => visible', [animate('{{duration}} ease-out')], {
    params: { duration: '800ms' },
  }),
]);
