import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
} from '@angular/animations';

/**
 * Animación de transición entre rutas con efecto de fundido (fade).
 * Gestiona la salida de la página anterior y la entrada de la nueva.
 */
export const routeFadeAnimation = trigger('routeFadeAnimation', [

  transition('* <=> *', [
    query(
      ':enter',
      [
        style({
          // position: 'absolute',
          // top: 0,
          // left: 0,
          width: '100%',
          // height: '100%',
          opacity: 0,
        }),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 1,
        }),
      ],
      { optional: true },
    ),
    group([
      query(
        ':leave',
        [
          animate(
            '250ms ease-out',
            style({
              opacity: 0,
            }),
          ),
        ],
        { optional: true },
      ),
      query(
        ':enter',
        [
          animate(
            '350ms 100ms ease-in',
            style({
              opacity: 1,
            }),
          ),
        ],
        { optional: true },
      ),
    ]),
  ]),
]);
