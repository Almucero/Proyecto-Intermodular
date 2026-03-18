import { Component, inject, HostBinding } from '@angular/core';
import { UiStateService } from '../../../core/services/impl/ui-state.service';
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
  private languageService = inject(LanguageService);
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
