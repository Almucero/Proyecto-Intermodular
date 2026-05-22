/**
 * @file: src/app/shared/components/password-recovery/password-recovery.component.ts
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Componente para la recuperación de contraseña.
 */

import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  Renderer2,
  inject,
  AfterViewInit,
  PLATFORM_ID,
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
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
  animations: [
    trigger('errorMessage', [
      transition(':enter', [
        style({ height: '0px', opacity: 0, overflow: 'hidden', marginTop: '0px', marginBottom: '0px' }),
        animate('200ms ease-out', style({ height: '*', opacity: 1, marginTop: '*', marginBottom: '*' })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden', marginTop: '*', marginBottom: '*' }),
        animate('150ms ease-in', style({ height: '0px', opacity: 0, marginTop: '0px', marginBottom: '0px' })),
      ]),
    ]),
  ],
})
export class PasswordRecoveryModalComponent implements OnDestroy, AfterViewInit {
  /** Evento emitido cuando el modal se cierra por completo. */
  @Output() closed = new EventEmitter<void>();

  /** Etapa actual del flujo de recuperación de contraseña. */
  step: RecoveryStep = 'email';
  /** Indica si hay una operación asíncrona de envío/verificación en curso. */
  loading = false;
  /** Indica si se está reenviando un nuevo código de verificación por correo. */
  resendLoading = false;
  /** Clave de traducción del mensaje de error del servidor a mostrar. */
  serverError = '';
  /** Código de verificación OTP de 6 dígitos ingresado y validado. */
  verificationCode = '';
  /** Dirección de correo electrónico del usuario en proceso de recuperación. */
  email = '';
  /** Timestamp en milisegundos en el que expira el código actual. */
  expiresAtMs: number | null = null;
  /** Representación en texto del tiempo restante para expirar (ej: "14:59"). */
  expiresCountdown = '';
  /** Timestamp en el que finaliza el bloqueo de reenvío de correo. */
  resendCooldownEndsAtMs = 0;
  /** Segundos restantes para que el usuario pueda volver a solicitar un envío. */
  resendCooldownSeconds = 0;
  /** Identificador de intervalo para la cuenta regresiva en milisegundos. */
  private countdownIntervalId: any = null;

  /** Controla la apertura del modal y la animación de fade-in. */
  isOpen = false;
  /** Indica si el modal está en transición de cierre. */
  isClosing = false;
  /** Tiempo en milisegundos asignado para la animación CSS de cierre. */
  private readonly closeAnimMs = 160;

  /** Constructor del servicio Reactive FormBuilder inyectado. */
  private readonly fb = inject(FormBuilder);
  /** Servicio inyectado de autenticación del backend. */
  private readonly auth = inject(BaseAuthenticationService);
  /** Servicio inyectado de traducción para internacionalización de textos. */
  private readonly translate = inject(TranslateService);
  /** Servicio inyectado Renderer2 para la manipulación segura de estilos DOM. */
  private readonly renderer = inject(Renderer2);
  /** Objeto inyectado del documento HTML global. */
  private readonly document = inject(DOCUMENT);
  /** Token inyectado identificador de la plataforma (Browser/Server). */
  private readonly platformId = inject(PLATFORM_ID);

  /** Formulario reactivo para la solicitud del correo electrónico inicial. */
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  /** Formulario reactivo para ingresar y validar el código de 6 dígitos. */
  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  /** Formulario reactivo para establecer y confirmar la nueva contraseña. */
  resetForm = this.fb.group({
    newPassword: [
      '',
      [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)],
    ],
    confirmPassword: ['', [Validators.required]],
  });

  /**
   * Ciclo de vida ejecutado tras inicializarse la vista. Activa la bandera isOpen para animar la apertura.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        if (!this.isClosing) this.isOpen = true;
      });
    } else {
      if (!this.isClosing) this.isOpen = true;
    }
  }

  /**
   * Cierra el modal activando la animación de salida y emitiendo el evento de cerrado tras el delay establecido.
   */
  close() {
    if (this.isClosing) return;
    this.isClosing = true;
    this.isOpen = false;

    setTimeout(() => {
      this.closed.emit();
    }, this.closeAnimMs);
  }

  /**
   * Ciclo de vida OnInit. Bloquea el scroll del body para evitar scrolling de fondo.
   */
  ngOnInit(): void {
    if (this.document?.body) this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  /**
   * Ciclo de vida OnDestroy. Limpia intervalos activos y restaura el overflow del scroll del body.
   */
  ngOnDestroy(): void {
    this.stopCountdown();
    this.renderer.removeStyle(this.document.body, 'overflow');
  }

  /**
   * Inicia el temporizador de cuenta regresiva para la expiración y para el cooldown de reenvío de correo.
   * @param expiresAtMs Timestamp absoluto en milisegundos en el que caduca el código OTP actual.
   * @param cooldownMs Tiempo de enfriamiento en milisegundos requerido para reenviar el email.
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

  /**
   * Detiene el intervalo de cuenta regresiva y restablece todas las variables de tiempos asociadas.
   */
  private stopCountdown() {
    if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);
    this.countdownIntervalId = null;
    this.expiresAtMs = null;
    this.expiresCountdown = '';
    this.resendCooldownEndsAtMs = 0;
    this.resendCooldownSeconds = 0;
  }

  /**
   * Actualiza internamente el string formateado del countdown y el contador de segundos de enfriamiento.
   */
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
   * Normaliza la cadena de idioma recibida para asegurar compatibilidad con el backend de GameSage.
   * @param locale Idioma a evaluar (ej. 'es-ES', 'en-US').
   * @returns Cadena de dos letras normalizada ('es', 'en', 'fr', 'de', 'it').
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

  /**
   * Getter que comprueba si es posible habilitar el botón de reenvío de código.
   */
  get canResend(): boolean {
    return this.resendCooldownSeconds <= 0 && !this.resendLoading;
  }

  /**
   * Solicita el envío del código OTP de recuperación al correo electrónico provisto en el formulario.
   */
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

  /**
   * Vuelve a enviar el código OTP por correo electrónico si el cooldown ha expirado.
   */
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

  /**
   * Envía el código OTP ingresado por el usuario al backend para verificar su validez.
   */
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

  /**
   * Envía la nueva contraseña junto con el código verificado para efectuar el cambio en la cuenta.
   */
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
