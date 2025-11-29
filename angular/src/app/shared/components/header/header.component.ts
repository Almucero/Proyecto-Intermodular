import {
  Component,
  ViewChild,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Language, TranslatePipe } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

import { AUTH_SERVICE } from '../../../core/services/auth.token';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslatePipe,
    LanguageSelectorComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isMenuOpen = false;
  searchActive = false;
  @ViewChild('menu') menu!: ElementRef;

  private authService = inject(AUTH_SERVICE);
  user = this.authService.user;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSearchFocus(): void {
    this.searchActive = true;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active || !active.closest('.search-wrapper')) {
        this.searchActive = false;
      }
    }, 120);
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
