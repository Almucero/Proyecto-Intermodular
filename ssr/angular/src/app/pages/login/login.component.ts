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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  formLogin: FormGroup;
  loginError = '';
  showPassword = false;
  registrationSuccess = false;
  submitted = false;
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
    if (
      isPlatformBrowser(this.platformId) &&
      sessionStorage.getItem('registrationSuccess')
    ) {
      this.registrationSuccess = true;
      sessionStorage.removeItem('registrationSuccess');
    }
    this.navigateTo =
      this.router.getCurrentNavigation()?.extras.state?.['navigateTo'] ||
      '/dashboard';
  }

  ngOnInit(): void {}

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
          this.loginError = 'Usuario no registrado o credenciales incorrectas';
        },
      });
    } else {
      this.formLogin.markAllAsTouched();
    }
  }

  goToRegister() {
    this.router.navigate(['/register'], {
      state: { navigateTo: this.navigateTo },
    });
  }

  goBack() {
    this.location.back();
  }

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
