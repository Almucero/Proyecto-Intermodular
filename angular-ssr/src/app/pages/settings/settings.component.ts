import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, HostListener, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
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
  private readonly auth = inject(BaseAuthenticationService);
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isAuthenticated = signal(false);
  isAuthReady = signal(false);
  saving = false;
  saved = false;
  saveError = '';
  deleteAccountConfirmArmed = false;
  
  /** Indica si se debe mostrar el modal de confirmación de reseteo. */
  showResetConfirmModal = signal(false);

  /** Estados para los dropdowns personalizados. */
  languageDropdownOpen = signal(false);
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

  onLanguageScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.updateScrollMask(target);
  }

  onFrequencyScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.updateScrollMask(target);
  }

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

  @HostListener('document:click')
  closeDropdowns(): void {
    this.languageDropdownOpen.set(false);
    this.frequencyDropdownOpen.set(false);
  }

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

  onDeleteAccountClick(): void {
    this.deleteAccountConfirmArmed = !this.deleteAccountConfirmArmed;
  }

  onCancelDeleteAccount(): void {
    this.deleteAccountConfirmArmed = false;
  }

  onConfirmDeleteAccount(): void {
    this.deleteAccountConfirmArmed = false;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  get isEditing(): boolean {
    return this.form.dirty && !this.saved;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isEditing) {
      $event.returnValue = true;
    }
  }

  hasUnsavedChanges(): boolean {
    return this.isEditing;
  }
}
