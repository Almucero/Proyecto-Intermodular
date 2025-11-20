import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AUTH_SERVICE } from '../../core/services/auth.token';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
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

  constructor(private formSvc: FormBuilder,private http: HttpClient) {
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


  isMenuOpen = false;
   @ViewChild('menu') menu!: ElementRef;
  ngOnInit(): void {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
   @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.isMenuOpen && this.menu && !this.menu.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

  async onSubmit() {
    this.loginError = '';
    if (this.formLogin.valid) {
      const success = await this.auth.login(this.formLogin.value);
      if (success) {
        this.router.navigate([this.navigateTo]);
      } else {
        this.loginError = 'Usuario no registrado o credenciales incorrectas';
      }
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  getError(control: string) {
    switch (control) {
      case 'email':
        if (
          this.formLogin.controls['email'].errors != null &&
          Object.keys(this.formLogin.controls['email'].errors).includes(
            'required'
          )
        )
          return 'El campo email es requerido';
        else if (
          this.formLogin.controls['email'].errors != null &&
          Object.keys(this.formLogin.controls['email'].errors).includes('email')
        )
          return 'El email no es correcto';
        break;
      case 'password':
        if (
          this.formLogin.controls['password'].errors != null &&
          Object.keys(this.formLogin.controls['password'].errors).includes(
            'required'
          )
        )
          return 'El campo contraseña es requerido';
        break;
      default:
        return '';
    }
    return '';
  }
}

//hacer loginError con signal