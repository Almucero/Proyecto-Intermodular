import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  Renderer2,
  inject,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BaseAuthenticationService } from '../../../core/services/impl/base-authentication.service';

type RecoveryStep = 'email' | 'code' | 'reset' | 'done';

@Component({
  selector: 'app-password-recovery-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
})
export class PasswordRecoveryModalComponent implements OnDestroy, AfterViewInit {
  @Output() closed = new EventEmitter<void>();

  step: RecoveryStep = 'email';
  loading = false;
  resendLoading = false;
  serverError = '';
  verificationCode = '';
  email = '';
  expiresAtMs: number | null = null;
  expiresCountdown = '';
  resendCooldownEndsAtMs = 0;
  resendCooldownSeconds = 0;
  private countdownIntervalId: any = null;

  isOpen = false;
  isClosing = false;
  private readonly closeAnimMs = 160;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(BaseAuthenticationService);
  private readonly translate = inject(TranslateService);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  resetForm = this.fb.group({
    newPassword: [
      '',
      [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)],
    ],
    confirmPassword: ['', [Validators.required]],
  });

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      if (!this.isClosing) this.isOpen = true;
    });
  }

  close() {
    if (this.isClosing) return;
    this.isClosing = true;
    this.isOpen = false;

    setTimeout(() => {
      this.closed.emit();
    }, this.closeAnimMs);
  }

  ngOnInit(): void {
    if (this.document?.body) this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  ngOnDestroy(): void {
    this.stopCountdown();
    this.renderer.removeStyle(this.document.body, 'overflow');
  }

  private startCountdown(expiresAtMs: number, cooldownMs: number) {
    this.expiresAtMs = expiresAtMs;
    this.resendCooldownEndsAtMs = Date.now() + cooldownMs;
    this.updateCountdowns();
    if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);
    this.countdownIntervalId = setInterval(() => {
      this.updateCountdowns();
      if (this.expiresAtMs && Date.now() >= this.expiresAtMs) {
        this.stopCountdown();
      }
    }, 1000);
  }

  private stopCountdown() {
    if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);
    this.countdownIntervalId = null;
    this.expiresAtMs = null;
    this.expiresCountdown = '';
    this.resendCooldownEndsAtMs = 0;
    this.resendCooldownSeconds = 0;
  }

  private updateCountdowns() {
    const now = Date.now();
    if (this.expiresAtMs) {
      const remainingMs = Math.max(0, this.expiresAtMs - now);
      const totalSeconds = Math.floor(remainingMs / 1000);
      const mm = Math.floor(totalSeconds / 60);
      const ss = totalSeconds % 60;
      this.expiresCountdown = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    }
    if (this.resendCooldownEndsAtMs) {
      const remainingMs = Math.max(0, this.resendCooldownEndsAtMs - now);
      this.resendCooldownSeconds = Math.ceil(remainingMs / 1000);
    }
  }

  private normalizeLocale(locale: string): string {
    const normalized = locale.toLowerCase();
    if (normalized.startsWith('es')) return 'es';
    if (normalized.startsWith('en')) return 'en';
    if (normalized.startsWith('fr')) return 'fr';
    if (normalized.startsWith('de')) return 'de';
    if (normalized.startsWith('it')) return 'it';
    return 'es';
  }

  get canResend(): boolean {
    return this.resendCooldownSeconds <= 0 && !this.resendLoading;
  }

  requestCode() {
    this.serverError = '';
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) return;
    this.loading = true;
    const email = this.emailForm.value.email ?? '';
    const locale = this.normalizeLocale(this.translate.currentLang || this.translate.getDefaultLang() || 'es');
    this.auth.requestPasswordRecovery(email, locale).subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.email = email;
        this.step = 'code';
        this.stopCountdown();
        const expiresAtMs =
          typeof resp?.expiresAt === 'number' ? resp.expiresAt : Date.now() + 15 * 60 * 1000;
        this.startCountdown(expiresAtMs, 60 * 1000);
      },
      error: (err: any) => {
        this.loading = false;
        const code = err?.error?.code;
        if (code === 'ERR_AUTH_PASSWORD_RECOVERY_RATE_LIMIT') {
          this.serverError = 'errors.ERR_AUTH_PASSWORD_RECOVERY_RATE_LIMIT';
        } else {
          this.serverError = 'errors.ERR_AUTH_PASSWORD_RECOVERY_REQUEST';
        }
      },
    });
  }

  resendCode() {
    this.serverError = '';
    if (this.emailForm.invalid && !this.email) return;
    if (!this.canResend) return;
    this.resendLoading = true;
    this.loading = false;

    const locale = this.normalizeLocale(this.translate.currentLang || this.translate.getDefaultLang() || 'es');
    this.auth.requestPasswordRecovery(this.email, locale).subscribe({
      next: (resp: any) => {
        this.resendLoading = false;
        const expiresAtMs =
          typeof resp?.expiresAt === 'number' ? resp.expiresAt : Date.now() + 15 * 60 * 1000;
        this.startCountdown(expiresAtMs, 60 * 1000);
      },
      error: (err: any) => {
        this.resendLoading = false;
        const retryAfterMs = typeof err?.error?.retryAfterMs === 'number' ? err.error.retryAfterMs : 60000;
        this.resendCooldownEndsAtMs = Date.now() + retryAfterMs;
        this.updateCountdowns();
        if (err?.error?.code === 'ERR_AUTH_PASSWORD_RECOVERY_RATE_LIMIT') {
          this.serverError = 'errors.ERR_AUTH_PASSWORD_RECOVERY_RATE_LIMIT';
        } else {
          this.serverError = 'errors.ERR_AUTH_PASSWORD_RECOVERY_REQUEST';
        }
      },
    });
  }

  verifyCode() {
    this.serverError = '';
    this.codeForm.markAllAsTouched();
    if (this.codeForm.invalid) return;
    this.loading = true;
    const code = this.codeForm.value.code ?? '';
    this.auth.verifyPasswordRecovery(this.email, code).subscribe({
      next: () => {
        this.loading = false;
        this.verificationCode = code;
        this.step = 'reset';
        this.stopCountdown();
      },
      error: () => {
        this.loading = false;
        this.serverError = 'errors.ERR_AUTH_PASSWORD_RECOVERY_CODE';
      },
    });
  }

  resetPassword() {
    this.serverError = '';
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) return;
    const newPassword = this.resetForm.value.newPassword ?? '';
    const confirmPassword = this.resetForm.value.confirmPassword ?? '';
    if (newPassword !== confirmPassword) {
      this.serverError = 'errors.passwordMismatch';
      return;
    }
    this.loading = true;
    this.auth
      .resetPasswordRecovery(this.email, this.verificationCode, newPassword)
      .subscribe({
        next: () => {
          this.loading = false;
          this.step = 'done';
          this.stopCountdown();
        },
        error: () => {
          this.loading = false;
          this.serverError = 'errors.ERR_AUTH_PASSWORD_RECOVERY_RESET';
        },
      });
  }
}
