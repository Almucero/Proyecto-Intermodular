import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Componente de la página de Ayuda / FAQ.
 * Resuelve dudas comunes y guía al usuario en el uso de la plataforma.
 */
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
})
export class HelpComponent {}
