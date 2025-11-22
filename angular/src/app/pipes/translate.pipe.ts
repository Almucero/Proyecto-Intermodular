import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../core/services/language.service';

@Pipe({
  name: 'translate',
  pure: false // Impure to detect changes in the service without input changes
})
export class TranslatePipe implements PipeTransform {
  constructor(private languageService: LanguageService) {}

  transform(key: string): string {
    return this.languageService.translate(key);
  }
}