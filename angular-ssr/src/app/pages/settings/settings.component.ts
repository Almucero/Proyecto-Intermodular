import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { UserService } from '../../core/services/impl/user.service';

/** Pantalla de preferencias de notificaciones por correo y cuenta. */
@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  /** Propiedad no documentada. */
    private readonly auth = inject(BaseAuthenticationService);
  /** Propiedad no documentada. */
    private readonly userService = inject(UserService);
  /** Propiedad no documentada. */
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);

  isAuthenticated = signal(false);

  /** Estado de guardado en curso. */
  saving = false;
  /** Marca visual de guardado exitoso. */
  saved = false;
  /** Clave i18n del último error de guardado. */
  saveError = '';
  /** Estado del segundo paso de confirmación de borrado de cuenta. */
  deleteAccountConfirmArmed = false;

  /** Claves de tópicos de notificación configurables por el usuario. */
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

  /** Formulario reactivo de preferencias de notificación por email. */
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

  /** Inicializa el formulario con datos del usuario autenticado. */
  ngOnInit(): void {
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

  /** Persiste la configuración de notificaciones del usuario actual. */
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
          this.auth.me().subscribe();
        },
        error: () => {
          this.saving = false;
          this.saveError = 'settings.notifications.saveError';
        },
      });
  }

  /** Activa/desactiva la confirmación de borrado de cuenta. */
  onDeleteAccountClick(): void {
    this.deleteAccountConfirmArmed = !this.deleteAccountConfirmArmed;
  }

  /** Cancela la acción de borrado y resetea su confirmación. */
  onCancelDeleteAccount(): void {
    this.deleteAccountConfirmArmed = false;
  }

  /** Placeholder de confirmación final de borrado de cuenta. */
  onConfirmDeleteAccount(): void {
    this.deleteAccountConfirmArmed = false;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
