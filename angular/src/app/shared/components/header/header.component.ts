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
    // small timeout to allow click on overlay to register before blur hides it
    setTimeout(() => (this.searchActive = false), 0);
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
