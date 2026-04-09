import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SanitizeHtmlPipe } from '../../pipes/sanitize-html.pipe';

/**
 * Componente informativo sobre la política de Cookies.
 * Detalla el uso de cookies propias y de terceros en la aplicación.
 */
@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule, TranslateModule, SanitizeHtmlPipe],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.scss',
})
export class CookiesComponent {}
