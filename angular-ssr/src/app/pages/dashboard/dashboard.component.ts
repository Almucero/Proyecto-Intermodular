/**
 * @file: src/app/pages/dashboard/dashboard.component.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Componente de la página del dashboard del usuario.
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  computed,
  effect,
  inject,
  signal,
  PLATFORM_ID,
  HostListener,
  Renderer2,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CanComponentDeactivate } from '../../core/guards/can-deactivate.guard';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CopyOnClickDirective } from '../../directives/copy-on-click.directive';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { UserService } from '../../core/services/impl/user.service';
import { MediaService } from '../../core/services/impl/media.service';
import { PurchaseService } from '../../core/services/impl/purchase.service';
import { User } from '../../core/models/user.model';
import { Subscription } from 'rxjs';

/**
 * Componente del Panel de Control (Dashboard) del Usuario.
 * Permite gestionar el perfil personal, direcciones, visualizar compras completadas
 * y solicitar reembolsos.
 */
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslatePipe,
    CopyOnClickDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0px', opacity: 0, overflow: 'hidden' }),
        animate('280ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '0px', opacity: 0 })),
      ]),
    ]),
  ],
})
export class DashboardComponent implements AfterViewInit, OnDestroy, CanComponentDeactivate {
  /** Servicio de autenticación. */
  private auth = inject(BaseAuthenticationService);
  /** Servicio para gestionar datos del usuario. */
  private userService = inject(UserService);
  /** Servicio para subir/eliminar archivos multimedia. */
  private mediaService = inject(MediaService);
  /** Servicio para gestionar compras y reembolsos. */
  private purchaseService = inject(PurchaseService);
  /** Enrutador para navegación. */
  private router = inject(Router);
  /** Identificador de plataforma de Angular. */
  private platformId = inject(PLATFORM_ID);
  /** Servicio para traducción de textos. */
  private translate = inject(TranslateService);
  /** Renderer2 para manipulación segura del DOM. */
  private renderer = inject(Renderer2);
  /** Referencia al documento global del DOM. */
  private document = inject(DOCUMENT);

  /** Indica si el modal de captura de pantalla ampliado está abierto. */
  isScreenshotModalOpen = signal(false);
  /** URL de la captura ampliada en el modal. */
  screenshotModalImage = signal<string | null>(null);
  /** Estado de renderizado inicial del modal. */
  screenshotModalOpen = false;
  /** Estado de finalización de salida del modal. */
  screenshotModalClosing = false;
  /** Duración en ms de la animación del modal. */
  private readonly screenshotModalAnimMs = 160;

  /** Señal que contiene los datos del usuario autenticado. */
  user = toSignal(this.auth.user$);
  /** Señal con la lista de compras completadas satisfactoriamente. */
  purchases = signal<any[]>([]);
  /** Señal con la lista de compras que han sido reembolsadas. */
  returns = signal<any[]>([]);
  /** Límite actual de compras visibles en la lista. */
  purchasesLimit = signal(5);
  /** Límite actual de devoluciones visibles en la lista. */
  returnsLimit = signal(5);
  /** Indica (desde caché) si hay más compras que el límite visible inicial. */
  purchasesHasMore = signal(false);
  /** Indica (desde caché) si hay más devoluciones que el límite visible inicial. */
  returnsHasMore = signal(false);
  /** Indica si se está expandiendo la lista de compras. */
  expandingPurchases = signal(false);
  /** Indica si se está expandiendo la lista de devoluciones. */
  expandingReturns = signal(false);
  /** Indica si se está colapsando la lista de compras. */
  collapsingPurchases = signal(false);
  /** Indica si se está colapsando la lista de devoluciones. */
  collapsingReturns = signal(false);

  /** Indica si se están cargando las compras desde la API. */
  purchasesLoading = signal(true);
  /** Indica si se están cargando las devoluciones desde la API. */
  returnsLoading = signal(true);
  /** Recuento de skeletons a mostrar para compras. */
  purchasesSkeletonCount = signal(0);
  /** Recuento de skeletons a mostrar para devoluciones. */
  returnsSkeletonCount = signal(0);
  /** Recuentos individuales de skeletons para items de cada compra. */
  purchaseItemsSkeletonCounts = signal<number[]>([]);
  /** Recuentos individuales de skeletons para items de cada devolución. */
  returnItemsSkeletonCounts = signal<number[]>([]);

  /** Rango de skeletons de compras computado para renderizado. */
  purchaseSkeletonCards = computed(() =>
    this.buildSkeletonRange(Math.min(this.purchasesSkeletonCount(), this.purchasesLimit())),
  );
  /** Rango de skeletons de devoluciones computado para renderizado. */
  returnSkeletonCards = computed(() =>
    this.buildSkeletonRange(Math.min(this.returnsSkeletonCount(), this.returnsLimit())),
  );
  /** Rango de skeletons de items de compras. */
  purchaseSkeletonItems = computed(() =>
    this.buildSkeletonRange(
      this.purchaseItemsSkeletonCounts().length > 0
        ? Math.round(this.purchaseItemsSkeletonCounts().reduce((a, b) => a + b, 0) / this.purchaseItemsSkeletonCounts().length)
        : 2
    ),
  );
  /** Rango de skeletons de items de devoluciones. */
  returnSkeletonItems = computed(() =>
    this.buildSkeletonRange(
      this.returnItemsSkeletonCounts().length > 0
        ? Math.round(this.returnItemsSkeletonCounts().reduce((a, b) => a + b, 0) / this.returnItemsSkeletonCounts().length)
        : 2
    ),
  );

  /** Indica si el retraso mínimo de visualización de skeletons ha terminado. */
  private minSkeletonDelayDone = signal(false);
  /** Indica si el dashboard se encuentra en estado de carga. */
  dashboardLoading = computed(
    () =>
      !this.minSkeletonDelayDone() ||
      !this.user() ||
      this.purchasesLoading() ||
      this.returnsLoading(),
  );

  /** Controla la visibilidad del modal de solicitud de reembolso. */
  isRefundModalOpen = signal(false);
  /** Almacena el ID de la compra seleccionada para el reembolso. */
  selectedPurchaseId = signal<number | null>(null);
  /** Almacena el motivo del reembolso introducido por el usuario. */
  refundReason = signal('');
  /** Mensaje de error relacionado con el proceso de reembolso. */
  refundError = signal<string | null>(null);

  /** Identificador visual del usuario (ej: @usuario). */
  userHandle = '';
  /** ID interno de la cuenta del usuario. */
  userId = '';

  /** Estructura para gestionar la dirección de envío del usuario. */
  address = {
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
  };

  /** Saldo disponible en la cuenta del usuario (simulado). */
  balance = 0;
  /** Puntos de fidelidad acumulados por el usuario. */
  points = 250;

  /** Indica si el formulario de perfil está en modo edición. */
  isEditing = false;
  /** Copia temporal de los datos del usuario para edición sin afectar al original hasta guardar. */
  editableUser: any = {};

  /** Archivo de imagen seleccionado para la foto de perfil. */
  selectedImageFile: File | null = null;
  /** URL temporal para la previsualización de la nueva imagen de perfil. */
  previewImageUrl: string | null = null;
  /** Referencia de lista de botones de acción para sincronización de tamaño. */
  @ViewChildren('actionSizeButton')
  private actionSizeButtons!: QueryList<ElementRef<HTMLButtonElement>>;
  /** Suscripción a los cambios en la lista de botones de acción. */
  private actionButtonsChangesSubscription?: Subscription;
  /** Suscripción a la carga de compras. */
  private purchasesSubscription?: Subscription;
  /** Suscripción a la carga de devoluciones. */
  private returnsSubscription?: Subscription;
  /** Manejador para el evento resize de la ventana. */
  private readonly resizeHandler = () => this.syncActionButtonsWidth();
  /** Identificador para el temporizador de retardo de skeletons. */
  private skeletonDelayTimeoutId: ReturnType<typeof setTimeout> | null = null;
  /** Clave de caché para guardar el conteo de skeletons de compras. */
  private readonly purchasesSkeletonCacheKey = 'dashboard.purchasesSkeletonCount';
  /** Clave de caché para guardar el conteo de skeletons de devoluciones. */
  private readonly returnsSkeletonCacheKey = 'dashboard.returnsSkeletonCount';
  /** Clave de caché para guardar el conteo de skeletons de items de compras. */
  private readonly purchaseItemsSkeletonCacheKey =
    'dashboard.purchaseItemsSkeletonCount';
  /** Clave de caché para guardar el conteo de skeletons de items de devoluciones. */
  private readonly returnItemsSkeletonCacheKey = 'dashboard.returnItemsSkeletonCount';
  /** Clave de caché que indica si hay más compras que el límite visible. */
  private readonly purchasesHasMoreCacheKey = 'dashboard.purchasesHasMore';
  /** Clave de caché que indica si hay más devoluciones que el límite visible. */
  private readonly returnsHasMoreCacheKey = 'dashboard.returnsHasMore';
  /** Señal que indica la visibilidad de las claves de licencia compradas. */
  private visiblePurchaseKeys = signal<Map<number, boolean>>(new Map());

  /**
   * Obtiene la URL de la imagen de perfil, priorizando la previsualización local,
   * luego la imagen de la cuenta y finalmente un icono por defecto.
   */
  get profileImage(): string {
    if (this.previewImageUrl) {
      return this.previewImageUrl;
    }
    const u = this.user();
    if (u && u.media && u.media.length > 0) {
      return u.media[0].url;
    }
    return 'assets/icons/user.png';
  }

  /**
   * Crea una nueva instancia de DashboardComponent.
   * Inicializa las suscripciones de datos y sincronización de perfil.
   */
  constructor() {
    /**
     * Sincroniza los datos editables cuando cambia el usuario autenticado.
     */
    effect(() => {
      const u = this.user();
      if (u) {
        this.editableUser = { ...u };
        if (u.accountAt) this.userHandle = u.accountAt;
        if (u.accountId) this.userId = u.accountId;
        if (u.addressLine1) this.address.line1 = u.addressLine1;
        if (u.addressLine2) this.address.line2 = u.addressLine2;
        if (u.city) this.address.city = u.city;
        if (u.region) this.address.region = u.region;
        if (u.postalCode) this.address.postalCode = u.postalCode;
        if (u.country) this.address.country = u.country;
      }
    });

    this.loadPurchases();
    this.loadReturns();
    this.startMinimumSkeletonDelay();
    this.loadSkeletonCountsFromCache();
  }

  /**
   * Ciclo de vida que se ejecuta tras inicializar la vista del componente.
   * Configura la sincronización del tamaño de botones y escucha el evento resize de la ventana.
   */
  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.actionButtonsChangesSubscription = this.actionSizeButtons.changes.subscribe(
      () => {
        // Microtask: se ejecuta antes del siguiente pintado del navegador,
        // evitando el flash de un frame con los botones en su ancho natural.
        Promise.resolve().then(() => this.syncActionButtonsWidth());
      },
    );
    window.addEventListener('resize', this.resizeHandler);
    Promise.resolve().then(() => this.syncActionButtonsWidth());
  }

  /**
   * Ciclo de vida que se ejecuta al destruir el componente.
   * Libera escuchas globales de resize y cancela suscripciones activas.
   */
  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    this.actionButtonsChangesSubscription?.unsubscribe();
    this.purchasesSubscription?.unsubscribe();
    this.returnsSubscription?.unsubscribe();
    if (this.skeletonDelayTimeoutId) {
      clearTimeout(this.skeletonDelayTimeoutId);
      this.skeletonDelayTimeoutId = null;
    }
  }

  /**
   * Inicia el retraso mínimo de visualización de skeletons.
   */
  private startMinimumSkeletonDelay() {
    this.minSkeletonDelayDone.set(false);
    this.skeletonDelayTimeoutId = setTimeout(() => {
      this.minSkeletonDelayDone.set(true);
      this.skeletonDelayTimeoutId = null;
    }, 1200);
  }

  /**
   * Genera un array secuencial para renderizar la cantidad correcta de items skeleton en una tarjeta.
   * @param index Índice de la tarjeta.
   * @param type Tipo de datos: 'purchases' o 'returns'.
   * @returns Array de números para iteración en el template.
   */
  getSkeletonItemsForCard(index: number, type: 'purchases' | 'returns'): number[] {
    const countsArray = type === 'purchases' ? this.purchaseItemsSkeletonCounts() : this.returnItemsSkeletonCounts();
    const count = countsArray[index] !== undefined ? countsArray[index] : 1;
    return Array.from({ length: Math.max(1, count) }, (_, i) => i);
  }

  /**
   * Carga las compras completadas del usuario desde el servidor.
   */
  private loadPurchases() {
    this.purchasesLoading.set(true);
    this.purchasesSubscription?.unsubscribe();
    this.purchasesSubscription = this.purchaseService
      .getAll({ status: 'completed' })
      .subscribe({
        next: (data) => {
          this.purchases.set(data);
          const cards = this.normalizeSkeletonCount(data.length, this.purchasesSkeletonCount());
          const itemCounts = data.map(purchase => Array.isArray(purchase.items) ? purchase.items.length : 0);
          this.purchasesSkeletonCount.set(cards);
          this.purchaseItemsSkeletonCounts.set(itemCounts);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.purchasesHasMoreCacheKey, String(data.length > 5));
          }
          this.purchasesHasMore.set(data.length > 5);
          this.persistSkeletonCounts();
          this.purchasesLoading.set(false);
        },
        error: () => {
          this.purchases.set([]);
          this.purchasesSkeletonCount.set(0);
          this.purchaseItemsSkeletonCounts.set([]);
          this.purchasesLoading.set(false);
        },
      });
  }

  /**
   * Carga los reembolsos del usuario desde el servidor.
   */
  private loadReturns() {
    this.returnsLoading.set(true);
    this.returnsSubscription?.unsubscribe();
    this.returnsSubscription = this.purchaseService
      .getAll({ status: 'refunded' })
      .subscribe({
        next: (data) => {
          this.returns.set(data);
          const cards = this.normalizeSkeletonCount(data.length, this.returnsSkeletonCount());
          const itemCounts = data.map(ret => Array.isArray(ret.items) ? ret.items.length : 0);
          this.returnsSkeletonCount.set(cards);
          this.returnItemsSkeletonCounts.set(itemCounts);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.returnsHasMoreCacheKey, String(data.length > 5));
          }
          this.returnsHasMore.set(data.length > 5);
          this.persistSkeletonCounts();
          this.returnsLoading.set(false);
        },
        error: () => {
          this.returns.set([]);
          this.returnsSkeletonCount.set(0);
          this.returnItemsSkeletonCounts.set([]);
          this.returnsLoading.set(false);
        },
      });
  }

  /** Muestra todas las compras y activa el estado de expansión temporal. */
  showMorePurchases() {
    this.expandingPurchases.set(true);
    this.purchasesLimit.set(this.purchases().length);
    setTimeout(() => {
      this.expandingPurchases.set(false);
    }, 800);
  }

  /** Restaura el límite de compras a 5. */
  showLessPurchases() {
    this.collapsingPurchases.set(true);
    this.purchasesLimit.set(5);
    setTimeout(() => {
      this.collapsingPurchases.set(false);
    }, 300);
  }
  /** Muestra todas las devoluciones y activa el estado de expansión temporal. */
  showMoreReturns() {
    this.expandingReturns.set(true);
    this.returnsLimit.set(this.returns().length);
    setTimeout(() => {
      this.expandingReturns.set(false);
    }, 800);
  }

  /** Restaura el límite de devoluciones a 5. */
  showLessReturns() {
    this.collapsingReturns.set(true);
    this.returnsLimit.set(5);
    setTimeout(() => {
      this.collapsingReturns.set(false);
    }, 300);
  }

  /** Activa o desactiva el modo de edición de perfil. */
  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      const currentUser = this.user();
      this.editableUser = { ...currentUser };
    } else {
      this.clearImagePreview();
    }
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.syncActionButtonsWidth(), 0);
    }
  }

  /** Limpia la previsualización de imagen y libera recursos de URL. */
  private clearImagePreview() {
    if (this.previewImageUrl) {
      URL.revokeObjectURL(this.previewImageUrl);
    }
    this.previewImageUrl = null;
    this.selectedImageFile = null;
  }

  /**
   * Guarda los cambios realizados en el perfil.
   * Si se seleccionó una nueva imagen, primero la sube y luego actualiza el usuario.
   */
  saveChanges() {
    const currentUser = this.user();
    if (currentUser && currentUser.id) {
      if (this.selectedImageFile) {
        this.uploadImageThenSaveUser();
      } else {
        this.saveUserData();
      }
    }
  }

  /**
   * Envía la actualización de los datos textuales del usuario al servidor.
   */
  private saveUserData() {
    const updatedUser: Partial<User> = {
      name: this.editableUser.name,
      surname: this.editableUser.surname,
      email: this.editableUser.email,
      nickname: this.editableUser.nickname,
      addressLine1: this.address.line1,
      addressLine2: this.address.line2,
      city: this.address.city,
      region: this.address.region,
      postalCode: this.address.postalCode,
      country: this.address.country,
    };

    this.userService.update('me', updatedUser as User).subscribe({
      next: (user) => {
        this.auth.me().subscribe();
        this.isEditing = false;
        this.clearImagePreview();
      },
      error: () => { },
    });
  }

  /**
   * Gestiona el reemplazo de la imagen de perfil: elimina la antigua y sube la nueva.
   */
  private uploadImageThenSaveUser() {
    const currentUser = this.user();

    if (currentUser?.media && currentUser.media.length > 0) {
      const oldMediaId = currentUser.media[0].id;
      this.mediaService.delete(oldMediaId.toString()).subscribe({
        next: () => this.uploadNewImageThenSaveUser(),
        error: () => this.uploadNewImageThenSaveUser(),
      });
    } else {
      this.uploadNewImageThenSaveUser();
    }
  }

  /**
   * Sube el archivo de imagen seleccionado al servidor.
   */
  private uploadNewImageThenSaveUser() {
    if (!this.selectedImageFile) return;

    this.mediaService.upload(this.selectedImageFile).subscribe({
      next: () => this.saveUserData(),
      error: () => this.saveUserData(),
    });
  }

  /**
   * Maneja el evento de selección de archivo por parte del usuario.
   * @param event Evento del DOM de selección de archivo.
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.clearImagePreview();
      this.selectedImageFile = file;
      this.previewImageUrl = URL.createObjectURL(file);
    }
  }

  /**
   * Cierra la sesión del usuario y redirige al login.
   */
  async onLogout() {
    this.auth.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  /**
   * Abre el modal para solicitar un reembolso de una compra específica.
   * @param purchaseId ID único de la compra.
   */
  openRefundModal(purchaseId: number) {
    this.selectedPurchaseId.set(purchaseId);
    this.refundReason.set('');
    this.refundError.set(null);
    this.isRefundModalOpen.set(true);
  }

  /** Cierra el modal de reembolso y limpia su estado. */
  closeRefundModal() {
    this.isRefundModalOpen.set(false);
    this.selectedPurchaseId.set(null);
    this.refundReason.set('');
    this.refundError.set(null);
  }

  /**
   * Valida y envía la solicitud de reembolso al servidor.
   * Recarga la página tras una operación exitosa para refrescar los datos.
   */
  confirmRefund() {
    const id = this.selectedPurchaseId();
    const reason = this.refundReason();

    if (!id) return;
    if (!reason || reason.trim().length < 10) {
      this.refundError.set('dashboard.reasonTooShort');
      return;
    }

    this.purchaseService.refund(id, reason).subscribe({
      next: () => {
        this.loadPurchases();
        this.loadReturns();
        this.closeRefundModal();
      },
      error: () => {
        this.refundError.set('dashboard.refundError');
      },
    });
  }

  /**
   * Sincroniza el ancho de los botones de acción para que todos tengan el mismo ancho.
   */
  private syncActionButtonsWidth() {
    const buttons =
      this.actionSizeButtons?.toArray().map((btn) => btn.nativeElement) ?? [];
    if (buttons.length === 0) return;
    buttons.forEach((button) => {
      button.style.width = 'auto';
    });
    const maxWidth = Math.max(
      ...buttons.map((button) => Math.ceil(button.getBoundingClientRect().width)),
    );
    buttons.forEach((button) => {
      button.style.width = `${maxWidth}px`;
    });
  }

  /**
   * Construye un array de números para generar skeletons de forma dinámica.
   * @param count Número de skeletons a generar.
   * @returns Array de números.
   */
  private buildSkeletonRange(count: number): number[] {
    return Array.from({ length: Math.max(0, count) }, (_, i) => i + 1);
  }

  /**
   * Normaliza un valor numérico para su uso en contadores de skeleton.
   * @param value Valor a normalizar.
   * @param fallback Valor por defecto si el input no es válido.
   * @returns Valor normalizado.
   */
  private normalizeSkeletonCount(value: number, fallback: number): number {
    if (!Number.isFinite(value)) return Math.max(0, Math.round(fallback));
    return Math.max(0, Math.round(value));
  }

  /**
   * Carga desde localStorage los contadores de skeleton para compras y devoluciones, 
   * incluyendo el número exacto de juegos por cada entrada (array CSV). 
   */
  private loadSkeletonCountsFromCache(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const purchasesCount = Number(localStorage.getItem(this.purchasesSkeletonCacheKey));
    const returnsCount = Number(localStorage.getItem(this.returnsSkeletonCacheKey));

    this.purchasesSkeletonCount.set(
      this.normalizeSkeletonCount(purchasesCount, this.purchasesSkeletonCount()),
    );
    this.returnsSkeletonCount.set(
      this.normalizeSkeletonCount(returnsCount, this.returnsSkeletonCount()),
    );

    const purchaseItemsRaw = localStorage.getItem(this.purchaseItemsSkeletonCacheKey) ?? '';
    const returnItemsRaw = localStorage.getItem(this.returnItemsSkeletonCacheKey) ?? '';

    const parseCsv = (raw: string): number[] =>
      raw
        .split(',')
        .map((v) => parseInt(v, 10))
        .filter((n) => Number.isFinite(n) && n > 0);

    const purchaseItemCounts = parseCsv(purchaseItemsRaw);
    const returnItemCounts = parseCsv(returnItemsRaw);

    if (purchaseItemCounts.length > 0) {
      this.purchaseItemsSkeletonCounts.set(purchaseItemCounts);
    }
    if (returnItemCounts.length > 0) {
      this.returnItemsSkeletonCounts.set(returnItemCounts);
    }

    this.purchasesHasMore.set(
      localStorage.getItem(this.purchasesHasMoreCacheKey) === 'true',
    );
    this.returnsHasMore.set(
      localStorage.getItem(this.returnsHasMoreCacheKey) === 'true',
    );
  }

  /**
   * Persiste en localStorage los contadores de skeletons.
   */
  private persistSkeletonCounts(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(
      this.purchasesSkeletonCacheKey,
      String(this.purchasesSkeletonCount()),
    );
    localStorage.setItem(this.returnsSkeletonCacheKey, String(this.returnsSkeletonCount()));
    localStorage.setItem(
      this.purchaseItemsSkeletonCacheKey,
      this.purchaseItemsSkeletonCounts().join(','),
    );
    localStorage.setItem(
      this.returnItemsSkeletonCacheKey,
      this.returnItemsSkeletonCounts().join(','),
    );
  }

  /**
   * Formatea una fecha de compra según el idioma de la aplicación.
   * @param value Objeto fecha o cadena de fecha.
   * @returns Cadena con la fecha formateada.
   */
  formatPurchaseDate(value: Date | string | null | undefined): string {
    if (!value) return '-';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    const monthNames: Record<string, string[]> = {
      es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      fr: ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'],
      de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
      it: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
    };
    const selectedLang = monthNames[lang] ? lang : 'es';
    const months = monthNames[selectedLang];

    const day = date.getDate();
    const month = months[date.getMonth()] ?? months[0];
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    if (selectedLang === 'en') {
      return `${month} ${day}, ${year}, ${hh}:${mm}:${ss}`;
    }

    return `${day} ${month} ${year}, ${hh}:${mm}:${ss}`;
  }

  /**
   * Comprueba si la clave del juego comprado es visible en la vista.
   * @param itemId ID único del item comprado.
   * @returns `true` si la clave de activación está visible.
   */
  isPurchaseKeyVisible(itemId: number): boolean {
    return this.visiblePurchaseKeys().get(itemId) ?? false;
  }

  /**
   * Alterna la visibilidad de la clave de un juego comprado en el panel.
   * @param itemId ID único del item comprado.
   */
  togglePurchaseKeyVisibility(itemId: number): void {
    this.visiblePurchaseKeys.update((state) => {
      const nextState = new Map(state);
      nextState.set(itemId, !(state.get(itemId) ?? false));
      return nextState;
    });
  }

  /**
   * Captura antes de descargar la página si hay cambios pendientes.
   * @param $event Evento del navegador beforeunload.
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isEditing) {
      $event.returnValue = true;
    }
  }

  /**
   * Indica si hay cambios de edición pendientes en el formulario del panel.
   * @returns `true` si el perfil está siendo editado.
   */
  hasUnsavedChanges(): boolean {
    return this.isEditing;
  }

  /**
   * Abre el modal de vista ampliada para capturas.
   * @param imageUrl URL de la imagen.
   */
  openScreenshotModal(imageUrl: string): void {
    if (!imageUrl) return;
    this.screenshotModalImage.set(imageUrl);
    this.isScreenshotModalOpen.set(true);
    this.screenshotModalClosing = false;
    this.screenshotModalOpen = false;
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        if (!this.screenshotModalClosing) this.screenshotModalOpen = true;
      }, 10);
    } else {
      this.screenshotModalOpen = true;
    }
  }

  /**
   * Cierra el modal de vista ampliada de capturas.
   */
  closeScreenshotModal(): void {
    if (this.screenshotModalClosing) return;
    this.screenshotModalClosing = true;
    this.screenshotModalOpen = false;

    setTimeout(() => {
      this.isScreenshotModalOpen.set(false);
      this.screenshotModalImage.set(null);
      this.screenshotModalClosing = false;
      this.screenshotModalOpen = false;
      this.renderer.removeStyle(this.document.body, 'overflow');
    }, this.screenshotModalAnimMs);
  }

  /**
   * Cierra el modal si se presiona la tecla Escape.
   */
  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.isScreenshotModalOpen()) {
      this.closeScreenshotModal();
    }
  }
}
