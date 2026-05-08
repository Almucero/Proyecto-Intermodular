import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

/** Servicio para construir y actualizar el título del documento por ruta/idioma. */
@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  /** Marca fija prefijada en todos los títulos de pestaña. */
  private readonly brand = 'GameSage';
  /** Ruta actual normalizada usada para resolver la traducción del título. */
  private currentUrl = '/';
  /** Título de producto en detalle, cuando aplica. */
  private currentProductTitle: string | null = null;

  /**
       * Documentado.
       * @param title Servicio nativo para actualizar document.title.
       *
       * @param translateService Servicio i18n para resolver textos de título.
       */
  constructor(
    private title: Title,
    private translateService: TranslateService,
  ) {
    this.translateService.onLangChange.subscribe(() => {
      this.apply();
    });
  }

  /**
   * Actualiza el estado de ruta para recalcular el título.
   * @param url URL navegada actual.
   * @returns No devuelve valor.
   */
  updateFromRoute(url: string): void {
    this.currentUrl = this.normalizeUrl(url);
    if (!this.isProductRoute(this.currentUrl)) {
      this.currentProductTitle = null;
    }
    this.apply();
  }

  /**
   * Define el título dinámico de producto en vistas de detalle.
   * @param productTitle Nombre del producto.
   * @returns No devuelve valor.
   */
  setProductTitle(productTitle: string): void {
    this.currentProductTitle = productTitle?.trim() || null;
    this.apply();
  }

  /**
   * Fuerza una recomputación del título actual.
   * @returns No devuelve valor.
   */
  refresh(): void {
    this.apply();
  }

  /** Aplica de forma síncrona/asíncrona el título final del documento. */
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

  /**
   * Resuelve la key i18n según ruta.
   * @param url Ruta normalizada.
   * @returns Clave de traducción de título.
   */
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

  /**
   * Obtiene traducción instantánea con fallback por defecto.
   * @param key Clave i18n.
   * @param defaultValue Texto por defecto.
   * @returns Texto resuelto.
   */
  private translateOrDefault(key: string, defaultValue: string): string {
    const value = this.translateService.instant(key);
    if (typeof value === 'string' && value !== key) {
      return value;
    }
    return defaultValue;
  }

  /**
   * Resuelve traducción asíncrona y notifica por callback.
   * @param key Clave i18n.
   * @param defaultValue Fallback textual.
   * @param callback Callback con texto final.
   * @returns No devuelve valor.
   */
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

  /**
   * Indica si la ruta corresponde a detalle de producto.
   * @param url Ruta normalizada.
   * @returns True si es detalle de producto.
   */
  private isProductRoute(url: string): boolean {
    return url.startsWith('/product/');
  }

  /**
   * Normaliza una URL removiendo hash/query y asegurando slash inicial.
   * @param url URL de entrada.
   * @returns Ruta limpia.
   */
  private normalizeUrl(url: string): string {
    const noHash = (url || '').split('#')[0];
    const noQuery = noHash.split('?')[0];
    if (!noQuery) return '/';
    return noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
  }
}
