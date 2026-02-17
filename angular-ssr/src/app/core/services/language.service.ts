import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export type Language = 'es' | 'en' | 'de' | 'fr' | 'it';

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

  private currentLangSubject = new BehaviorSubject<Language>(
    this.DEFAULT_LANGUAGE,
  );
  currentLang$ = this.currentLangSubject.asObservable();

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage() {
    const savedLang = this.getSavedLanguage();
    if (savedLang) {
      this.setLanguage(savedLang);
    } else {
      const browserLang = this.detectBrowserLanguage();
      this.setLanguage(browserLang);
    }
  }

  setLanguage(lang: Language) {
    if (this.AVAILABLE_LANGUAGES.includes(lang)) {
      this.currentLangSubject.next(lang);
      this.translateService.use(lang);
      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, lang);
      }
    }
  }

  getCurrentLang(): Language {
    return this.currentLangSubject.value;
  }

  private getSavedLanguage(): Language | null {
    if (!this.isBrowser) {
      return null;
    }
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return this.isValidLanguage(saved) ? (saved as Language) : null;
  }

  private detectBrowserLanguage(): Language {
    if (!this.isBrowser) {
      return this.DEFAULT_LANGUAGE;
    }
    const browserLang = navigator.language.split('-')[0];
    return this.isValidLanguage(browserLang)
      ? (browserLang as Language)
      : this.DEFAULT_LANGUAGE;
  }

  private isValidLanguage(lang: string | null): boolean {
    return !!lang && this.AVAILABLE_LANGUAGES.includes(lang as Language);
  }
}
