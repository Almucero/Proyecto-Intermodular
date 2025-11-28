import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AUTH_SERVICE } from '../../core/services/auth.token';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent, TranslatePipe],
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
  private auth = inject(AUTH_SERVICE);
  private languageService = inject(LanguageService);

  constructor(private formSvc: FormBuilder, private http: HttpClient) {
    this.formLogin = this.formSvc.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
    if (sessionStorage.getItem('registrationSuccess')) {
      this.registrationSuccess = true;
      sessionStorage.removeItem('registrationSuccess');
    }
    this.navigateTo =
      this.router.getCurrentNavigation()?.extras.state?.['navigateTo'] ||
      '/dashboard';
  }

  ngOnInit(): void {}

  async onSubmit() {
    this.submitted = true;
    this.loginError = '';
    if (this.formLogin.valid) {
      const { email, password, rememberMe } = this.formLogin.value;
      const success = await this.auth.login({ email, password }, rememberMe);
      if (success) {
        this.router.navigate([this.navigateTo]);
      } else {
        this.loginError = 'Usuario no registrado o credenciales incorrectas';
      }
    } else {
      this.formLogin.markAllAsTouched();
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getError(control: string) {
    const translateService = this.languageService;
    switch (control) {
      case 'email':
        if (
          this.formLogin.controls['email'].errors != null &&
          Object.keys(this.formLogin.controls['email'].errors).includes(
            'required'
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
            'required'
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
