import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator(
  control: AbstractControl
): ValidationErrors | null {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
  const valid = passwordRegex.test(control.value);

  return valid
    ? null
    : { passwordStrength: 'La contraseña no cumple con los requisitos' };
}

export function passwordsMatchValidator(
  group: AbstractControl
): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('password2')?.value;

  return password === confirmPassword
    ? null
    : { passwordsMismatch: 'Las contraseñas no coinciden' };
}
