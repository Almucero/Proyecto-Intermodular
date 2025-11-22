import { Component, ViewChild, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isMenuOpen = false;
  searchActive = false;
  @ViewChild('menu') menu!: ElementRef;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSearchFocus(): void {
    this.searchActive = true;
  }

  onSearchBlur(): void {
    // pequeño delay para permitir clicks en el overlay antes de cerrar
    setTimeout(() => {
      const active = document.activeElement as HTMLElement | null;
      // si el foco no está dentro del wrapper de búsqueda, cerramos
      if (!active || !active.closest('.search-wrapper')) {
        this.searchActive = false;
      }
    }, 120); // 120ms es suficiente; evita 0 que a veces hace race
  }

  closeSearch(): void {
    this.searchActive = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (
      this.isMenuOpen &&
      this.menu &&
      !this.menu.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }
  }
}
