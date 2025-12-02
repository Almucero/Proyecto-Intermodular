import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  formRegister: FormGroup;
  registerError = '';
  showPassword = false;
  showConfirmPassword = false;
  submitted = false;

  private router = inject(Router);
  private auth = inject(BaseAuthenticationService);
  private languageService = inject(LanguageService);

  constructor(private formSvc: FormBuilder) {
    this.formRegister = this.formSvc.group(
      {
        name: ['', [Validators.required]],
        surname: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        terms: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {}

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const group = g as FormGroup;
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    this.submitted = true;
    this.registerError = '';
    if (this.formRegister.valid) {
      const { name, surname, email, password } = this.formRegister.value;
      const payload: SignUpPayload = { name, surname, email, password };

      this.auth.signUp(payload).subscribe({
        next: () => {
          sessionStorage.setItem('registrationSuccess', 'true');
          this.router.navigate(['/login']);
        },
        error: () => {
          this.registerError = 'El correo electrónico ya está registrado';
        },
      });
    } else {
      this.formRegister.markAllAsTouched();
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getError(control: string) {
    const translateService = this.languageService;
    switch (control) {
      case 'name':
        if (
          this.formRegister.controls['name'].errors != null &&
          Object.keys(this.formRegister.controls['name'].errors).includes(
            'required'
          )
        )
          return 'errors.nameRequired';
        break;
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
            'minlength'
          )
        )
          return 'errors.passwordMinLength';
        break;
      case 'confirmPassword':
        if (
          this.formRegister.controls['confirmPassword'].errors != null &&
          Object.keys(
            this.formRegister.controls['confirmPassword'].errors
          ).includes('required')
        )
          return 'errors.confirmPasswordRequired';
        else if (this.formRegister.errors?.['mismatch'])
          return 'errors.passwordMismatch';
        break;
      case 'terms':
        if (
          this.formRegister.controls['terms'].errors != null &&
          Object.keys(this.formRegister.controls['terms'].errors).includes(
            'required'
          )
        )
          return 'errors.termsRequired';
        break;
      default:
        return '';
    }
    return '';
  }
}
