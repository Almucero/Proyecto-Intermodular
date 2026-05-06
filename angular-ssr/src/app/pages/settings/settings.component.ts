import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { UserService } from '../../core/services/impl/user.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly auth = inject(BaseAuthenticationService);
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  saving = false;
  saved = false;
  saveError = '';
  deleteAccountConfirmArmed = false;

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
    this.auth.user$.subscribe((user) => {
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

  onDeleteAccountClick(): void {
    this.deleteAccountConfirmArmed = !this.deleteAccountConfirmArmed;
  }

  onCancelDeleteAccount(): void {
    this.deleteAccountConfirmArmed = false;
  }

  onConfirmDeleteAccount(): void {
    this.deleteAccountConfirmArmed = false;
  }
}
