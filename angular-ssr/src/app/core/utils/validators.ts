import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador personalizado para comprobar la fortaleza de la contraseña.
 * Requiere al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
 * @param control Control de formulario a validar.
 * @returns Error de validación si no cumple los requisitos, o null si es válida.
 */
export function passwordValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
  const valid = passwordRegex.test(control.value);

  return valid
    ? null
    : { passwordStrength: 'La contraseña no cumple con los requisitos' };
}

/**
 * Validador de grupo para asegurar que dos campos de contraseña coinciden.
 * @param group Grupo de formulario (o control) que contiene los campos 'password' y 'password2'.
 * @returns Error 'passwordsMismatch' si no coinciden, o null si son iguales.
 */
export function passwordsMatchValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('password2')?.value;

  return password === confirmPassword
    ? null
    : { passwordsMismatch: 'Las contraseñas no coinciden' };
}
