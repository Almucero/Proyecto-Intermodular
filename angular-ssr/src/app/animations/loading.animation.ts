import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

/**
 * Animación de salida (fade-out y escalado) para la pantalla de carga inicial.
 */
export const loadingAnimation = trigger('leaveAnimation', [

  transition(
    ':leave',
    [
      query('.glitch-container', style({ transform: 'scale(1)' })),
      style({ opacity: 1 }),
      group([
        animate('{{duration}} ease-in-out', style({ opacity: 0 })),
        query('.glitch-container', [
          animate(
            '{{duration}} ease-in-out',
            style({ transform: 'scale(0.5)' }),
          ),
        ]),
      ]),
    ],
    { params: { duration: '800ms' } },
  ),
]);
