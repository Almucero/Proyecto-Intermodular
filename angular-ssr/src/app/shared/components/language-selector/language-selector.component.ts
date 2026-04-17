import {
  Component,
  inject,
  HostListener,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Language,
  LanguageService,
} from './../../../core/services/language.service';

/**
 * Componente que permite cambiar el idioma de la aplicación.
 * Muestra el selector de banderas y gestiona la persistencia del idioma.
 */
@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit {
  private languageService = inject(LanguageService);
  @ViewChild('triggerButton') triggerButton?: ElementRef<HTMLButtonElement>;

  /** Indica si el menú desplegable de idiomas está abierto. */
  isLangMenuOpen = false;
  /** Estado de transición para la animación de cierre. */
  isClosing = false;
  /** Ruta a la bandera que se muestra actualmente. */
  displayedFlag = '';
  /** Indica si se está realizando un cambio de bandera (animación). */
  flagIsChanging = false;

  /** Configuración de idiomas soportados con sus respectivas banderas. */
  languages: { code: Language; flag: string; name: string }[] = [
    { code: 'es', flag: 'assets/flags/espana.png', name: 'Español' },
    { code: 'en', flag: 'assets/flags/estados-unidos.png', name: 'English' },
    { code: 'de', flag: 'assets/flags/alemania.png', name: 'Deutsch' },
    { code: 'fr', flag: 'assets/flags/francia.png', name: 'Français' },
    { code: 'it', flag: 'assets/flags/italia.png', name: 'Italiano' },
  ];

  ngOnInit(): void {
    try {
      const current = this.languageService.getCurrentLang();
      this.displayedFlag = this.getFlagFor(current);
    } catch {
      this.displayedFlag = 'assets/flags/espana.png';
    }
  }

  /**
   * Obtiene la ruta de la bandera para un código de idioma.
   * @param code Código del idioma.
   */
  private getFlagFor(code: Language | undefined): string {
    if (!code) return 'assets/flags/espana.png';
    const current = this.languages.find((l) => l.code === code);
    return current ? current.flag : 'assets/flags/espana.png';
  }

  /** Obtiene la bandera vinculada al idioma activo. */
  get currentFlag(): string {
    return this.getFlagFor(this.languageService.getCurrentLang());
  }

  /** Obtiene el nombre legible del idioma activo. */
  get currentLanguageName(): string {
    const current = this.languages.find(
      (l) => l.code === this.languageService.getCurrentLang(),
    );
    return current ? current.name : 'Español';
  }

  /** Devuelve la lista de idiomas que NO están seleccionados actualmente. */
  get availableLanguages(): { code: Language; flag: string; name: string }[] {
    return this.languages.filter(
      (l) => l.code !== this.languageService.getCurrentLang(),
    );
  }

  /** Alterna la visibilidad del menú de idiomas. */
  toggleLangMenu(): void {
    if (this.isLangMenuOpen) {
      this.closeLangMenu();
    } else {
      this.blurTrigger();
      this.isLangMenuOpen = true;
      this.isClosing = false;
    }
  }

  /** Cierra el menú con una pequeña animación. */
  closeLangMenu(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.isLangMenuOpen = false;
      this.isClosing = false;
      this.blurTrigger();
    }, 200);
  }

  /**
   * Cambia el idioma global de la aplicación.
   * @param lang Código del nuevo idioma.
   */
  setLanguage(lang: Language): void {
    this.flagIsChanging = true;
    const ms = 150;
    setTimeout(() => {
      this.languageService.setLanguage(lang);
      this.displayedFlag = this.getFlagFor(lang);
      this.flagIsChanging = false;
    }, ms);

    this.closeLangMenu();
  }

  /** Escucha clics globales para cerrar el menú si se pulsa fuera del componente. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-language-selector')) {
      if (this.isLangMenuOpen) {
        this.closeLangMenu();
      }
      this.blurTrigger();
    }
  }

  private blurTrigger(): void {
    const btn = this.triggerButton?.nativeElement;
    if (btn) {
      btn.blur();
    }
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest('app-language-selector')) {
      active.blur();
    }
  }
}
