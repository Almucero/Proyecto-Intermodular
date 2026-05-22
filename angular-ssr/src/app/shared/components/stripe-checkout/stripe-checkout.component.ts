/**
 * @file: src/app/shared/components/stripe-checkout/stripe-checkout.component.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Componente para el checkout de Stripe.
 */

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

/**
 * Modal de checkout Stripe embebido para compra de carrito o compra directa.
 */
@Component({
  selector: 'app-stripe-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './stripe-checkout.component.html',
  styleUrl: './stripe-checkout.component.scss',
})
export class StripeModalComponent implements OnChanges, OnDestroy {
  /** Controla la visibilidad del modal de checkout de Stripe. */
  @Input() open = false;
  /** Clave de traducción para el título del modal (por ejemplo, para el carrito o compra directa). */
  @Input() titleKey = 'cart.buy';
  /** Datos de compra directa (juego, plataforma, etc.). Si es null, se procesará el carrito completo. */
  @Input() directCheckoutPayload: DirectCheckoutSessionPayload | null = null;
  /** Evento emitido al cerrarse el modal de checkout. */
  @Output() closed = new EventEmitter<void>();
  /** Evento emitido tras completarse la transacción de pago exitosamente en Stripe. */
  @Output() completed = new EventEmitter<void>();

  /** Signal que indica si la sesión de checkout se está cargando. */
  checkoutLoading = signal(false);
  /** Signal que indica si la interfaz embebida de Stripe ya se cargó e inicializó. */
  checkoutEmbeddedReady = signal(false);
  /** Signal para mostrar un gradiente superior de desvanecimiento cuando hay scroll vertical. */
  showCheckoutTopFade = signal(false);
  /** Signal para mostrar un gradiente inferior de desvanecimiento cuando queda contenido por scroll. */
  showCheckoutBottomFade = signal(false);
  /** Altura medida del cabecera de la aplicación para calcular el espacio disponible. */
  checkoutHeaderHeight = signal(64);
  /** Altura medida del pie de página de la aplicación para ajustar el responsive. */
  checkoutFooterHeight = signal(64);
  /** Altura estática bloqueada para el modal al cargarse. */
  checkoutModalHeight = signal<number | null>(null);
  /** Signal que almacena un mensaje de error si la inicialización de Stripe falla. */
  error = signal<string | null>(null);

  /** Instancia de la interfaz embebida de Stripe Checkout. */
  private embeddedCheckout: StripeEmbeddedCheckout | null = null;
  /** Token incremental para invalidar peticiones asíncronas de inicialización de Stripe antiguas. */
  private checkoutInitToken = 0;
  /** Indica si la plataforma de ejecución actual es el navegador. */
  private readonly isBrowser: boolean;
  /** Estilo de overflow original del body antes de bloquear el scroll. */
  private originalBodyOverflow = '';
  /** Función callback ejecutada al cambiar el tamaño de ventana. */
  private readonly onResize = () => {
    if (!this.open) return;
    this.updateCheckoutLayoutMetrics();
  };
  /** Identificador único asignado al contenedor DOM donde se monta Stripe. */
  private readonly embeddedContainerId = `stripe-checkout-embedded-${Math.random().toString(36).slice(2)}`;

  /**
   * Inicializa el componente e inyecta los servicios necesarios.
   * @param cartItemService Servicio para gestionar ítems de carrito y creación de sesiones de pago.
   * @param languageService Servicio para detectar y configurar el idioma activo.
   * @param document Referencia al objeto global Document.
   * @param platformId Token identificador de plataforma de Angular.
   */
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

  /**
   * Reacciona a cambios en los inputs del componente, iniciando el checkout de Stripe si se abre.
   * @param changes Cambios detectados en las propiedades de entrada.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) return;
    if (this.open) {
      this.startCheckout();
      return;
    }
    this.closeInternal();
  }

  /**
   * Destruye el componente liberando la sesión y quitando listeners del DOM.
   */
  ngOnDestroy(): void {
    this.closeInternal();
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onResize);
    }
  }

  /**
   * Solicita el cierre del modal de checkout, emitiendo el evento de cerrado.
   */
  requestClose(): void {
    this.closeInternal();
    this.closed.emit();
  }

  /**
   * Manejador de evento scroll en el contenedor embebido de Stripe para actualizar las sombras visuales.
   */
  onCheckoutEmbedScroll(): void {
    this.updateCheckoutEmbedFadeState();
  }

  /**
   * Obtiene el identificador dinámico de contenedor DOM de Stripe.
   * @returns El string identificador único del contenedor.
   */
  getEmbeddedContainerId(): string {
    return this.embeddedContainerId;
  }

  /**
   * Crea una nueva sesión de checkout (directa o de carrito), carga e inicializa la pasarela embebida de Stripe.
   */
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

  /**
   * Cierra y libera la sesión activa y restaura el estado y scrolls del modal.
   */
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

  /**
   * Bloquea o desbloquea el scroll del cuerpo de la página web (body).
   * @param locked Booleano de estado de bloqueo.
   */
  private setPageScrollLocked(locked: boolean): void {
    if (!this.isBrowser) return;
    if (locked) {
      this.originalBodyOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
      return;
    }
    this.document.body.style.overflow = this.originalBodyOverflow || '';
  }

  /**
   * Calcula las dimensiones del encabezado y pie de página de la aplicación para posicionar el modal.
   */
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

  /**
   * Ajusta dinámicamente el tamaño del modal bloqueando su altura en px para evitar redimensionamientos abruptos.
   */
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

  /**
   * Espera a que el iframe embebido de Stripe aparezca en el DOM y se cargue para fluidificar la transición visual.
   * @returns Promesa que se resuelve cuando el iframe de Stripe está listo.
   */
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

  /**
   * Restablece la posición de scroll a la parte superior de todos los contenedores anidados del checkout.
   */
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

  /**
   * Configura una corrección única del scroll del contenedor del checkout embebido.
   */
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

  /**
   * Evalúa la posición actual del scroll del checkout para determinar si se deben renderizar
   * los efectos de desvanecimiento superior e inferior.
   */
  private updateCheckoutEmbedFadeState(): void {
    if (!this.isBrowser) return;
    const shell = this.document.querySelector('.checkout-embed-shell');
    if (!(shell instanceof HTMLElement)) return;
    const maxScrollTop = Math.max(shell.scrollHeight - shell.clientHeight, 0);
    const currentTop = Math.max(shell.scrollTop, 0);
    this.showCheckoutTopFade.set(currentTop > 2);
    this.showCheckoutBottomFade.set(currentTop < maxScrollTop - 2);
  }

  /**
   * Confirma la sesión del checkout en el backend tras el pago y actualiza el contador de ítems del carrito.
   * @param sessionId Identificador de la sesión de Stripe a finalizar.
   */
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

  /**
   * Resuelve el código de localización compatible con Stripe basado en el idioma de la aplicación.
   * @returns Código de lenguaje compatible (ej. 'es', 'en', 'fr') o 'auto'.
   */
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

  /**
   * Valida la estructura de la respuesta asíncrona de la sesión de checkout de Stripe.
   * @param value Objeto de respuesta indeterminado.
   * @returns True si el objeto cumple con la interfaz CheckoutSessionResponse, de lo contrario false.
   */
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
