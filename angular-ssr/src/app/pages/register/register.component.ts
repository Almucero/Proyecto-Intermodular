import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { SignUpPayload } from '../../core/models/user.model';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

/**
 * Validador personalizado para comprobar que las contraseñas coinciden.
 * @param control Control del formulario (espera un FormGroup).
 */
function passwordMatches(control: AbstractControl): ValidationErrors | null {
  const group = control as FormGroup;
  const password = group.controls['password'];
  const password2 = group.controls['password2'];

  if (!password || !password2) return null;

  if (password.value !== password2.value) {
    const existing = password2.errors ? { ...password2.errors } : {};
    password2.setErrors({ ...existing, passwordMatch: true });
  } else {
    if (password2.errors) {
      const { passwordMatch, ...rest } = password2.errors as any;
      const remaining = Object.keys(rest).length ? rest : null;
      password2.setErrors(remaining);
    } else {
      password2.setErrors(null);
    }
  }
  return null;
}

/**
 * Componente de la página de registro.
 * Gestiona el alta de nuevos usuarios con validaciones de contraseña y formato.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements AfterViewInit {
  /** Formulario reactivo de registro. */
  formRegister: FormGroup;
  /** Mensaje de error si falla el registro en el servidor. */
  registerError = '';
  /** Controla la visibilidad del campo de contraseña. */
  showPassword = false;
  /** Indica si se ha intentado enviar el formulario. */
  submitted = false;
  /** Ruta a la que redirigir tras el login posterior al registro. */
  navigateTo: string = '';
  googleError = '';
  githubError = '';
  private googleInitialized = false;
  googleClientId = '';
  githubClientId = '';
  @ViewChild('googleRegisterButtonHost')
  googleRegisterButtonHost?: ElementRef<HTMLDivElement>;
  private githubAuthListener?: (event: MessageEvent) => void;
  private languageChangeSubscription?: Subscription;

  private router = inject(Router);
  private auth = inject(BaseAuthenticationService);
  private languageService = inject(LanguageService);
  private platformId = inject(PLATFORM_ID);
  private translate = inject(TranslateService);

  constructor(
    private formSvc: FormBuilder,
    private http: HttpClient,
  ) {
    this.formRegister = this.formSvc.group(
      {
        name: ['', [Validators.required]],
        surname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
          ],
        ],
        password2: ['', [Validators.required]],
      },
      {
        validators: passwordMatches,
      },
    );

    this.navigateTo =
      this.router.getCurrentNavigation()?.extras.state?.['navigateTo'] ||
      '/dashboard';
  }

  ngAfterViewInit(): void {
    this.languageChangeSubscription = this.translate.onLangChange.subscribe(
      () => {
        this.googleInitialized = false;
        this.loadGoogleScript(true);
      },
    );
    this.loadGoogleClientId();
    this.loadGithubClientId();
  }

  ngOnDestroy(): void {
    this.languageChangeSubscription?.unsubscribe();
    if (this.githubAuthListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('message', this.githubAuthListener);
    }
  }

  /**
   * Procesa el envío del formulario de registro.
   * Si es válido, llama al servicio de registro y redirige al login.
   */
  onSubmit() {
    this.submitted = true;
    this.registerError = '';

    if (this.formRegister.valid) {
      const { name, surname, email, password } = this.formRegister.value;
      const payload: SignUpPayload = { name, surname, email, password };

      this.auth.signUp(payload).subscribe({
        next: () => {
          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem('registrationSuccess', 'true');
          }
          this.router.navigate(['/login'], {
            state: { navigateTo: this.navigateTo },
          });
        },
        error: (err) => {
          this.registerError =
            err.error?.message || 'Error al registrar la cuenta';
          this.formRegister.controls['password'].reset();
          this.formRegister.controls['password2'].reset();
        },
      });
    } else {
      this.formRegister.markAllAsTouched();
    }
  }

  onGoogleSignInClick() {
    this.googleError = '';
    if (!this.googleClientId) {
      this.googleError = 'Google no está configurado en este entorno';
      return;
    }
    this.loadGoogleScript();
  }

  onGithubSignInClick() {
    this.githubError = '';
    if (!this.githubClientId || !isPlatformBrowser(this.platformId)) {
      this.githubError = 'GitHub no está configurado en este entorno';
      return;
    }

    const state = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('github_oauth_state_register', state);
    const redirectUri = `${window.location.origin}/api/auth/github/callback`;
    const authUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(this.githubClientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent('read:user user:email')}` +
      `&state=${encodeURIComponent(state)}` +
      `&prompt=select_account`;

    const popup = window.open(
      authUrl,
      'github-oauth-register',
      'width=540,height=720,menubar=no,toolbar=no,location=yes,status=no',
    );
    if (!popup) {
      this.githubError = 'No se pudo abrir la ventana de GitHub';
      return;
    }

    this.bindGithubMessageListener('github_oauth_state_register');
  }

  private loadGoogleClientId() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.http
      .get<{
        enabled: boolean;
        clientId: string | null;
      }>('/api/auth/google/client-id')
      .subscribe({
        next: (response) => {
          this.googleClientId = response.clientId ?? '';
          if (this.googleClientId) {
            this.loadGoogleScript();
          }
        },
        error: () => {
          this.googleError = 'No se pudo cargar configuración de Google';
        },
      });
  }

  private loadGithubClientId() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.http
      .get<{
        enabled: boolean;
        clientId: string | null;
      }>('/api/auth/github/client-id')
      .subscribe({
        next: (response) => {
          this.githubClientId = response.clientId ?? '';
        },
        error: () => {
          this.githubError = 'No se pudo cargar configuración de GitHub';
        },
      });
  }

  private getGoogleLocale(): string {
    const selectedLang =
      this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    return ['es', 'en', 'fr', 'de', 'it'].includes(selectedLang)
      ? selectedLang
      : 'en';
  }

  private loadGoogleScript(forceReload = false) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.googleClientId) return;
    const locale = this.getGoogleLocale();
    const scriptSrc = `https://accounts.google.com/gsi/client?hl=${locale}`;
    const existingScript = document.getElementById(
      'google-identity-script',
    ) as HTMLScriptElement | null;
    const existingLocale = existingScript?.dataset['locale'] || '';

    if (forceReload && existingScript) {
      existingScript.remove();
    }

    if (window.google?.accounts?.id && !forceReload) {
      this.initializeGoogleButton();
      return;
    }
    if (existingScript && existingLocale === locale) return;
    if (existingScript && existingLocale !== locale) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = scriptSrc;
    script.dataset['locale'] = locale;
    script.async = true;
    script.defer = true;
    script.onload = () => this.initializeGoogleButton();
    script.onerror = () => {
      this.googleError = 'No se pudo cargar Google Sign-In';
    };
    document.head.appendChild(script);
  }

  private initializeGoogleButton() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.googleRegisterButtonHost?.nativeElement || this.googleInitialized)
      return;
    if (!window.google?.accounts?.id || !this.googleClientId) return;

    window.__googleAuthCallback = (credential?: string) => {
      this.handleGoogleCredential(credential);
    };

    if (window.__googleInitializedClientId !== this.googleClientId) {
      window.google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response: { credential?: string }) => {
          window.__googleAuthCallback?.(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.__googleInitializedClientId = this.googleClientId;
    }

    this.googleRegisterButtonHost.nativeElement.innerHTML = '';
    const buttonWidth = Math.max(
      220,
      this.googleRegisterButtonHost.nativeElement.clientWidth || 320,
    );
    window.google.accounts.id.renderButton(
      this.googleRegisterButtonHost.nativeElement,
      {
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: String(buttonWidth),
        logo_alignment: 'left',
      },
    );
    this.googleInitialized = true;
  }

  private handleGoogleCredential(credential?: string) {
    if (!credential) {
      this.googleError = 'No se recibió token de Google';
      return;
    }
    this.auth.signInWithGoogle(credential, false).subscribe({
      next: () => this.router.navigate([this.navigateTo]),
      error: () => {
        this.googleError = 'No se pudo completar el registro con Google';
      },
    });
  }

  private bindGithubMessageListener(stateStorageKey: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.githubAuthListener) {
      window.removeEventListener('message', this.githubAuthListener);
    }

    this.githubAuthListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        provider?: string;
        code?: string;
        state?: string;
        error?: string;
      };
      if (data?.provider !== 'github') return;

      const expectedState = sessionStorage.getItem(stateStorageKey);
      sessionStorage.removeItem(stateStorageKey);
      window.removeEventListener('message', this.githubAuthListener!);
      this.githubAuthListener = undefined;

      if (data.error) {
        this.githubError = 'Autenticación con GitHub cancelada o fallida';
        return;
      }
      if (
        !data.code ||
        !data.state ||
        !expectedState ||
        data.state !== expectedState
      ) {
        this.githubError = 'No se pudo validar la autenticación con GitHub';
        return;
      }

      this.auth.signInWithGithub(data.code, false).subscribe({
        next: () => this.router.navigate([this.navigateTo]),
        error: () => {
          this.githubError = 'No se pudo completar el registro con GitHub';
        },
      });
    };
    window.addEventListener('message', this.githubAuthListener);
  }

  /** Redirige a la página de login. */
  goToLogin() {
    this.router.navigate(['/login'], {
      state: { navigateTo: this.navigateTo },
    });
  }

  /** Vuelve a la página de login. */
  goBack() {
    this.router.navigate(['/login'], {
      state: { navigateTo: this.navigateTo },
    });
  }

  /**
   * Obtiene la clave de traducción del error para un campo del formulario.
   * @param control Nombre del campo.
   */
  getError(control: string) {
    switch (control) {
      case 'name':
        if (this.hasError('name', 'required')) return 'errors.nameRequired';
        break;
      case 'surname':
        if (this.hasError('surname', 'required'))
          return 'errors.surnameRequired';
        break;
      case 'email':
        if (this.hasError('email', 'required')) return 'errors.emailRequired';
        if (this.hasError('email', 'email')) return 'errors.emailInvalid';
        break;
      case 'password':
        if (this.hasError('password', 'required'))
          return 'errors.passwordRequired';
        if (this.hasError('password', 'pattern'))
          return 'errors.passwordPattern';
        break;
      case 'password2':
        if (this.hasError('password2', 'required'))
          return 'errors.password2Required';
        if (this.hasError('password2', 'passwordMatch'))
          return 'errors.passwordMismatch';
        break;
    }
    return '';
  }

  /**
   * Comprueba si un campo tiene un error específico y ha sido interactuado.
   * @param controlName Nombre del campo.
   * @param errorName Tipo de error.
   */
  private hasError(controlName: string, errorName: string): boolean {
    // eslint-disable-next-line security/detect-object-injection
    const control = this.formRegister.controls[controlName];
    return (control.touched || this.submitted) && control.hasError(errorName);
  }
}
