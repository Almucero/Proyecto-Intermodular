/**
 * @file: src/app/pages/admin/admin.component.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Componente principal del panel de administración.
 */

import { Component, HostListener, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';

/**
 * Componente principal del panel de administración.
 * Actúa como contenedor para las diferentes secciones de gestión (juegos, géneros, plataformas, etc.)
 * y maneja la sesión administrativa.
 */
@Component({
  selector: 'app-admin',
  imports: [RouterModule, TranslatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  /** Servicio para la gestión de autenticación y sesión del usuario. */
  private auth = inject(BaseAuthenticationService);
  /** Servicio de enrutamiento para la navegación entre páginas. */
  private router = inject(Router);
  /** Identificador de la plataforma actual (navegador o servidor) para compatibilidad con SSR. */
  private platformId = inject(PLATFORM_ID);
  /** Indica si el panel de administración debe mostrar la vista optimizada para escritorio (ancho >= 1024px). */
  isDesktopAdminView = true;

  /**
   * Inicialización del componente de administración.
   */
  ngOnInit(): void {
    this.updateViewportMode();
  }

  /** Escucha el evento de cambio de tamaño de la ventana para actualizar el modo de visualización del panel. */
  @HostListener('window:resize')
  onResize() {
    this.updateViewportMode();
  }

  /**
   * Determina y actualiza si la vista actual debe comportarse como escritorio.
   * Evita fallos de SSR comprobando si se está ejecutando en el navegador.
   */
  private updateViewportMode() {
    if (!isPlatformBrowser(this.platformId)) {
      this.isDesktopAdminView = true;
      return;
    }
    this.isDesktopAdminView = window.innerWidth >= 1024;
  }

  /**
   * Cierra la sesión del administrador y redirige a la página de inicio de sesión.
   */
  onLogout() {
    this.auth.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
