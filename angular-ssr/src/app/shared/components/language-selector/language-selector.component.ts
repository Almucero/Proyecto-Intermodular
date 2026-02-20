import { Component, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Language,
  LanguageService,
} from './../../../core/services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit {
  private languageService = inject(LanguageService);

  isLangMenuOpen = false;
  isClosing = false;
  displayedFlag = '';
  flagIsChanging = false;

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

  private getFlagFor(code: Language | undefined): string {
    if (!code) return 'assets/flags/espana.png';
    const current = this.languages.find((l) => l.code === code);
    return current ? current.flag : 'assets/flags/espana.png';
  }

  get currentFlag(): string {
    return this.getFlagFor(this.languageService.getCurrentLang());
  }

  get currentLanguageName(): string {
    const current = this.languages.find(
      (l) => l.code === this.languageService.getCurrentLang(),
    );
    return current ? current.name : 'Español';
  }

  get availableLanguages(): { code: Language; flag: string; name: string }[] {
    return this.languages.filter(
      (l) => l.code !== this.languageService.getCurrentLang(),
    );
  }

  toggleLangMenu(): void {
    if (this.isLangMenuOpen) {
      this.closeLangMenu();
    } else {
      this.isLangMenuOpen = true;
      this.isClosing = false;
    }
  }

  closeLangMenu(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.isLangMenuOpen = false;
      this.isClosing = false;
    }, 200);
  }

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-language-selector')) {
      if (this.isLangMenuOpen) {
        this.closeLangMenu();
      }
    }
  }
}
