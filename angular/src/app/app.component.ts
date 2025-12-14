import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ErrorToastComponent } from './shared/components/error-toast/error-toast.component';
import { LanguageService } from './core/services/language.service';
import { BaseAuthenticationService } from './core/services/impl/base-authentication.service';
import { routeFadeAnimation } from './animations/route-fade.animation';
import { forkJoin, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { loadingAnimation } from './animations/loading.animation';
import { revealAnimation } from './animations/reveal.animation';
import { headerRevealAnimation } from './animations/header-reveal.animation';

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
  title = 'GameSage';
  public isLoading = true;
  public exitAnimationDuration = '800ms';
  private startTime = Date.now();

  public isHomePage = false;

  private authService = inject(BaseAuthenticationService);
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor() {
    this.authService.autoLogin();

    this.authService.autoLogin();

    const minWait$ = timer(2000);
    const authCheck$ = this.authService.ready$.pipe(
      filter((isReady) => isReady),
      take(1)
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

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
      });
  }

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
}
