import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export type Language = 'es' | 'en' | 'de' | 'fr' | 'it';

/**
 * Servicio para la gestión de la internacionalización y el cambio de idioma.
 * Soporta persistencia en localStorage y detección automática del idioma del navegador.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translateService = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly STORAGE_KEY = 'app-language';
  private readonly AVAILABLE_LANGUAGES: Language[] = [
    'es',
    'en',
    'de',
    'fr',
    'it',
  ];
  private readonly DEFAULT_LANGUAGE: Language = 'es';

  /** BehaviorSubject que mantiene el idioma actual. */
  private currentLangSubject = new BehaviorSubject<Language>(
    this.DEFAULT_LANGUAGE,
  );
  /** Observable para suscribirse a los cambios de idioma. */
  currentLang$ = this.currentLangSubject.asObservable();

  constructor() {
    this.initializeLanguage();
  }

  /**
   * Inicializa el idioma de la aplicación al arrancar.
   * Prioridad: localStorage > Idioma del navegador > Idioma por defecto (es).
   */
  private initializeLanguage() {
    const savedLang = this.getSavedLanguage();
    if (savedLang) {
      this.setLanguage(savedLang);
    } else {
      const browserLang = this.detectBrowserLanguage();
      this.setLanguage(browserLang);
    }
  }

  /**
   * Cambia el idioma actual de la aplicación.
   * @param lang Identificador del idioma (ej. 'es', 'en').
   */
  setLanguage(lang: Language) {
    if (this.AVAILABLE_LANGUAGES.includes(lang)) {
      this.currentLangSubject.next(lang);
      this.translateService.use(lang);
      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, lang);
      }
    }
  }

  /**
   * Obtiene el código del idioma actual.
   */
  getCurrentLang(): Language {
    return this.currentLangSubject.value;
  }

  /**
   * Recupera el idioma guardado en el navegador.
   */
  private getSavedLanguage(): Language | null {
    if (!this.isBrowser) {
      return null;
    }
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return this.isValidLanguage(saved) ? (saved as Language) : null;
  }

  /**
   * Intenta detectar el idioma preferido del usuario desde el navegador.
   */
  private detectBrowserLanguage(): Language {
    if (!this.isBrowser) {
      return this.DEFAULT_LANGUAGE;
    }
    const browserLang = navigator.language.split('-')[0];
    return this.isValidLanguage(browserLang)
      ? (browserLang as Language)
      : this.DEFAULT_LANGUAGE;
  }

  /**
   * Verifica si un código de idioma está soportado por la aplicación.
   */
  private isValidLanguage(lang: string | null): boolean {
    return !!lang && this.AVAILABLE_LANGUAGES.includes(lang as Language);
  }
}
