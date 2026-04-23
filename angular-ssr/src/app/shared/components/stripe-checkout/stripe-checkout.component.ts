import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { StripeEmbeddedCheckout, loadStripe } from '@stripe/stripe-js';
import { LanguageService } from '../../../core/services/language.service';
import {
  CartItemService,
  CheckoutSessionResponse,
  DirectCheckoutSessionPayload,
} from '../../../core/services/impl/cart-item.service';

@Component({
  selector: 'app-stripe-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './stripe-checkout.component.html',
  styleUrl: './stripe-checkout.component.scss',
})
export class StripeModalComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() titleKey = 'cart.buy';
  @Input() directCheckoutPayload: DirectCheckoutSessionPayload | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  checkoutLoading = signal(false);
  checkoutEmbeddedReady = signal(false);
  showCheckoutTopFade = signal(false);
  showCheckoutBottomFade = signal(false);
  checkoutHeaderHeight = signal(64);
  checkoutFooterHeight = signal(64);
  checkoutModalHeight = signal<number | null>(null);
  error = signal<string | null>(null);

  private embeddedCheckout: StripeEmbeddedCheckout | null = null;
  private checkoutInitToken = 0;
  private readonly isBrowser: boolean;
  private originalBodyOverflow = '';
  private readonly onResize = () => {
    if (!this.open) return;
    this.updateCheckoutLayoutMetrics();
  };
  private readonly embeddedContainerId = `stripe-checkout-embedded-${Math.random().toString(36).slice(2)}`;

  constructor(
    private cartItemService: CartItemService,
    private languageService: LanguageService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      window.addEventListener('resize', this.onResize, { passive: true });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) return;
    if (this.open) {
      this.startCheckout();
      return;
    }
    this.closeInternal();
  }

  ngOnDestroy(): void {
    this.closeInternal();
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onResize);
    }
  }

  requestClose(): void {
    this.closeInternal();
    this.closed.emit();
  }

  onCheckoutEmbedScroll(): void {
    this.updateCheckoutEmbedFadeState();
  }

  getEmbeddedContainerId(): string {
    return this.embeddedContainerId;
  }

  private async startCheckout(): Promise<void> {
    if (!this.open || !this.isBrowser) return;
    this.closeInternal();
    const initToken = ++this.checkoutInitToken;
    try {
      this.error.set(null);
      this.checkoutLoading.set(true);
      this.checkoutEmbeddedReady.set(false);
      this.updateCheckoutLayoutMetrics();
      this.setPageScrollLocked(true);
      this.lockCheckoutModalInitialSize();
      const checkoutLocale = this.getStripeCheckoutLocale();
      const payload = this.directCheckoutPayload
        ? { ...this.directCheckoutPayload, locale: checkoutLocale }
        : null;
      const response = await firstValueFrom(
        payload
          ? this.cartItemService.createDirectCheckoutSession(payload)
          : this.cartItemService.createCheckoutSession(checkoutLocale),
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
      if (initToken !== this.checkoutInitToken || !this.open) {
        checkout.destroy();
        return;
      }
      checkout.mount(`#${this.embeddedContainerId}`);
      this.embeddedCheckout = checkout;
      await this.waitForEmbeddedCheckoutVisible();
      if (initToken !== this.checkoutInitToken || !this.open) {
        this.closeInternal();
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

  private closeInternal(): void {
    this.checkoutInitToken++;
    if (this.embeddedCheckout) {
      this.embeddedCheckout.destroy();
      this.embeddedCheckout = null;
    }
    this.checkoutLoading.set(false);
    this.checkoutEmbeddedReady.set(false);
    this.showCheckoutTopFade.set(false);
    this.showCheckoutBottomFade.set(false);
    this.checkoutModalHeight.set(null);
    this.setPageScrollLocked(false);
  }

  private setPageScrollLocked(locked: boolean): void {
    if (!this.isBrowser) return;
    if (locked) {
      this.originalBodyOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
      return;
    }
    this.document.body.style.overflow = this.originalBodyOverflow || '';
  }

  private updateCheckoutLayoutMetrics(): void {
    if (!this.isBrowser) return;
    const header = this.document.querySelector('header');
    const footer = this.document.querySelector('footer');
    const headerHeight =
      header instanceof HTMLElement
        ? Math.round(header.getBoundingClientRect().height)
        : 64;
    const footerHeight =
      footer instanceof HTMLElement
        ? Math.round(footer.getBoundingClientRect().height)
        : 64;
    this.checkoutHeaderHeight.set(Math.max(headerHeight, 1));
    this.checkoutFooterHeight.set(Math.max(footerHeight, 1));
  }

  private lockCheckoutModalInitialSize(): void {
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
    const container = this.document.getElementById(this.embeddedContainerId);
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

  private resetCheckoutEmbedScroll(): void {
    if (!this.isBrowser) return;
    const shell = this.document.querySelector('.checkout-embed-shell');
    const frame = this.document.querySelector('.checkout-embed-frame');
    const modal = this.document.querySelector('.checkout-modal-content');
    const embedded = this.document.getElementById(this.embeddedContainerId);
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

  private enableSingleAutoTopCorrection(): void {
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

  private updateCheckoutEmbedFadeState(): void {
    if (!this.isBrowser) return;
    const shell = this.document.querySelector('.checkout-embed-shell');
    if (!(shell instanceof HTMLElement)) return;
    const maxScrollTop = Math.max(shell.scrollHeight - shell.clientHeight, 0);
    const currentTop = Math.max(shell.scrollTop, 0);
    this.showCheckoutTopFade.set(currentTop > 2);
    this.showCheckoutBottomFade.set(currentTop < maxScrollTop - 2);
  }

  private async finalizeEmbeddedCheckout(sessionId: string): Promise<void> {
    try {
      if (this.directCheckoutPayload) {
        await firstValueFrom(
          this.cartItemService.confirmDirectCheckoutSession(sessionId),
        );
      } else {
        await firstValueFrom(this.cartItemService.confirmCheckoutSession(sessionId));
        this.cartItemService.refreshCount();
      }
      this.error.set(null);
      this.completed.emit();
    } catch (error) {
      this.error.set('Failed to confirm Stripe payment');
    } finally {
      this.requestClose();
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
}
