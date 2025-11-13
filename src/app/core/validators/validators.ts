import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador de CUIT/CUIL argentino
 *
 * Verifica:
 * - Formato: 11 dígitos numéricos
 * - Dígito verificador: algoritmo módulo 11
 */
export function cuitCuilValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  // Verificar que sean 11 dígitos
  if (!/^\d{11}$/.test(value)) {
    return {
      invalidCuitCuil: {
        message: 'El CUIT/CUIL debe tener 11 dígitos numéricos'
      }
    };
  }

  // Validar dígito verificador (algoritmo módulo 11)
  const digits = value.split('').map(Number);
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * multipliers[i];
  }

  const remainder = sum % 11;
  const verifier = 11 - remainder;
  const expectedDigit = verifier === 11 ? 0 : verifier === 10 ? 9 : verifier;

  if (digits[10] !== expectedDigit) {
    return {
      invalidCuitCuil: {
        message: 'El dígito verificador del CUIT/CUIL es incorrecto'
      }
    };
  }

  return null;
}

/**
 * Validador de contraseñas coincidentes
 *
 * Verifica que los campos 'password' y 'confirmPassword' coincidan
 * Se aplica a nivel de FormGroup
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

/**
 * Validador de fortaleza de contraseña
 *
 * Verifica que la contraseña contenga:
 * - Al menos un número
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 */
export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) {
    return null;
  }

  const hasNumber = /[0-9]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);

  const passwordValid = hasNumber && hasUpper && hasLower;

  return passwordValid ? null : { passwordStrength: true };
}
