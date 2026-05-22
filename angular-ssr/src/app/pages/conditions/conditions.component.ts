/**
 * @file: src/app/pages/conditions/conditions.component.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Componente de la página de Términos y Condiciones.
 */

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
export class ConditionsComponent { }
