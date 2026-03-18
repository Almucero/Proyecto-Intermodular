import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
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
export class LoginComponent {
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

  private router = inject(Router);
  private auth = inject(BaseAuthenticationService);
  private languageService = inject(LanguageService);
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

  ngOnInit(): void {}

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
