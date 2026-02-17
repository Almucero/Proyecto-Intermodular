import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

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
