import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Componente de Ajustes de la aplicación.
 * Permite al usuario configurar preferencias generales del sistema.
 */
@Component({
  selector: 'app-settings',
  imports: [RouterModule, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  /**
   * Inicialización del componente de ajustes.
   */
  ngOnInit(): void {}
}
