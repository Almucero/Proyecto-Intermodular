import { CommonModule } from '@angular/common';
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
import { HeaderComponent } from '../../shared/components/header/header.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
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
  navigateTo: string = '';
  private router = inject(Router);
  private auth = inject(AUTH_SERVICE);
  private languageService = inject(LanguageService);

  constructor(private formSvc: FormBuilder, private http: HttpClient) {
    this.formLogin = this.formSvc.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    if (sessionStorage.getItem('registrationSuccess')) {
      this.registrationSuccess = true;
      sessionStorage.removeItem('registrationSuccess');
    }
    this.navigateTo =
      this.router.getCurrentNavigation()?.extras.state?.['navigateTo'] ||
      '/dashboard';
  }

  async onSubmit() {
    this.loginError = '';
    if (this.formLogin.valid) {
      const success = await this.auth.login(this.formLogin.value);
      if (success) {
        this.router.navigate([this.navigateTo]);
      } else {
        this.loginError = this.languageService.translate('errorLoginFailed');
      }
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  getError(control: string): string {
    const errors = this.formLogin.controls[control]?.errors;
    if (!errors) return '';

    switch (control) {
      case 'email':
        if (errors['required']) return this.languageService.translate('errorEmailRequired');
        if (errors['email']) return this.languageService.translate('errorEmailInvalid');
        break;
      case 'password':
        if (errors['required']) return this.languageService.translate('errorPasswordRequired');
        break;
    }
    return '';
  }
}