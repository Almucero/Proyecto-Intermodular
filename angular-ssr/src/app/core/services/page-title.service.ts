import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  private readonly brand = 'GameSage';
  private currentUrl = '/';
  private currentProductTitle: string | null = null;

  constructor(
    private title: Title,
    private translateService: TranslateService,
  ) {
    this.translateService.onLangChange.subscribe(() => {
      this.apply();
    });
  }

  updateFromRoute(url: string): void {
    this.currentUrl = this.normalizeUrl(url);
    if (!this.isProductRoute(this.currentUrl)) {
      this.currentProductTitle = null;
    }
    this.apply();
  }

  setProductTitle(productTitle: string): void {
    this.currentProductTitle = productTitle?.trim() || null;
    this.apply();
  }

  refresh(): void {
    this.apply();
  }

  private apply(): void {
    const key = this.resolveRouteTitleKey(this.currentUrl);
    if (this.isProductRoute(this.currentUrl) && this.currentProductTitle) {
      const productLabel = this.translateOrDefault('pageTitle.product', 'Producto');
      this.title.setTitle(
        `${this.brand} - ${this.currentProductTitle} | ${productLabel}`,
      );
      this.translateAsync('pageTitle.product', 'Producto', (resolvedProductLabel) => {
        this.title.setTitle(
          `${this.brand} - ${this.currentProductTitle} | ${resolvedProductLabel}`,
        );
      });
      return;
    }

    const pageTitle = this.translateOrDefault(key, 'Inicio');
    this.title.setTitle(`${this.brand} - ${pageTitle}`);
    this.translateAsync(key, 'Inicio', (resolvedTitle) => {
      this.title.setTitle(`${this.brand} - ${resolvedTitle}`);
    });
  }

  private resolveRouteTitleKey(url: string): string {
    if (url === '/' || url === '') return 'pageTitle.home';
    if (url.startsWith('/login')) return 'pageTitle.login';
    if (url.startsWith('/register')) return 'pageTitle.register';
    if (url.startsWith('/dashboard')) return 'pageTitle.dashboard';
    if (url.startsWith('/product/')) return 'pageTitle.product';
    if (url.startsWith('/aichat')) return 'pageTitle.aichat';
    if (url.startsWith('/favourites')) return 'pageTitle.favourites';
    if (url.startsWith('/cart')) return 'pageTitle.cart';
    if (url.startsWith('/settings')) return 'pageTitle.settings';
    if (url.startsWith('/help')) return 'pageTitle.help';
    if (url.startsWith('/contact')) return 'pageTitle.contact';
    if (url.startsWith('/privacy')) return 'pageTitle.privacy';
    if (url.startsWith('/conditions')) return 'pageTitle.conditions';
    if (url.startsWith('/cookies')) return 'pageTitle.cookies';
    if (url.startsWith('/search')) return 'pageTitle.search';
    if (url.startsWith('/admin/genres')) return 'pageTitle.adminGenres';
    if (url.startsWith('/admin/developers')) return 'pageTitle.adminDevelopers';
    if (url.startsWith('/admin/platforms')) return 'pageTitle.adminPlatforms';
    if (url.startsWith('/admin/publishers')) return 'pageTitle.adminPublishers';
    if (url.startsWith('/admin/games')) return 'pageTitle.adminGames';
    if (url.startsWith('/admin')) return 'pageTitle.admin';
    return 'pageTitle.home';
  }

  private translateOrDefault(key: string, defaultValue: string): string {
    const value = this.translateService.instant(key);
    if (typeof value === 'string' && value !== key) {
      return value;
    }
    return defaultValue;
  }

  private translateAsync(
    key: string,
    defaultValue: string,
    callback: (value: string) => void,
  ): void {
    this.translateService
      .get(key)
      .pipe(take(1))
      .subscribe({
        next: (value) => {
          if (typeof value === 'string' && value !== key) {
            callback(value);
            return;
          }
          callback(defaultValue);
        },
        error: () => {
          callback(defaultValue);
        },
      });
  }

  private isProductRoute(url: string): boolean {
    return url.startsWith('/product/');
  }

  private normalizeUrl(url: string): string {
    const noHash = (url || '').split('#')[0];
    const noQuery = noHash.split('?')[0];
    if (!noQuery) return '/';
    return noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
  }
}
