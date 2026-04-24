import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
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
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { Subscription } from 'rxjs';

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
export class LoginComponent implements AfterViewInit {
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
  googleError = '';
  githubError = '';
  private googleInitialized = false;
  googleClientId = '';
  githubClientId = '';
  @ViewChild('googleLoginButtonHost')
  googleLoginButtonHost?: ElementRef<HTMLDivElement>;
  private githubAuthListener?: (event: MessageEvent) => void;
  private languageChangeSubscription?: Subscription;

  private router = inject(Router);
  private auth = inject(BaseAuthenticationService);
  private languageService = inject(LanguageService);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private platformId = inject(PLATFORM_ID);
  private translate = inject(TranslateService);

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

  ngOnInit(): void {}

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
    sessionStorage.setItem('github_oauth_state_login', state);
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
      'github-oauth-login',
      'width=540,height=720,menubar=no,toolbar=no,location=yes,status=no',
    );
    if (!popup) {
      this.githubError = 'No se pudo abrir la ventana de GitHub';
      return;
    }

    this.bindGithubMessageListener('github_oauth_state_login', true);
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
    if (!this.googleLoginButtonHost?.nativeElement || this.googleInitialized)
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

    this.googleLoginButtonHost.nativeElement.innerHTML = '';
    const buttonWidth = Math.max(
      220,
      this.googleLoginButtonHost.nativeElement.clientWidth || 320,
    );
    window.google.accounts.id.renderButton(
      this.googleLoginButtonHost.nativeElement,
      {
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
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
    const rememberMe = !!this.formLogin.value.rememberMe;
    this.auth.signInWithGoogle(credential, rememberMe).subscribe({
      next: () => this.router.navigate([this.navigateTo]),
      error: () => {
        this.googleError = 'No se pudo iniciar sesión con Google';
      },
    });
  }

  private bindGithubMessageListener(
    stateStorageKey: string,
    rememberMe: boolean,
  ) {
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

      this.auth.signInWithGithub(data.code, rememberMe).subscribe({
        next: () => this.router.navigate([this.navigateTo]),
        error: () => {
          this.githubError = 'No se pudo iniciar sesión con GitHub';
        },
      });
    };
    window.addEventListener('message', this.githubAuthListener);
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
    const translateService = this.languageService;
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
