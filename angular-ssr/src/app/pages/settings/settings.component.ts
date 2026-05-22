/**
 * @file: src/app/pages/settings/settings.component.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Componente de la página de configuración.
 */

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, signal, HostListener, ViewEncapsulation, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { UserService } from '../../core/services/impl/user.service';
import { CanComponentDeactivate } from '../../core/guards/can-deactivate.guard';

/** Pantalla de preferencias de notificaciones por correo y cuenta. */
@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit, CanComponentDeactivate {
  /** Servicio de autenticación. */
  private readonly auth = inject(BaseAuthenticationService);
  /** Servicio de usuarios. */
  private readonly userService = inject(UserService);
  /** FormBuilder para construir formularios reactivos. */
  private readonly fb = inject(FormBuilder);
  /** Enrutador para navegación. */
  private readonly router = inject(Router);
  /** Identificador de plataforma para comprobar si se está ejecutando en navegador (SSR). */
  private readonly platformId = inject(PLATFORM_ID);

  /** Indica si el usuario está autenticado. */
  isAuthenticated = signal(false);
  /** Indica si la autenticación ha sido verificada. */
  isAuthReady = signal(false);
  /** Indica si se están guardando los cambios. */
  saving = false;
  /** Indica si los cambios se han guardado con éxito. */
  saved = false;
  /** Mensaje de error al guardar. */
  saveError = '';
  /** Indica si el botón de borrar cuenta está armado para confirmación. */
  deleteAccountConfirmArmed = false;

  /** Indica si se debe mostrar el modal de confirmación de reseteo. */
  showResetConfirmModal = signal(false);

  /** Indica si el menú desplegable de selección de idioma está abierto. */
  languageDropdownOpen = signal(false);
  /** Indica si el menú desplegable de selección de frecuencia de notificaciones está abierto. */
  frequencyDropdownOpen = signal(false);

  /** Contenedor del desplegable de idioma para la máscara de scroll dinámico. */
  @ViewChild('languageScrollContainer') set languageScrollContainer(el: ElementRef<HTMLElement> | undefined) {
    if (el) {
      setTimeout(() => {
        this.updateScrollMask(el.nativeElement);
      }, 0);
    }
  }

  /** Contenedor del desplegable de frecuencia para la máscara de scroll dinámico. */
  @ViewChild('frequencyScrollContainer') set frequencyScrollContainer(el: ElementRef<HTMLElement> | undefined) {
    if (el) {
      setTimeout(() => {
        this.updateScrollMask(el.nativeElement);
      }, 0);
    }
  }

  /** Opciones de idioma disponibles. */
  readonly languages = [
    { code: 'es', label: 'settings.notifications.languages.es' },
    { code: 'en', label: 'settings.notifications.languages.en' },
    { code: 'fr', label: 'settings.notifications.languages.fr' },
    { code: 'de', label: 'settings.notifications.languages.de' },
  ];

  /** Opciones de frecuencia disponibles. */
  readonly frequencies = [
    { code: 'daily', label: 'settings.notifications.frequencies.daily' },
    { code: 'weekly', label: 'settings.notifications.frequencies.weekly' },
    { code: 'monthly', label: 'settings.notifications.frequencies.monthly' },
    { code: 'never', label: 'settings.notifications.frequencies.never' },
  ];

  /** Claves de tópicos de notificación. */
  readonly topicKeys = [
    'periodicRecommendations',
    'cartReminders',
    'favoriteDiscounts',
    'backInStock',
    'categoryNews',
    'weeklyDigest',
    'purchaseStatus',
    'inactiveAccount',
  ] as const;

  /** Formulario reactivo para la configuración de notificaciones. */
  readonly form = this.fb.group({
    emailNotificationsEnabled: [true, Validators.required],
    notificationEmail: ['', Validators.email],
    emailNotificationLanguage: [''],
    emailNotificationFrequency: ['weekly', Validators.required],
    emailRecommendationIntervalDays: [7, [Validators.required, Validators.min(1), Validators.max(30)]],
    emailQuietHoursStart: [22],
    emailQuietHoursEnd: [8],
    pauseDays: [0],
    topics: this.fb.group(
      this.topicKeys.reduce(
        (acc, key) => {
          acc[key] = this.fb.control(true, { nonNullable: true });
          return acc;
        },
        {} as Record<string, any>,
      ),
    ),
  });

  /**
   * Inicializa el componente y se suscribe al estado de autenticación.
   */
  ngOnInit(): void {
    this.auth.ready$.subscribe((ready) => {
      this.isAuthReady.set(ready);
      if (ready) {
        this.auth.user$.subscribe((user) => {
          this.isAuthenticated.set(!!user);
          if (!user) return;
          const topicsFromUser = (user.emailNotificationTopics ?? {}) as Record<string, boolean>;
          const topicsPatch = this.topicKeys.reduce(
            (acc, key) => {
              acc[key] = topicsFromUser[key] ?? true;
              return acc;
            },
            {} as Record<(typeof this.topicKeys)[number], boolean>,
          );

          this.form.patchValue({
            emailNotificationsEnabled: user.emailNotificationsEnabled ?? true,
            notificationEmail: user.notificationEmail ?? '',
            emailNotificationLanguage: user.emailNotificationLanguage ?? '',
            emailNotificationFrequency: user.emailNotificationFrequency ?? 'weekly',
            emailRecommendationIntervalDays: user.emailRecommendationIntervalDays ?? 7,
            emailQuietHoursStart: user.emailQuietHoursStart ?? 22,
            emailQuietHoursEnd: user.emailQuietHoursEnd ?? 8,
            topics: topicsPatch,
          });
        });
      }
    });
  }

  /** Alterna el dropdown de idioma. */
  toggleLanguageDropdown(event: Event): void {
    event.stopPropagation();
    this.languageDropdownOpen.update(v => !v);
    this.frequencyDropdownOpen.set(false);
  }

  /** Alterna el dropdown de frecuencia. */
  toggleFrequencyDropdown(event: Event): void {
    event.stopPropagation();
    this.frequencyDropdownOpen.update(v => !v);
    this.languageDropdownOpen.set(false);
  }

  /** Selecciona un idioma del dropdown. */
  selectLanguage(code: string): void {
    this.form.patchValue({ emailNotificationLanguage: code });
    this.form.markAsDirty();
    this.languageDropdownOpen.set(false);
  }

  /** Selecciona una frecuencia del dropdown. */
  selectFrequency(code: string): void {
    this.form.patchValue({ emailNotificationFrequency: code });
    this.form.markAsDirty();
    this.frequencyDropdownOpen.set(false);
  }

  /** Obtiene la etiqueta del idioma seleccionado. */
  getSelectedLanguageLabel(): string {
    const code = this.form.get('emailNotificationLanguage')?.value;
    return this.languages.find(l => l.code === code)?.label || 'settings.notifications.selectLanguage';
  }

  /** Obtiene la etiqueta de la frecuencia seleccionada. */
  getSelectedFrequencyLabel(): string {
    const code = this.form.get('emailNotificationFrequency')?.value;
    return this.frequencies.find(f => f.code === code)?.label || 'settings.notifications.selectFrequency';
  }

  /**
   * Maneja el scroll en el desplegable de idiomas.
   * @param event Evento de scroll.
   */
  onLanguageScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.updateScrollMask(target);
  }

  /**
   * Maneja el scroll en el desplegable de frecuencia.
   * @param event Evento de scroll.
   */
  onFrequencyScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.updateScrollMask(target);
  }

  /**
   * Actualiza la máscara de difuminado del contenedor de scroll.
   * @param el Elemento contenedor.
   */
  private updateScrollMask(el: HTMLElement) {
    if (!el) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    const showTop = scrollTop > 5;
    const showBottom = scrollTop + clientHeight < scrollHeight - 5;

    el.style.setProperty('--scroll-top-mask', showTop ? '0' : '1');
    el.style.setProperty('--scroll-top-mask-stop', showTop ? '2rem' : '0px');
    el.style.setProperty('--scroll-bottom-mask', showBottom ? '0' : '1');
    el.style.setProperty('--scroll-bottom-mask-stop', showBottom ? 'calc(100% - 2rem)' : '100%');
  }

  /** Cierra todos los dropdowns activos. */
  @HostListener('document:click')
  closeDropdowns(): void {
    this.languageDropdownOpen.set(false);
    this.frequencyDropdownOpen.set(false);
  }

  /** Guarda la configuración de notificaciones del usuario. */
  saveSettings(): void {
    this.deleteAccountConfirmArmed = false;
    this.saved = false;
    this.saveError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const pauseDays = Number(raw.pauseDays ?? 0);
    const pauseUntil =
      pauseDays > 0 ? new Date(Date.now() + pauseDays * 24 * 60 * 60 * 1000).toISOString() : null;

    this.saving = true;
    this.userService
      .update('me', {
        emailNotificationsEnabled: !!raw.emailNotificationsEnabled,
        notificationEmail: raw.notificationEmail?.trim() || null,
        emailNotificationLanguage: raw.emailNotificationLanguage?.trim() || null,
        emailNotificationFrequency: raw.emailNotificationFrequency ?? 'weekly',
        emailRecommendationIntervalDays: Number(raw.emailRecommendationIntervalDays ?? 7),
        emailQuietHoursStart: Number(raw.emailQuietHoursStart),
        emailQuietHoursEnd: Number(raw.emailQuietHoursEnd),
        emailNotificationPausedUntil: pauseUntil,
        emailNotificationTopics: raw.topics,
      } as any)
      .subscribe({
        next: () => {
          this.saving = false;
          this.saved = true;
          this.form.markAsPristine();
          this.auth.me().subscribe();
        },
        error: () => {
          this.saving = false;
          this.saveError = 'settings.notifications.saveError';
        },
      });
  }

  /** Activa o desactiva la fase de confirmación de eliminación de cuenta. */
  onDeleteAccountClick(): void {
    this.deleteAccountConfirmArmed = !this.deleteAccountConfirmArmed;
  }

  /** Cancela la eliminación de cuenta. */
  onCancelDeleteAccount(): void {
    this.deleteAccountConfirmArmed = false;
  }

  /** Confirma la eliminación de la cuenta. */
  onConfirmDeleteAccount(): void {
    this.deleteAccountConfirmArmed = false;
    this.userService.delete('me').subscribe({
      next: () => {
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem('deleteSuccess', 'true');
        }
        this.auth.signOut().subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: () => {
        this.saveError = 'settings.account.deleteError';
      },
    });
  }

  /** Redirige a la página de login. */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /** Determina si el formulario tiene cambios sin guardar. */
  get isEditing(): boolean {
    return this.form.dirty && !this.saved;
  }

  /**
   * Muestra confirmación al recargar si hay cambios sin guardar.
   * @param $event Evento del navegador beforeunload.
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isEditing) {
      $event.returnValue = true;
    }
  }

  /**
   * Comprueba si el componente tiene cambios sin guardar para el CanDeactivateGuard.
   * @returns `true` si hay cambios pendientes de guardar.
   */
  hasUnsavedChanges(): boolean {
    return this.isEditing;
  }
}
