/**
 * @file: src/app/animations/slide-menu.animation.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Animación de deslizamiento lateral para el menú móvil.
 */

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

/**
 * Animación de deslizamiento lateral para el menú móvil.
 * Desplaza el menú desde la izquierda (-100% a 0).
 */
export const slideMenuAnimation = trigger('slideMenuAnimation', [

  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate(
      '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ transform: 'translateX(0)' }),
    ),
  ]),
  transition(':leave', [
    animate(
      '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ transform: 'translateX(-100%)' }),
    ),
  ]),
]);

/**
 * Animación de desplazamiento horizontal para el logo de la cabecera móvil.
 * Sincroniza la posición del logo con la apertura (abierto/cerrado) del menú lateral para evitar solapamientos.
 */
export const slideLogoAnimation = trigger('slideLogoAnimation', [
  state('closed', style({ transform: 'translate3d(0, 0, 0)' })),
  state('open', style({ transform: 'translate3d(10.5rem, 0, 0)' })),
  transition('closed => open', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
  ]),
  transition('open => closed', [
    animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);
