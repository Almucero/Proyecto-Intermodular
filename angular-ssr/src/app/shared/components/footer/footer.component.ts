import { Component, inject, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { UiStateService } from '../../../core/services/ui-state.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Language,
  LanguageService,
} from './../../../core/services/language.service';

/**
 * Componente de pie de página (footer) de la aplicación.
 * Proporciona enlaces rápidos, cambio de idioma y visualización del año actual.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  /** Propiedad no documentada. */
  private languageService = inject(LanguageService);
  /** Servicio del enrutador de Angular. */
  private router = inject(Router);
  /** Estado global de la interfaz de usuario. */
  public uiState = inject(UiStateService);
  /** Año actual para el copyright. */
  currentYear = new Date().getFullYear();

  /** Lista de idiomas disponibles en la aplicación. */
  languages: Language[] = ['es', 'en', 'de', 'fr', 'it'];

  /** Clase dinámica vinculada al estado de apertura del menú móvil. */
  @HostBinding('class.menu-open')
  get menuOpen() {
    return this.uiState.isMenuOpen();
  }

  /** Clase dinámica vinculada al estado de búsqueda activa. */
  @HostBinding('class.search-active')
  get searchActive() {
    return (
      this.uiState.isSearchActive() && !this.router.url.includes('/search')
    );
  }

  /** Clase dinámica vinculada al estado del menú del chat (móvil). */
  @HostBinding('class.chat-sidebar-active')
  get chatSidebarActive() {
    return this.uiState.isChatSidebarOpen();
  }

  /** Obtiene el código del idioma seleccionado actualmente. */
  get currentLang(): Language {
    return this.languageService.getCurrentLang();
  }

  /**
   * Cambia el idioma de la aplicación.
   * @param lang Nuevo idioma.
   */
  changeLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
  }
}
