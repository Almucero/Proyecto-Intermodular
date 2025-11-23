import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AUTH_SERVICE } from '../../core/services/auth.token';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, TranslatePipe], //RouterLink
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  formRegister: FormGroup;
  registrationError = '';
  showPassword = false;
  private router = inject(Router);
  private auth = inject(AUTH_SERVICE);
  private languageService = inject(LanguageService);

  constructor(private formSvc: FormBuilder) {
    this.formRegister = this.formSvc.group(
      {
        name: ['', Validators.required],
        surname: ['', Validators.required],
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
      { validators: passwordMatches }
    );
  }

  async onSubmit() {
    if (this.formRegister.valid) {
      const success = await this.auth.register(this.formRegister.value);
      if (success) {
        sessionStorage.setItem('registrationSuccess', 'true');
        this.router.navigate(['/login']);
      } else {
        this.registrationError = 'El email ya está registrado';
      }
    } else {
      this.formRegister.markAllAsTouched();
    }
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  getError(control: string): string {
    switch (control) {
      case 'email':
        if (
          this.formRegister.controls['email'].errors != null &&
          Object.keys(this.formRegister.controls['email'].errors).includes(
            'required'
          )
        )
          return 'errors.emailRequired';
        else if (
          this.formRegister.controls['email'].errors != null &&
          Object.keys(this.formRegister.controls['email'].errors).includes(
            'email'
          )
        )
          return 'errors.emailInvalid';
        break;
      case 'password':
        if (
          this.formRegister.controls['password'].errors != null &&
          Object.keys(this.formRegister.controls['password'].errors).includes(
            'required'
          )
        )
          return 'errors.passwordRequired';
        else if (
          this.formRegister.controls['password'].errors != null &&
          Object.keys(this.formRegister.controls['password'].errors).includes(
            'pattern'
          )
        )
          return 'errors.passwordPattern';
        break;
      case 'password2':
        if (
          this.formRegister.controls['password2'].errors != null &&
          Object.keys(this.formRegister.controls['password2'].errors).includes(
            'required'
          )
        )
          return 'errors.password2Required';
        else if (
          this.formRegister.controls['password2'].errors != null &&
          Object.keys(this.formRegister.controls['password2'].errors).includes(
            'passwordMatch'
          )
        )
          return 'errors.passwordMismatch';
        break;
      case 'name':
        if (
          this.formRegister.controls['name'].errors != null &&
          Object.keys(this.formRegister.controls['name'].errors).includes(
            'required'
          )
        )
          return 'errors.nameRequired';
        break;
      case 'surname':
        if (
          this.formRegister.controls['surname'].errors != null &&
          Object.keys(this.formRegister.controls['surname'].errors).includes(
            'required'
          )
        )
          return 'errors.surnameRequired';
        break;
    }
    return '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
