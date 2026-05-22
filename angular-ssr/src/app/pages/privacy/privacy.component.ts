/**
 * @file: src/app/pages/privacy/privacy.component.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Componente de la página de Política de Privacidad.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SanitizeHtmlPipe } from '../../pipes/sanitize-html.pipe';

/**
 * Componente que presenta la Política de Privacidad del sitio.
 * Contenido legal sobre el tratamiento de datos personales de los usuarios.
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, TranslatePipe, SanitizeHtmlPipe],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss',
})
export class PrivacyComponent { }
