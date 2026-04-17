import {
  Component,
  inject,
  ChangeDetectorRef,
  effect,
  PLATFORM_ID,
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ErrorToastComponent } from './shared/components/error-toast/error-toast.component';
import { BaseAuthenticationService } from './core/services/impl/base-authentication.service';
import { routeFadeAnimation } from './animations/route-fade.animation';
import { UiStateService } from './core/services/impl/ui-state.service';
import { forkJoin, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { loadingAnimation } from './animations/loading.animation';
import { revealAnimation } from './animations/reveal.animation';
import { headerRevealAnimation } from './animations/header-reveal.animation';
import { PageTitleService } from './core/services/page-title.service';

/**
 * Componente raíz de la aplicación GameSage.
 * Gestiona el estado global inicial, la carga (loading screen), el login automático,
 * y las animaciones de transición entre rutas.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ErrorToastComponent,
    HeaderComponent,
    FooterComponent,
    LoadingComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    routeFadeAnimation,
    loadingAnimation,
    revealAnimation,
    headerRevealAnimation,
  ],
})
export class AppComponent {
  /** Título de la aplicación. */
  title = 'GameSage';
  /** Controla la visibilidad de la pantalla de carga inicial. */
  public isLoading = true;
  /** Duración de la animación de salida del loader. */
  public exitAnimationDuration = '800ms';
  /** Marca de tiempo de inicio para calcular el tiempo de carga. */
  private startTime = Date.now();

  /** Indica si la ruta actual es la página de inicio. */
  public isHomePage = false;

  private authService = inject(BaseAuthenticationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private uiState = inject(UiStateService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private pageTitleService = inject(PageTitleService);

  /**
   * Inicializa la aplicación, gestiona el auto-login y el estado de la pantalla de carga.
   */
  constructor() {
    this.authService.autoLogin();

    if (isPlatformBrowser(this.platformId)) {
      const minWait$ = timer(2000);
      const authCheck$ = this.authService.ready$.pipe(
        filter((isReady) => isReady),
        take(1),
      );

      forkJoin([minWait$, authCheck$]).subscribe(() => {
        const elapsedTime = Date.now() - this.startTime;
        if (elapsedTime < 200) {
          this.exitAnimationDuration = '0ms';
          this.cdr.detectChanges();
        }

        window.scrollTo(0, 0);
        this.isLoading = false;
      });
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo(0, 0);
        }
        this.pageTitleService.updateFromRoute(this.router.url);
      });

    this.pageTitleService.updateFromRoute(this.router.url);

    /**
     * Sincroniza el scroll del body con el estado del menú hamburguesa (mobile).
     */
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      if (this.uiState.isMenuOpen()) {
        this.document.body.style.overflow = 'hidden';
      } else {
        this.document.body.style.overflow = '';
      }
    });
  }

  /**
   * Prepara los datos de animación para la ruta activa.
   * @param outlet Salida de enrutado activa.
   */
  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
}
