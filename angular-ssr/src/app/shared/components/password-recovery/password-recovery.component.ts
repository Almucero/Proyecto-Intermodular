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

/** Etapas del flujo de recuperación de contraseña por email y código. */
type RecoveryStep = 'email' | 'code' | 'reset' | 'done';

/** Modal que gestiona solicitud, verificación y reseteo de contraseña. */
@Component({
  selector: 'app-password-recovery-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
})
export class PasswordRecoveryModalComponent implements OnDestroy, AfterViewInit {
  /** Propiedad no documentada. */
    @Output() closed = new EventEmitter<void>();

  /** Propiedad no documentada. */
    step: RecoveryStep = 'email';
  /** Propiedad no documentada. */
    loading = false;
  /** Propiedad no documentada. */
    resendLoading = false;
  /** Propiedad no documentada. */
    serverError = '';
  /** Propiedad no documentada. */
    verificationCode = '';
  /** Propiedad no documentada. */
    email = '';
  /** Propiedad no documentada. */
    expiresAtMs: number | null = null;
  /** Propiedad no documentada. */
    expiresCountdown = '';
  /** Propiedad no documentada. */
    resendCooldownEndsAtMs = 0;
  /** Propiedad no documentada. */
    resendCooldownSeconds = 0;
  /** Propiedad no documentada. */
    private countdownIntervalId: any = null;

  /** Propiedad no documentada. */
    isOpen = false;
  /** Propiedad no documentada. */
    isClosing = false;
  /** Propiedad no documentada. */
    private readonly closeAnimMs = 160;

  /** Propiedad no documentada. */
    private readonly fb = inject(FormBuilder);
  /** Propiedad no documentada. */
    private readonly auth = inject(BaseAuthenticationService);
  /** Propiedad no documentada. */
    private readonly translate = inject(TranslateService);
  /** Propiedad no documentada. */
    private readonly renderer = inject(Renderer2);
  /** Propiedad no documentada. */
    private readonly document = inject(DOCUMENT);

  /** Propiedad no documentada. */
    emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  /** Propiedad no documentada. */
    codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  /** Propiedad no documentada. */
    resetForm = this.fb.group({
    newPassword: [
      '',
      [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)],
    ],
    confirmPassword: ['', [Validators.required]],
  });

  /** Método no documentado. */
    ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      if (!this.isClosing) this.isOpen = true;
    });
  }

  /** Método no documentado. */
    close() {
    if (this.isClosing) return;
    this.isClosing = true;
    this.isOpen = false;

    setTimeout(() => {
      this.closed.emit();
    }, this.closeAnimMs);
  }

  /** Método no documentado. */
    ngOnInit(): void {
    if (this.document?.body) this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  /** Método no documentado. */
    ngOnDestroy(): void {
    this.stopCountdown();
    this.renderer.removeStyle(this.document.body, 'overflow');
  }

  /**
     * Método no documentado.
     * @param expiresAtMs Parámetro no documentado.
     * @param cooldownMs Parámetro no documentado.
     */
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

  /** Método no documentado. */
    private stopCountdown() {
    if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);
    this.countdownIntervalId = null;
    this.expiresAtMs = null;
    this.expiresCountdown = '';
    this.resendCooldownEndsAtMs = 0;
    this.resendCooldownSeconds = 0;
  }

  /** Método no documentado. */
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

  /**
     * Método no documentado.
     * @param locale Parámetro no documentado.
     * @returns Retorno no documentado.
     */
    private normalizeLocale(locale: string): string {
    const normalized = locale.toLowerCase();
    if (normalized.startsWith('es')) return 'es';
    if (normalized.startsWith('en')) return 'en';
    if (normalized.startsWith('fr')) return 'fr';
    if (normalized.startsWith('de')) return 'de';
    if (normalized.startsWith('it')) return 'it';
    return 'es';
  }

  /** Accessor no documentado. */
    get canResend(): boolean {
    return this.resendCooldownSeconds <= 0 && !this.resendLoading;
  }

  /** Método no documentado. */
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

  /** Método no documentado. */
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

  /** Método no documentado. */
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

  /** Método no documentado. */
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
