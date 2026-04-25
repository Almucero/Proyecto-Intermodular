import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';

/**
 * Componente de la página de inicio de sesión.
 * Gestiona el formulario de login, la autenticación del usuario y la redirección post-login.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  /** Formulario reactivo para el inicio de sesión. */
  formLogin: FormGroup;
  /** Mensaje de error a mostrar si falla el login. */
  loginError = '';
  /** Controla la visibilidad del campo de contraseña. */
  showPassword = false;
  /** Indica si se acaba de completar un registro con éxito. */
  registrationSuccess = false;
  /** Indica si el formulario ha sido enviado. */
  submitted = false;
  /** Ruta a la que redirigir tras un login exitoso. */
  navigateTo: string = '';
  isOAuthRedirectProcessing = false;
  googleError = '';
  githubError = '';
  googleClientId = '';
  githubClientId = '';
  private readonly GOOGLE_STATE_KEY = 'google_oauth_state_login';
  private readonly GOOGLE_NONCE_KEY = 'google_oauth_nonce_login';
  private readonly GOOGLE_REMEMBER_KEY = 'google_oauth_remember_login';
  private readonly GOOGLE_TARGET_KEY = 'google_oauth_target';
  private readonly GITHUB_STATE_KEY = 'github_oauth_state_login';
  private readonly GITHUB_REMEMBER_KEY = 'github_oauth_remember_login';
  private readonly SKIP_LOADING_KEY = 'skip_loading_screen_once';

  private router = inject(Router);
  private auth = inject(BaseAuthenticationService);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
    // Verifica si venimos de una redirección por registro exitoso.
    if (
      isPlatformBrowser(this.platformId) &&
      sessionStorage.getItem('registrationSuccess')
    ) {
      this.registrationSuccess = true;
      sessionStorage.removeItem('registrationSuccess');
    }
    // Determina la ruta de destino (por defecto /dashboard).
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
   * Procesa el envío del formulario de login.
   * Llama al servicio de autenticación y gestiona la respuesta.
   */
  onSubmit() {
    this.submitted = true;
    this.loginError = '';
    if (this.formLogin.valid) {
      const { email, password, rememberMe } = this.formLogin.value;
      this.auth.signIn({ email, password }, rememberMe).subscribe({
        next: () => {
          this.router.navigate([this.navigateTo]);
        },
        error: () => {
          this.submitted = false;
          this.loginError = 'Usuario no registrado o credenciales incorrectas';
          this.formLogin.controls['password'].reset();
        },
      });
    } else {
      this.formLogin.markAllAsTouched();
    }
  }

  onGoogleSignInClick() {
    this.googleError = '';
    if (!this.googleClientId || !isPlatformBrowser(this.platformId)) {
      this.googleError = 'Google no está configurado en este entorno';
      return;
    }
    const rememberMe = true;
    const state = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(this.GOOGLE_STATE_KEY, state);
    sessionStorage.setItem(this.GOOGLE_NONCE_KEY, nonce);
    sessionStorage.setItem(this.GOOGLE_REMEMBER_KEY, rememberMe ? '1' : '0');

    sessionStorage.setItem(this.GOOGLE_TARGET_KEY, '/login');
    document.cookie = `google_oauth_target=${encodeURIComponent('/login')}; path=/; SameSite=Lax; Secure`;
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
    const rememberMe = true;
    sessionStorage.setItem(this.GITHUB_STATE_KEY, state);
    sessionStorage.setItem(this.GITHUB_REMEMBER_KEY, rememberMe ? '1' : '0');
    const redirectUri = `${window.location.origin}/api/auth/github/callback?target=${encodeURIComponent('/login')}`;
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
      const rememberMe = sessionStorage.getItem(this.GITHUB_REMEMBER_KEY) === '1';
      sessionStorage.removeItem(this.GITHUB_STATE_KEY);
      sessionStorage.removeItem(this.GITHUB_REMEMBER_KEY);
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

      this.auth.signInWithGithub(githubCode, rememberMe).subscribe({
        next: () => this.router.navigate([this.navigateTo]),
        error: () => {
          this.isOAuthRedirectProcessing = false;
          this.githubError = 'No se pudo iniciar sesión con GitHub';
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
      const rememberMe = sessionStorage.getItem(this.GOOGLE_REMEMBER_KEY) === '1';
      sessionStorage.removeItem(this.GOOGLE_STATE_KEY);
      sessionStorage.removeItem(this.GOOGLE_NONCE_KEY);
      sessionStorage.removeItem(this.GOOGLE_REMEMBER_KEY);
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

      this.auth.signInWithGoogle(googleIdToken, rememberMe).subscribe({
        next: () => this.router.navigate([this.navigateTo]),
        error: () => {
          this.isOAuthRedirectProcessing = false;
          this.googleError = 'No se pudo iniciar sesión con Google';
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

  /** Redirige a la página de registro preservando el destino post-registro. */
  goToRegister() {
    this.router.navigate(['/register'], {
      state: { navigateTo: this.navigateTo },
    });
  }

  /** Vuelve a la página anterior en el historial. */
  goBack() {
    this.location.back();
  }

  /**
   * Obtiene la clave de traducción del error para un campo específico.
   * @param control Nombre del campo del formulario.
   */
  getError(control: string) {
    switch (control) {
      case 'email':
        if (
          this.formLogin.controls['email'].errors != null &&
          Object.keys(this.formLogin.controls['email'].errors).includes(
            'required',
          )
        )
          return 'errors.emailRequired';
        else if (
          this.formLogin.controls['email'].errors != null &&
          Object.keys(this.formLogin.controls['email'].errors).includes('email')
        )
          return 'errors.emailInvalid';
        break;
      case 'password':
        if (
          this.formLogin.controls['password'].errors != null &&
          Object.keys(this.formLogin.controls['password'].errors).includes(
            'required',
          )
        )
          return 'errors.passwordRequired';
        break;
      default:
        return '';
    }
    return '';
  }
}
