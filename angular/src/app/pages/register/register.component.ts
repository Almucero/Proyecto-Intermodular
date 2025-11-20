import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
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
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  formRegister: FormGroup;
  registrationError = '';
  showPassword = false;
  private router = inject(Router);
  private auth = inject(AUTH_SERVICE);

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
          return 'El campo email es requerido';
        else if (
          this.formRegister.controls['email'].errors != null &&
          Object.keys(this.formRegister.controls['email'].errors).includes(
            'email'
          )
        )
          return 'El email no es correcto';
        break;
      case 'password':
        if (
          this.formRegister.controls['password'].errors != null &&
          Object.keys(this.formRegister.controls['password'].errors).includes(
            'required'
          )
        )
          return 'El campo contraseña es requerido';
        else if (
          this.formRegister.controls['password'].errors != null &&
          Object.keys(this.formRegister.controls['password'].errors).includes(
            'pattern'
          )
        )
          return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
        break;
      case 'password2':
        if (
          this.formRegister.controls['password2'].errors != null &&
          Object.keys(this.formRegister.controls['password2'].errors).includes(
            'required'
          )
        )
          return 'Repite la contraseña';
        else if (
          this.formRegister.controls['password2'].errors != null &&
          Object.keys(this.formRegister.controls['password2'].errors).includes(
            'passwordMatch'
          )
        )
          return 'Las contraseñas no coinciden';
        break;
      case 'name':
        if (
          this.formRegister.controls['name'].errors != null &&
          Object.keys(this.formRegister.controls['name'].errors).includes(
            'required'
          )
        )
          return 'El nombre es requerido';
        break;
      case 'surname':
        if (
          this.formRegister.controls['surname'].errors != null &&
          Object.keys(this.formRegister.controls['surname'].errors).includes(
            'required'
          )
        )
          return 'El apellido es requerido';
        break;
    }
    return '';
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

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
