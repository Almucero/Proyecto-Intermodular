import {
  Component,
  OnInit,
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
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { SignUpPayload } from '../../core/models/user.model';
import { HttpClient } from '@angular/common/http';

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
export class RegisterComponent implements OnInit {
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
  isOAuthRedirectProcessing = false;
  googleError = '';
  githubError = '';
  googleClientId = '';
  githubClientId = '';
  private readonly GOOGLE_STATE_KEY = 'google_oauth_state_register';
  private readonly GOOGLE_NONCE_KEY = 'google_oauth_nonce_register';
  private readonly GOOGLE_TARGET_KEY = 'google_oauth_target';
  private readonly GITHUB_STATE_KEY = 'github_oauth_state_register';
  private readonly SKIP_LOADING_KEY = 'skip_loading_screen_once';

  private router = inject(Router);
  private auth = inject(BaseAuthenticationService);
  private platformId = inject(PLATFORM_ID);

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

  ngOnInit(): void {
    this.processOAuthRedirect();
    this.loadGoogleClientId();
    this.loadGithubClientId();
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
    if (!this.googleClientId || !isPlatformBrowser(this.platformId)) {
      this.googleError = 'Google no está configurado en este entorno';
      return;
    }
    const state = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(this.GOOGLE_STATE_KEY, state);
    sessionStorage.setItem(this.GOOGLE_NONCE_KEY, nonce);

    sessionStorage.setItem(this.GOOGLE_TARGET_KEY, '/register');
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', this.googleClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('prompt', 'select_account');

    sessionStorage.setItem(this.SKIP_LOADING_KEY, '1');
    window.location.assign(authUrl.toString());
  }

  onGithubSignInClick() {
    this.githubError = '';
    if (!this.githubClientId || !isPlatformBrowser(this.platformId)) {
      this.githubError = 'GitHub no está configurado en este entorno';
      return;
    }

    const state = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(this.GITHUB_STATE_KEY, state);
    const redirectUri = `${window.location.origin}/api/auth/github/callback?target=${encodeURIComponent('/register')}`;
    const authUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(this.githubClientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent('read:user user:email')}` +
      `&state=${encodeURIComponent(state)}` +
      `&prompt=select_account`;
    sessionStorage.setItem(this.SKIP_LOADING_KEY, '1');
    window.location.assign(authUrl);
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

  private processOAuthRedirect() {
    if (!isPlatformBrowser(this.platformId)) return;
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash,
    );

    const githubCode = searchParams.get('code');
    const githubState = searchParams.get('state');
    const githubError = searchParams.get('error');
    if (githubCode || githubError) {
      this.isOAuthRedirectProcessing = true;
      const expectedState = sessionStorage.getItem(this.GITHUB_STATE_KEY);
      sessionStorage.removeItem(this.GITHUB_STATE_KEY);
      window.history.replaceState({}, document.title, window.location.pathname);

      if (githubError) {
        this.isOAuthRedirectProcessing = false;
        this.githubError = 'Autenticación con GitHub cancelada o fallida';
        return;
      }
      if (!githubCode || !githubState || !expectedState || githubState !== expectedState) {
        this.isOAuthRedirectProcessing = false;
        this.githubError = 'No se pudo validar la autenticación con GitHub';
        return;
      }

      this.auth.signInWithGithub(githubCode, true).subscribe({
        next: () => this.router.navigate([this.navigateTo]),
        error: () => {
          this.isOAuthRedirectProcessing = false;
          this.githubError = 'No se pudo completar el registro con GitHub';
        },
      });
      return;
    }

    const googleIdToken = hashParams.get('id_token');
    const googleState = hashParams.get('state');
    const googleError = hashParams.get('error');
    if (googleIdToken || googleError) {
      this.isOAuthRedirectProcessing = true;
      const expectedState = sessionStorage.getItem(this.GOOGLE_STATE_KEY);
      const expectedNonce = sessionStorage.getItem(this.GOOGLE_NONCE_KEY);
      sessionStorage.removeItem(this.GOOGLE_STATE_KEY);
      sessionStorage.removeItem(this.GOOGLE_NONCE_KEY);
      window.history.replaceState({}, document.title, window.location.pathname);

      if (googleError) {
        this.isOAuthRedirectProcessing = false;
        this.googleError = 'Autenticación con Google cancelada o fallida';
        return;
      }
      if (!googleIdToken || !googleState || !expectedState || googleState !== expectedState) {
        this.isOAuthRedirectProcessing = false;
        this.googleError = 'No se pudo validar la autenticación con Google';
        return;
      }

      const tokenNonce = this.getNonceFromIdToken(googleIdToken);
      if (!tokenNonce || !expectedNonce || tokenNonce !== expectedNonce) {
        this.isOAuthRedirectProcessing = false;
        this.googleError = 'No se pudo validar la autenticación con Google';
        return;
      }

      this.auth.signInWithGoogle(googleIdToken, true).subscribe({
        next: () => this.router.navigate([this.navigateTo]),
        error: () => {
          this.isOAuthRedirectProcessing = false;
          this.googleError = 'No se pudo completar el registro con Google';
        },
      });
    }
  }

  private getNonceFromIdToken(idToken: string): string | null {
    try {
      const parts = idToken.split('.');
      if (parts.length < 2) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const payload = JSON.parse(atob(padded)) as { nonce?: string };
      return payload.nonce ?? null;
    } catch {
      return null;
    }
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
