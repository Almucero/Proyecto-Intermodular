import {
  Component,
  ViewChild,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { BaseAuthenticationService } from '../../../core/services/impl/base-authentication.service';
import { CartItemService } from '../../../core/services/impl/cart-item.service';
import { FavoriteService } from '../../../core/services/impl/favorite.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { slideMenuAnimation } from '../../../animations/slide-menu.animation';

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
  animations: [slideMenuAnimation],
})
export class HeaderComponent {
  isMenuOpen = false;
  searchActive = false;
  @ViewChild('menu') menu!: ElementRef;

  private authService = inject(BaseAuthenticationService);
  private cartService = inject(CartItemService);
  private favoriteService = inject(FavoriteService);
  private router = inject(Router);

  user = toSignal(this.authService.user$);
  cartCount = toSignal(this.cartService.cartCount$);
  favoritesCount = toSignal(this.favoriteService.favoritesCount$);

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isSearchPage = false;

  constructor() {
    this.router.events.subscribe((event) => {
      if (typeof event === 'object' && 'url' in event) {
        this.isSearchPage = this.router.url.includes('/search');
      }
    });
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

  onSearch(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const input = event.target as HTMLInputElement;
      const query = input.value.trim();
      if (!query) {
        this.router.navigate(['/search'], { queryParams: {} });
      } else {
        this.router.navigate(['/search'], { queryParams: { q: query } });
      }
      this.searchActive = false;
    }
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
