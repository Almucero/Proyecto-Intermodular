import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Componente que muestra los Términos y Condiciones de uso de la plataforma.
 * Contenido estático legal descriptivo.
 */
@Component({
  selector: 'app-conditions',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './conditions.component.html',
  styleUrl: './conditions.component.scss',
})
export class ConditionsComponent {}
