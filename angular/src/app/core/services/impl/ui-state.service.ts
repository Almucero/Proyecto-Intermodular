import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  setMenuOpen(isOpen: boolean) {
    this.isMenuOpen.set(isOpen);
  }
}
