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
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private auth = inject(BaseAuthenticationService);
  private userService = inject(UserService);
  private mediaService = inject(MediaService);
  private purchaseService = inject(PurchaseService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private translate = inject(TranslateService);

  /** Señal que contiene los datos del usuario autenticado. */
  user = toSignal(this.auth.user$);
  /** Señal con la lista de compras completadas satisfactoriamente. */
  purchases = signal<any[]>([]);
  /** Señal con la lista de compras que han sido reembolsadas. */
  returns = signal<any[]>([]);
  purchasesLoading = signal(true);
  returnsLoading = signal(true);
  purchasesSkeletonCount = signal(0);
  returnsSkeletonCount = signal(0);
  purchaseItemsSkeletonCount = signal(2);
  returnItemsSkeletonCount = signal(2);
  purchaseSkeletonCards = computed(() =>
    this.buildSkeletonRange(this.purchasesSkeletonCount()),
  );
  returnSkeletonCards = computed(() =>
    this.buildSkeletonRange(this.returnsSkeletonCount()),
  );
  purchaseSkeletonItems = computed(() =>
    this.buildSkeletonRange(this.purchaseItemsSkeletonCount()),
  );
  returnSkeletonItems = computed(() =>
    this.buildSkeletonRange(this.returnItemsSkeletonCount()),
  );
  private minSkeletonDelayDone = signal(false);
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
  @ViewChildren('actionSizeButton')
  private actionSizeButtons!: QueryList<ElementRef<HTMLButtonElement>>;
  private actionButtonsChangesSubscription?: Subscription;
  private purchasesSubscription?: Subscription;
  private returnsSubscription?: Subscription;
  private readonly resizeHandler = () => this.syncActionButtonsWidth();
  private skeletonDelayTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly purchasesSkeletonCacheKey = 'dashboard.purchasesSkeletonCount';
  private readonly returnsSkeletonCacheKey = 'dashboard.returnsSkeletonCount';
  private readonly purchaseItemsSkeletonCacheKey =
    'dashboard.purchaseItemsSkeletonCount';
  private readonly returnItemsSkeletonCacheKey = 'dashboard.returnItemsSkeletonCount';
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

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.actionButtonsChangesSubscription = this.actionSizeButtons.changes.subscribe(
      () => {
        setTimeout(() => this.syncActionButtonsWidth(), 0);
      },
    );
    window.addEventListener('resize', this.resizeHandler);
    setTimeout(() => this.syncActionButtonsWidth(), 0);
  }

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

  private startMinimumSkeletonDelay() {
    this.minSkeletonDelayDone.set(false);
    this.skeletonDelayTimeoutId = setTimeout(() => {
      this.minSkeletonDelayDone.set(true);
      this.skeletonDelayTimeoutId = null;
    }, 1200);
  }

  private loadPurchases() {
    this.purchasesLoading.set(true);
    this.purchasesSubscription?.unsubscribe();
    this.purchasesSubscription = this.purchaseService
      .getAll({ status: 'completed' })
      .subscribe({
        next: (data) => {
          this.purchases.set(data);
          const cards = this.normalizeSkeletonCount(data.length, this.purchasesSkeletonCount());
          const avgItems =
            data.length > 0
              ? Math.round(
                  data.reduce(
                    (acc, purchase) => acc + (Array.isArray(purchase.items) ? purchase.items.length : 0),
                    0,
                  ) / data.length,
                )
              : this.purchaseItemsSkeletonCount();
          const items = this.normalizeSkeletonCount(avgItems, this.purchaseItemsSkeletonCount());
          this.purchasesSkeletonCount.set(cards);
          this.purchaseItemsSkeletonCount.set(items);
          this.persistSkeletonCounts();
          this.purchasesLoading.set(false);
        },
        error: () => {
          this.purchases.set([]);
          this.purchasesSkeletonCount.set(0);
          this.purchaseItemsSkeletonCount.set(0);
          this.persistSkeletonCounts();
          this.purchasesLoading.set(false);
        },
      });
  }

  private loadReturns() {
    this.returnsLoading.set(true);
    this.returnsSubscription?.unsubscribe();
    this.returnsSubscription = this.purchaseService
      .getAll({ status: 'refunded' })
      .subscribe({
        next: (data) => {
          this.returns.set(data);
          const cards = this.normalizeSkeletonCount(data.length, this.returnsSkeletonCount());
          const avgItems =
            data.length > 0
              ? Math.round(
                  data.reduce(
                    (acc, purchase) => acc + (Array.isArray(purchase.items) ? purchase.items.length : 0),
                    0,
                  ) / data.length,
                )
              : this.returnItemsSkeletonCount();
          const items = this.normalizeSkeletonCount(avgItems, this.returnItemsSkeletonCount());
          this.returnsSkeletonCount.set(cards);
          this.returnItemsSkeletonCount.set(items);
          this.persistSkeletonCounts();
          this.returnsLoading.set(false);
        },
        error: () => {
          this.returns.set([]);
          this.returnsSkeletonCount.set(0);
          this.returnItemsSkeletonCount.set(0);
          this.persistSkeletonCounts();
          this.returnsLoading.set(false);
        },
      });
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
      error: () => {},
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

  /** Maneja el evento de selección de archivo por parte del usuario. */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.clearImagePreview();
      this.selectedImageFile = file;
      this.previewImageUrl = URL.createObjectURL(file);
    }
  }

  /** Cierra la sesión del usuario y redirige al login. */
  async onLogout() {
    this.auth.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  /** Abre el modal para solicitar un reembolso de una compra específica. */
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
        if (isPlatformBrowser(this.platformId)) {
          window.location.reload();
        }
      },
      error: () => {
        this.refundError.set('dashboard.refundError');
      },
    });
  }

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

  private buildSkeletonRange(count: number): number[] {
    return Array.from({ length: Math.max(0, count) }, (_, i) => i + 1);
  }

  private normalizeSkeletonCount(value: number, fallback: number): number {
    if (!Number.isFinite(value)) return Math.max(0, Math.round(fallback));
    return Math.max(0, Math.round(value));
  }

  private loadSkeletonCountsFromCache(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const purchasesCount = Number(localStorage.getItem(this.purchasesSkeletonCacheKey));
    const returnsCount = Number(localStorage.getItem(this.returnsSkeletonCacheKey));
    const purchaseItemsCount = Number(
      localStorage.getItem(this.purchaseItemsSkeletonCacheKey),
    );
    const returnItemsCount = Number(localStorage.getItem(this.returnItemsSkeletonCacheKey));
    this.purchasesSkeletonCount.set(
      this.normalizeSkeletonCount(purchasesCount, this.purchasesSkeletonCount()),
    );
    this.returnsSkeletonCount.set(
      this.normalizeSkeletonCount(returnsCount, this.returnsSkeletonCount()),
    );
    this.purchaseItemsSkeletonCount.set(
      this.normalizeSkeletonCount(purchaseItemsCount, this.purchaseItemsSkeletonCount()),
    );
    this.returnItemsSkeletonCount.set(
      this.normalizeSkeletonCount(returnItemsCount, this.returnItemsSkeletonCount()),
    );
  }

  private persistSkeletonCounts(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(
      this.purchasesSkeletonCacheKey,
      String(this.purchasesSkeletonCount()),
    );
    localStorage.setItem(this.returnsSkeletonCacheKey, String(this.returnsSkeletonCount()));
    localStorage.setItem(
      this.purchaseItemsSkeletonCacheKey,
      String(this.purchaseItemsSkeletonCount()),
    );
    localStorage.setItem(
      this.returnItemsSkeletonCacheKey,
      String(this.returnItemsSkeletonCount()),
    );
  }

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

  isPurchaseKeyVisible(itemId: number): boolean {
    return this.visiblePurchaseKeys().get(itemId) ?? false;
  }

  togglePurchaseKeyVisibility(itemId: number): void {
    this.visiblePurchaseKeys.update((state) => {
      const nextState = new Map(state);
      nextState.set(itemId, !(state.get(itemId) ?? false));
      return nextState;
    });
  }
}
