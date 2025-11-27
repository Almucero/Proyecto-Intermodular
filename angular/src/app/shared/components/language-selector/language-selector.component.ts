import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Language, LanguageService } from './../../../core/services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent {
  private languageService = inject(LanguageService);
  
  isLangMenuOpen = false;

  languages: { code: Language; flag: string; name: string }[] = [
    { code: 'es', flag: 'assets/flags/espana.png', name: 'Español' },
    { code: 'en', flag: 'assets/flags/estados-unidos.png', name: 'English' },
    { code: 'de', flag: 'assets/flags/alemania.png', name: 'Deutsch' },
    { code: 'fr', flag: 'assets/flags/francia.png', name: 'Français' },
    { code: 'it', flag: 'assets/flags/italia.png', name: 'Italiano' }
  ];

  get currentFlag(): string {
    const current = this.languages.find(l => l.code === this.languageService.getCurrentLang());
    return current ? current.flag : 'assets/flags/espana.png';
  }

  get currentLanguageName(): string {
    const current = this.languages.find(l => l.code === this.languageService.getCurrentLang());
    return current ? current.name : 'Español';
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  setLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
    this.isLangMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-language-selector')) {
      this.isLangMenuOpen = false;
    }
  }
}
