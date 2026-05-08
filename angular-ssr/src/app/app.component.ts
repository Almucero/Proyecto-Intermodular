import {
  Component,
  inject,
  effect,
  PLATFORM_ID,
} from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  NavigationStart,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { ErrorToastComponent } from './shared/components/error-toast/error-toast.component';
import { BaseAuthenticationService } from './core/services/impl/base-authentication.service';
import { UiStateService } from './core/services/impl/ui-state.service';
import { timer } from 'rxjs';
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
  /** Controla el estado visual del contenedor durante navegación. */
  public isRouteHidden = false;
  /** Propiedad no documentada. */
    public isRouteEntering = false;
  /** Propiedad no documentada. */
    private routeFadeTimer: ReturnType<typeof setTimeout> | null = null;
  /** Propiedad no documentada. */
    private readonly routeFadeDurationMs = 650;
  /** Propiedad no documentada. */
    private pendingInitialRouteReveal = false;
  /** Propiedad no documentada. */
    private shouldAnimateRouteTransition = true;

  /** Propiedad no documentada. */
    private authService = inject(BaseAuthenticationService);
  /** Propiedad no documentada. */
    private router = inject(Router);
  /** Propiedad no documentada. */
    private uiState = inject(UiStateService);
  /** Propiedad no documentada. */
    private platformId = inject(PLATFORM_ID);
  /** Propiedad no documentada. */
    private document = inject(DOCUMENT);
  /** Propiedad no documentada. */
    private pageTitleService = inject(PageTitleService);
  /** Propiedad no documentada. */
    private loadingScreenEnabled = true;
  /** Propiedad no documentada. */
    public headerRevealEnabled = true;

  /**
   * Inicializa la aplicación, gestiona el auto-login y el estado de la pantalla de carga.
   */
  constructor() {
    const requestWantsNoLoader =
      this.document.location?.search?.includes('_skip_loader=1') ?? false;
    if (isPlatformBrowser(this.platformId)) {
      const configEnabled = Boolean(
        (window as any).__APP_CONFIG__?.loadingScreenEnabled,
      );
      const noLoadingScreenClass =
        this.document.documentElement.classList.contains('no-loading-screen');
      this.loadingScreenEnabled =
        configEnabled && !noLoadingScreenClass && !requestWantsNoLoader;
      this.pendingInitialRouteReveal = noLoadingScreenClass;
      if (this.pendingInitialRouteReveal) {
        this.isRouteHidden = true;
      }
    } else {
      this.loadingScreenEnabled = !requestWantsNoLoader;
      this.pendingInitialRouteReveal = requestWantsNoLoader;
      if (this.pendingInitialRouteReveal) {
        this.isRouteHidden = true;
      }
    }
    this.headerRevealEnabled = this.loadingScreenEnabled;
    this.isLoading = this.loadingScreenEnabled;

    if (isPlatformBrowser(this.platformId)) {
      if (!this.loadingScreenEnabled) {
        this.exitAnimationDuration = '0ms';
        window.scrollTo(0, 0);
        this.isLoading = false;
        this.authService.autoLogin(250);
      } else {
        const minWait$ = timer(2000);
        minWait$.subscribe(() => {
          window.scrollTo(0, 0);
          this.isLoading = false;
          this.authService.autoLogin(250);
        });
      }
    } else {
      this.authService.autoLogin();
    }

    this.router.events.subscribe((event) => {
      if (!isPlatformBrowser(this.platformId)) {
        if (event instanceof NavigationEnd) {
          this.pageTitleService.updateFromRoute(this.router.url);
        }
        return;
      }

      if (event instanceof NavigationStart) {
        if (this.routeFadeTimer) {
          clearTimeout(this.routeFadeTimer);
          this.routeFadeTimer = null;
        }

        const currentUrl = this.router.url || '';
        const targetUrl = event.url || '';
        const currentIsAdmin = this.isAdminRoute(currentUrl);
        const targetIsAdmin = this.isAdminRoute(targetUrl);
        this.shouldAnimateRouteTransition = !(currentIsAdmin && targetIsAdmin);

        this.isRouteEntering = false;
        if (this.shouldAnimateRouteTransition) {
          this.isRouteHidden = true;
        } else {
          this.isRouteHidden = false;
        }
      }

      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        this.pageTitleService.updateFromRoute(this.router.url);
        if (
          this.shouldAnimateRouteTransition &&
          this.isRouteHidden &&
          !this.pendingInitialRouteReveal
        ) {
          this.triggerRouteReveal();
        }
      }

      if (event instanceof NavigationCancel || event instanceof NavigationError) {
        if (this.routeFadeTimer) {
          clearTimeout(this.routeFadeTimer);
          this.routeFadeTimer = null;
        }
        this.isRouteHidden = false;
        this.isRouteEntering = false;
      }
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

  /** Método no documentado. */
    private triggerRouteReveal() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!this.isRouteHidden) {
      return;
    }
    if (this.routeFadeTimer) {
      clearTimeout(this.routeFadeTimer);
      this.routeFadeTimer = null;
    }
    this.isRouteEntering = false;
    this.isRouteHidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.isRouteEntering = true;
        this.routeFadeTimer = setTimeout(() => {
          this.isRouteEntering = false;
          this.routeFadeTimer = null;
        }, this.routeFadeDurationMs);
      });
    });
  }

  /** Método no documentado. */
    public onRouteActivated() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!this.isRouteHidden && !this.pendingInitialRouteReveal) {
      return;
    }
    this.pendingInitialRouteReveal = false;
    this.triggerRouteReveal();
  }

  /**
     * Método no documentado.
     * @param url Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    private isAdminRoute(url: string): boolean {
    return /^\/admin(?:\/|$)/.test(url || '');
  }
}
