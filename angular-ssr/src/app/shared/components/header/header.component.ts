import {
  Component,
  ViewChild,
  HostListener,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { BaseAuthenticationService } from '../../../core/services/impl/base-authentication.service';
import { CartItemService } from '../../../core/services/impl/cart-item.service';
import { FavoriteService } from '../../../core/services/impl/favorite.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { slideMenuAnimation } from '../../../animations/slide-menu.animation';
import { UiStateService } from '../../../core/services/impl/ui-state.service';

/**
 * Componente de cabecera (header) principal.
 * Gestiona la navegación, búsqueda global, conteos de carrito/favoritos
 * y despliegue del menú móvil.
 */
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
  /** Indica si la barra de búsqueda está desplegada (móvil). */
  searchActive = false;
  /** Referencia al elemento del menú para detectar clics fuera. */
  @ViewChild('menu') menu!: ElementRef;

  private authService = inject(BaseAuthenticationService);
  private cartService = inject(CartItemService);
  private favoriteService = inject(FavoriteService);
  private router = inject(Router);
  /** Servicio de estado de la UI (menú abierto/cerrado). */
  public uiState = inject(UiStateService);
  private platformId = inject(PLATFORM_ID);

  /** Signal con los datos del usuario autenticado. */
  user = toSignal(this.authService.user$);
  /** Signal con la cantidad de artículos en el carrito. */
  cartCount = toSignal(this.cartService.cartCount$);
  /** Signal con la cantidad de juegos favoritos. */
  favoritesCount = toSignal(this.favoriteService.favoritesCount$);

  /** Alterna el estado de apertura del menú lateral. */
  toggleMenu(): void {
    this.uiState.toggleMenu();
  }

  /** Indica si el usuario está actualmente en la página de búsqueda. */
  isSearchPage = false;

  constructor() {
    this.router.events.subscribe((event) => {
      if (typeof event === 'object' && 'url' in event) {
        this.isSearchPage = this.router.url.includes('/search');
      }
    });
  }

  /** Maneja el foco en el input de búsqueda. */
  onSearchFocus(): void {
    this.searchActive = true;
  }

  /** Maneja la pérdida de foco del buscador con un pequeño retardo. */
  onSearchBlur(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active || !active.closest('.search-wrapper')) {
        this.searchActive = false;
      }
    }, 120);
  }

  /**
   * Procesa la acción de búsqueda al pulsar Enter.
   * @param event Evento de teclado.
   */
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

  /** Cierra la barra de búsqueda. */
  closeSearch(): void {
    this.searchActive = false;
  }

  /** Escucha clics en el documento para cerrar el menú si se pincha fuera. */
  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (
      this.uiState.isMenuOpen() &&
      this.menu &&
      !this.menu.nativeElement.contains(event.target)
    ) {
      this.uiState.setMenuOpen(false);
    }
  }
}
