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
  private auth = inject(BaseAuthenticationService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  isDesktopAdminView = true;

  /**
   * Inicialización del componente de administración.
   */
  ngOnInit(): void {
    this.updateViewportMode();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewportMode();
  }

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
