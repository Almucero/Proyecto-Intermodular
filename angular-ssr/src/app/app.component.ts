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
import { UiStateService } from './core/services/ui-state.service';
import { timer } from 'rxjs';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { loadingAnimation } from './animations/loading.animation';
import { revealAnimation } from './animations/reveal.animation';
import { headerRevealAnimation } from './animations/header-reveal.animation';
import { PageTitleService } from './core/services/page-title.service';
import { ConfirmNavigationService } from './core/services/confirm-navigation.service';
import { TranslatePipe } from '@ngx-translate/core';

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
    TranslatePipe,
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
  /** Controla la visibilidad de la pantalla de carga inicial. (Ahora usa UiStateService) */
  get isLoading() {
    return this.uiState.isMainLoaderVisible();
  }
  set isLoading(value: boolean) {
    this.uiState.isMainLoaderVisible.set(value);
  }
  /** Duración de la animación de salida del loader. */
  public exitAnimationDuration = '800ms';
  /** Controla el estado visual del contenedor durante navegación. */
  public isRouteHidden = false;
  /** Indica si la ruta está entrando en pantalla (animación de fade-in). */
  public isRouteEntering = false;
  /** Timer de la animación de reveal de ruta. */
  private routeFadeTimer: ReturnType<typeof setTimeout> | null = null;
  /** Duración en ms de la animación de fade de ruta. */
  private readonly routeFadeDurationMs = 650;
  /** Indica si hay un reveal de ruta pendiente del estado inicial. */
  private pendingInitialRouteReveal = false;
  /** Controla si la transición de ruta debe animarse. */
  private shouldAnimateRouteTransition = true;

  private authService = inject(BaseAuthenticationService);
  private router = inject(Router);
  private uiState = inject(UiStateService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private pageTitleService = inject(PageTitleService);
  /** Servicio global del modal de confirmación de navegación con cambios sin guardar. */
  readonly confirmNav = inject(ConfirmNavigationService);
  private loadingScreenEnabled = true;
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
    this.uiState.isMainLoaderVisible.set(this.loadingScreenEnabled);

    if (isPlatformBrowser(this.platformId)) {
      if (!this.loadingScreenEnabled) {
        this.exitAnimationDuration = '0ms';
        window.scrollTo(0, 0);
        this.isLoading = false;
        this.uiState.loaderAnimationDone.set(true);
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
        const currentPath = currentUrl.split('?')[0];
        const targetPath = targetUrl.split('?')[0];
        const isSameRoute = currentPath === targetPath;
        const currentIsAdmin = this.isAdminRoute(currentUrl);
        const targetIsAdmin = this.isAdminRoute(targetUrl);
        this.shouldAnimateRouteTransition = !(currentIsAdmin && targetIsAdmin) && !isSameRoute;

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
      if (!isPlatformBrowser(this.platformId)) return;
      if (this.uiState.isMenuOpen()) {
        this.document.body.style.overflow = 'hidden';
      } else {
        this.document.body.style.overflow = '';
      }
    });

    /**
     * Cuando el guard de cambios sin guardar activa el modal de confirmación,
     * restaura inmediatamente la visibilidad de la ruta para que el contenido
     * de la página no desaparezca mientras el usuario decide si salir o no.
     */
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (this.confirmNav.visible()) {
        if (this.routeFadeTimer) {
          clearTimeout(this.routeFadeTimer);
          this.routeFadeTimer = null;
        }
        this.isRouteHidden = false;
        this.isRouteEntering = false;
      }
    });
  }

  /** Callback que se ejecuta cuando la animación de salida del loader termina completamente. */
  public onLoaderAnimationDone(): void {
    if (this.isLoading) {
      return;
    }
    this.uiState.loaderAnimationDone.set(true);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('gamingsage-home-trigger'));
      }, 100);
    }
  }

  /** Activa la animación de aparición de la nueva ruta tras la navegación. */
  private triggerRouteReveal() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.isRouteHidden) return;
    if (this.routeFadeTimer) {
      clearTimeout(this.routeFadeTimer);
      this.routeFadeTimer = null;
    }
    this.isRouteEntering = false;
    setTimeout(() => {
      this.isRouteHidden = false;
      this.isRouteEntering = true;
      this.routeFadeTimer = setTimeout(() => {
        this.isRouteEntering = false;
        this.routeFadeTimer = null;
      }, this.routeFadeDurationMs);
    }, 16);
  }

  /** Callback de activación de ruta para el reveal de la ruta inicial. */
  public onRouteActivated() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.isRouteHidden && !this.pendingInitialRouteReveal) return;
    this.pendingInitialRouteReveal = false;
    this.triggerRouteReveal();
  }

  /**
   * Determina si una URL pertenece a la sección de administración.
   * @param url La URL a evaluar.
   * @returns `true` si la URL es una ruta de administración.
   */
  private isAdminRoute(url: string): boolean {
    return /^\/admin(?:\/|$)/.test(url || '');
  }
}
