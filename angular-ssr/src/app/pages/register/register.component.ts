import { Component, inject, PLATFORM_ID } from '@angular/core';
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
import { LanguageService } from '../../core/services/language.service';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { SignUpPayload } from '../../core/models/user.model';

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
export class RegisterComponent {
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

  private router = inject(Router);
  private auth = inject(BaseAuthenticationService);
  private languageService = inject(LanguageService);
  private platformId = inject(PLATFORM_ID);

  constructor(private formSvc: FormBuilder) {
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
