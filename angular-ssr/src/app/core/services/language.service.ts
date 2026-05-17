import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

/** Idiomas soportados por la aplicación para i18n y persistencia local. */
export type Language = 'es' | 'en' | 'de' | 'fr' | 'it';

/**
 * Servicio para la gestión de la internacionalización y el cambio de idioma.
 * Soporta persistencia en localStorage y detección automática del idioma del navegador.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  /** Propiedad no documentada. */
    private translateService = inject(TranslateService);
  /** Propiedad no documentada. */
    private platformId = inject(PLATFORM_ID);
  /** Propiedad no documentada. */
    private isBrowser = isPlatformBrowser(this.platformId);

  /** Propiedad no documentada. */
    private readonly STORAGE_KEY = 'app-language';
  /** Propiedad no documentada. */
    private readonly AVAILABLE_LANGUAGES: Language[] = [
    'es',
    'en',
    'de',
    'fr',
    'it',
  ];
  /** Propiedad no documentada. */
    private readonly DEFAULT_LANGUAGE: Language = 'es';

  /** BehaviorSubject que mantiene el idioma actual. */
  private currentLangSubject = new BehaviorSubject<Language>(
    this.DEFAULT_LANGUAGE,
  );
  /** Observable para suscribirse a los cambios de idioma. */
  currentLang$ = this.currentLangSubject.asObservable();

  /** BehaviorSubject que indica si hay una transición de cambio de idioma en progreso. */
  private isChangingSubject = new BehaviorSubject<boolean>(false);
  /** Observable para suscribirse al estado de cambio de idioma en progreso. */
  isChanging$ = this.isChangingSubject.asObservable();

  /** Constructor no documentado. */
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
      this.setLanguage(savedLang, true);
    } else {
      const browserLang = this.detectBrowserLanguage();
      this.setLanguage(browserLang, true);
    }
  }

  /**
   * Cambia el idioma actual de la aplicación.
   * @param lang Identificador del idioma (ej. 'es', 'en').
   * @param forceImmediate Si es true, el cambio se ejecuta inmediatamente sin transiciones graduales.
   */
  setLanguage(lang: Language, forceImmediate: boolean = false) {
    if (this.AVAILABLE_LANGUAGES.includes(lang)) {
      if (this.currentLangSubject.value === lang) {
        return;
      }

      if (forceImmediate || !this.isBrowser) {
        this.currentLangSubject.next(lang);
        this.translateService.use(lang);
        if (this.isBrowser) {
          localStorage.setItem(this.STORAGE_KEY, lang);
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `app-language=${encodeURIComponent(lang)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
        }
      } else {
        this.isChangingSubject.next(true);

        setTimeout(() => {
          this.currentLangSubject.next(lang);
          this.translateService.use(lang);
          localStorage.setItem(this.STORAGE_KEY, lang);
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `app-language=${encodeURIComponent(lang)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;

          setTimeout(() => {
            this.isChangingSubject.next(false);
          }, 120);
        }, 180);
      }
    }
  }

  /**
   * Obtiene el código del idioma actual.
     * @returns Retorno no documentado.
     */
  getCurrentLang(): Language {
    return this.currentLangSubject.value;
  }

  /**
   * Recupera el idioma guardado en el navegador.
     * @returns Retorno no documentado.
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
     * @returns Retorno no documentado.
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
     * @param lang Parámetro no documentado.
     * @returns Retorno no documentado.
     */
  private isValidLanguage(lang: string | null): boolean {
    return !!lang && this.AVAILABLE_LANGUAGES.includes(lang as Language);
  }
}
