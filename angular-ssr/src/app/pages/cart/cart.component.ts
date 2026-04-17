import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartItemService } from '../../core/services/impl/cart-item.service';
import { MediaService } from '../../core/services/impl/media.service';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { CartItem } from '../../core/models/cart-item.model';
import { Media } from '../../core/models/media.model';
import { firstValueFrom } from 'rxjs';
import { StripeEmbeddedCheckout, loadStripe } from '@stripe/stripe-js';
import type { CheckoutSessionResponse } from '../../core/services/impl/cart-item.service';
import { LanguageService } from '../../core/services/language.service';
import { LocalizedCurrencyPipe } from '../../shared/pipes/localized-currency.pipe';

/**
 * Componente de la página del Carrito de Compras.
 * Permite gestionar los artículos seleccionados, ajustar cantidades,
 * eliminar productos y proceder al pago (checkout).
 */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, LocalizedCurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {
  /** Lista de artículos en el carrito del usuario. */
  cartItems = signal<CartItem[]>([]);
  /** Indica si los datos están en proceso de carga. */
  loading = signal(true);
  /** Almacena mensajes de error en caso de fallo en las peticiones. */
  error = signal<string | null>(null);
  /** Estado de autenticación del usuario actual. */
  isAuthenticated = signal(false);
  checkoutModalOpen = signal(false);
  checkoutLoading = signal(false);
  checkoutEmbeddedReady = signal(false);
  showCheckoutTopFade = signal(false);
  showCheckoutBottomFade = signal(false);
  checkoutHeaderHeight = signal(64);
  checkoutFooterHeight = signal(64);
  checkoutModalHeight = signal<number | null>(null);
  private checkoutHandled = false;
  private embeddedCheckout: StripeEmbeddedCheckout | null = null;
  private checkoutInitToken = 0;
  private readonly isBrowser: boolean;
  private originalBodyOverflow = '';
  private readonly checkoutOuterGap = 12;
  private readonly onResize = () => {
    if (!this.checkoutModalOpen()) return;
    this.updateCheckoutLayoutMetrics();
  };

  constructor(
    private cartItemService: CartItemService,
    private mediaService: MediaService,
    private authService: BaseAuthenticationService,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Inicializa el componente verificando la sesión del usuario.
   * Si está autenticado, procede a cargar el contenido del carrito.
   */
  ngOnInit() {
    this.authService.authenticated$.subscribe((isAuth) => {
      this.isAuthenticated.set(isAuth);
      if (isAuth) {
        this.handleCheckoutReturn().finally(() => {
          this.loadCart();
        });
      } else {
        this.loading.set(false);
      }
    });
    if (this.isBrowser) {
      window.addEventListener('resize', this.onResize, { passive: true });
    }
  }

  ngOnDestroy() {
    this.closeCheckoutModal();
    this.setPageScrollLocked(false);
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onResize);
    }
  }

  private async handleCheckoutReturn() {
    if (this.checkoutHandled) return;
    this.checkoutHandled = true;
    const paymentState = this.route.snapshot.queryParamMap.get('payment');
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (paymentState === 'success' && sessionId) {
      try {
        await firstValueFrom(this.cartItemService.confirmCheckoutSession(sessionId));
        this.cartItemService.refreshCount();
        this.error.set(null);
      } catch (error) {
        this.error.set('Failed to confirm Stripe payment');
      } finally {
        this.router.navigate([], {
          queryParams: { payment: null, session_id: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
      return;
    }

    if (paymentState === 'cancel') {
      this.router.navigate([], {
        queryParams: { payment: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  /**
   * Obtiene todos los artículos del carrito desde el servicio
   * y enriquece cada elemento con su información multimedia (imágenes).
   */
  loadCart() {
    this.loading.set(true);
    this.error.set(null);

    this.cartItemService.getAll().subscribe({
      next: (cartItems: CartItem[]) => {
        this.mediaService.getAll({}).subscribe({
          next: (allMedia: Media[]) => {
            cartItems.forEach((item) => {
              if (item.game) {
                item.game.media = allMedia.filter(
                  (m) => m.gameId == item.gameId,
                );
              }
            });
            this.cartItems.set(cartItems);
            this.loading.set(false);
          },
          error: () => {
            this.cartItems.set(cartItems);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Failed to load cart');
        this.loading.set(false);
      },
    });
  }

  /**
   * Incrementa en una unidad la cantidad de un artículo específico.
   * @param item El artículo a incrementar.
   */
  async incrementQuantity(item: CartItem) {
    if (!item.gameId || !item.platformId) return;
    try {
      await this.cartItemService
        .updateWithPlatform(item.gameId, item.platformId, item.quantity + 1)
        .toPromise();
      this.cartItems.update((items) =>
        items.map((i) =>
          i.gameId === item.gameId && i.platformId === item.platformId
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      );
    } catch (error) {}
  }

  /**
   * Decrementa en una unidad la cantidad de un artículo.
   * Si la cantidad llega a cero, el artículo se elimina del carrito.
   * @param item El artículo a decrementar.
   */
  async decrementQuantity(item: CartItem) {
    if (!item.gameId || !item.platformId) return;
    if (item.quantity > 1) {
      try {
        await this.cartItemService
          .updateWithPlatform(item.gameId, item.platformId, item.quantity - 1)
          .toPromise();
        this.cartItems.update((items) =>
          items.map((i) =>
            i.gameId === item.gameId && i.platformId === item.platformId
              ? { ...i, quantity: i.quantity - 1 }
              : i,
          ),
        );
      } catch (error) {}
    } else {
      await this.removeFromCart(item);
    }
  }

  /**
   * Elimina permanentemente un artículo del carrito.
   * @param item El artículo a eliminar.
   */
  async removeFromCart(item: CartItem) {
    if (!item.gameId || !item.platformId) return;
    try {
      await this.cartItemService
        .deleteWithPlatform(item.gameId, item.platformId)
        .toPromise();
      this.cartItems.update((items) =>
        items.filter(
          (i) =>
            !(i.gameId === item.gameId && i.platformId === item.platformId),
        ),
      );
    } catch (error) {}
  }

  /**
   * Vacía completamente el carrito de compras del usuario.
   */
  async clearCart() {
    const items = this.cartItems();
    for (const item of items) {
      if (item.gameId && item.platformId) {
        await this.cartItemService
          .deleteWithPlatform(item.gameId, item.platformId)
          .toPromise();
      }
    }
    this.cartItems.set([]);
  }

  /**
   * Calcula el coste total de un artículo multiplicando precio por cantidad.
   * @param item El artículo a calcular.
   */
  getItemTotal(item: CartItem): number {
    const price =
      item.game?.isOnSale && item.game?.salePrice !== null
        ? (item.game.salePrice ?? 0)
        : (item.game?.price ?? 0);
    return price * item.quantity;
  }

  /**
   * Calcula la suma total acumulada de todos los productos en el carrito.
   */
  getTotal(): number {
    return this.cartItems().reduce(
      (sum, item) => sum + this.getItemTotal(item),
      0,
    );
  }

  /** Obtiene la imagen de portada de un artículo del carrito. */
  getGameImage(item: CartItem): string {
    return item.game?.media?.[0]?.url || 'assets/images/ui/placeholder.webp';
  }

  /** Obtiene el nombre del desarrollador o editor del videojuego. */
  getGameDeveloper(item: CartItem): string {
    return (
      item.game?.Developer?.name || item.game?.Publisher?.name || 'Unknown'
    );
  }

  /** Inicia el proceso de finalización de compra. */
  async checkout() {
    if (this.cartItems().length === 0 || !this.isBrowser) return;
    this.closeCheckoutModal();
    const initToken = ++this.checkoutInitToken;
    try {
      this.error.set(null);
      this.checkoutLoading.set(true);
      this.checkoutEmbeddedReady.set(false);
      this.updateCheckoutLayoutMetrics();
      this.checkoutModalOpen.set(true);
      this.setPageScrollLocked(true);
      this.lockCheckoutModalInitialSize();
      const checkoutLocale = this.getStripeCheckoutLocale();
      const response = await firstValueFrom(
        this.cartItemService.createCheckoutSession(checkoutLocale),
      );
      if (!this.isValidCheckoutSessionResponse(response)) {
        throw new Error('Respuesta inválida al crear la sesión de pago');
      }
      const stripe = await loadStripe(response.publishableKey);
      if (!stripe) {
        throw new Error('Stripe no disponible');
      }
      if (typeof stripe.createEmbeddedCheckoutPage !== 'function') {
        throw new Error(
          'Stripe embedded checkout no está disponible en este navegador/runtime',
        );
      }
      const checkout = await stripe.createEmbeddedCheckoutPage({
        clientSecret: response.clientSecret,
        onComplete: async () => {
          await this.finalizeEmbeddedCheckout(response.sessionId);
        },
      });
      if (initToken !== this.checkoutInitToken) {
        checkout.destroy();
        return;
      }
      checkout.mount('#stripe-checkout-embedded');
      this.embeddedCheckout = checkout;
      await this.waitForEmbeddedCheckoutVisible();
      if (initToken !== this.checkoutInitToken || !this.checkoutModalOpen()) {
        this.closeCheckoutModal();
        return;
      }
      this.enableSingleAutoTopCorrection();
      this.resetCheckoutEmbedScroll();
      this.checkoutEmbeddedReady.set(true);
      this.updateCheckoutEmbedFadeState();
      this.checkoutLoading.set(false);
    } catch (error) {
      if (initToken !== this.checkoutInitToken) {
        return;
      }
      this.error.set(
        error instanceof Error
          ? `Failed to initialize Stripe checkout: ${error.message}`
          : 'Failed to initialize Stripe checkout',
      );
      this.checkoutLoading.set(false);
    }
  }

  private getStripeCheckoutLocale(): string {
    const lang = this.languageService.getCurrentLang().toLowerCase();

    const base = lang.split('-')[0];
    const localeMap: Record<string, string> = {
      es: 'es',
      en: 'en',
      fr: 'fr',
      de: 'de',
      it: 'it',
      pt: 'pt',
      nl: 'nl',
    };

    return localeMap[base] ?? 'auto';
  }

  closeCheckoutModal() {
    this.checkoutInitToken++;
    if (this.embeddedCheckout) {
      this.embeddedCheckout.destroy();
      this.embeddedCheckout = null;
    }
    this.checkoutModalOpen.set(false);
    this.checkoutLoading.set(false);
    this.checkoutEmbeddedReady.set(false);
    this.showCheckoutTopFade.set(false);
    this.showCheckoutBottomFade.set(false);
    this.checkoutModalHeight.set(null);
    this.setPageScrollLocked(false);
  }

  private setPageScrollLocked(locked: boolean) {
    if (!this.isBrowser) return;
    if (locked) {
      this.originalBodyOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
      return;
    }
    this.document.body.style.overflow = this.originalBodyOverflow || '';
  }

  private updateCheckoutLayoutMetrics() {
    if (!this.isBrowser) return;
    const header = this.document.querySelector('header');
    const footer = this.document.querySelector('footer');
    const headerHeight =
      header instanceof HTMLElement ? Math.round(header.getBoundingClientRect().height) : 64;
    const footerHeight =
      footer instanceof HTMLElement ? Math.round(footer.getBoundingClientRect().height) : 64;
    this.checkoutHeaderHeight.set(Math.max(headerHeight, 1));
    this.checkoutFooterHeight.set(Math.max(footerHeight, 1));
  }

  private lockCheckoutModalInitialSize() {
    if (!this.isBrowser) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const modal = this.document.querySelector('.checkout-modal-content');
        if (!(modal instanceof HTMLElement)) return;
        const measuredHeight = Math.round(modal.getBoundingClientRect().height);
        if (measuredHeight > 0) {
          this.checkoutModalHeight.set(measuredHeight);
        }
      });
    });
  }

  private waitForEmbeddedCheckoutVisible(): Promise<void> {
    if (!this.isBrowser) return Promise.resolve();
    const container = this.document.getElementById('stripe-checkout-embedded');
    if (!container) return Promise.resolve();
    return new Promise((resolve) => {
      let settled = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let observer: MutationObserver | null = null;

      const finish = () => {
        if (settled) return;
        settled = true;
        if (observer) observer.disconnect();
        if (timeoutId) clearTimeout(timeoutId);
        resolve();
      };

      const bindIframe = (iframe: HTMLIFrameElement) => {
        iframe.addEventListener('load', finish, { once: true });
      };

      const existingIframe = container.querySelector('iframe');
      if (existingIframe instanceof HTMLIFrameElement) {
        bindIframe(existingIframe);
      } else {
        observer = new MutationObserver(() => {
          const iframe = container.querySelector('iframe');
          if (iframe instanceof HTMLIFrameElement) {
            bindIframe(iframe);
          }
        });
        observer.observe(container, { childList: true, subtree: true });
      }

      timeoutId = setTimeout(finish, 4000);
    });
  }

  private resetCheckoutEmbedScroll() {
    if (!this.isBrowser) return;
    const shell = this.document.querySelector('.checkout-embed-shell');
    const frame = this.document.querySelector('.checkout-embed-frame');
    const modal = this.document.querySelector('.checkout-modal-content');
    const embedded = this.document.getElementById('stripe-checkout-embedded');
    const targets = [shell, frame, modal, embedded].filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );

    const scrollToTopAll = () => {
      for (const el of targets) {
        el.scrollTop = 0;
        el.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    scrollToTopAll();
    requestAnimationFrame(() => {
      scrollToTopAll();
      requestAnimationFrame(scrollToTopAll);
      requestAnimationFrame(() => {
        this.updateCheckoutEmbedFadeState();
      });
    });

  }

  private enableSingleAutoTopCorrection() {
    if (!this.isBrowser) return;
    const shell = this.document.querySelector('.checkout-embed-shell');
    if (!(shell instanceof HTMLElement)) return;
    const handleAutoScroll = () => {
      if (shell.scrollTop > 0) {
        shell.scrollTop = 0;
        shell.removeEventListener('scroll', handleAutoScroll);
        this.updateCheckoutEmbedFadeState();
      }
    };
    shell.addEventListener('scroll', handleAutoScroll, { passive: true });
  }

  onCheckoutEmbedScroll() {
    this.updateCheckoutEmbedFadeState();
  }

  private updateCheckoutEmbedFadeState() {
    if (!this.isBrowser) return;
    const shell = this.document.querySelector('.checkout-embed-shell');
    if (!(shell instanceof HTMLElement)) return;
    const maxScrollTop = Math.max(shell.scrollHeight - shell.clientHeight, 0);
    const currentTop = Math.max(shell.scrollTop, 0);
    this.showCheckoutTopFade.set(currentTop > 2);
    this.showCheckoutBottomFade.set(currentTop < maxScrollTop - 2);
  }

  private async finalizeEmbeddedCheckout(sessionId: string) {
    try {
      await firstValueFrom(this.cartItemService.confirmCheckoutSession(sessionId));
      this.cartItemService.refreshCount();
      this.error.set(null);
      this.loadCart();
    } catch (error) {
      this.error.set('Failed to confirm Stripe payment');
    } finally {
      this.closeCheckoutModal();
      this.router.navigate([], {
        queryParams: { payment: null, session_id: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  private isValidCheckoutSessionResponse(
    value: unknown,
  ): value is CheckoutSessionResponse {
    if (!value || typeof value !== 'object') return false;
    const data = value as Record<string, unknown>;
    return (
      typeof data['clientSecret'] === 'string' &&
      typeof data['sessionId'] === 'string' &&
      typeof data['publishableKey'] === 'string'
    );
  }

  /** Navega a la pantalla de inicio de sesión. */
  goToLogin() {
    this.router.navigate(['/login'], {
      state: { navigateTo: this.router.url },
    });
  }

  /** Genera una secuencia para representar el conteo de artículos (uso en UI). */
  get cartItemsCount(): number[] {
    const count = Math.max(this.cartItemService.cartCount$.value ?? 0, 0);
    return Array(count)
      .fill(0)
      .map((x, i) => i + 1);
  }
}
