// src/app/features/auth/register/register.ts

import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, RegisterData } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  roles = [
    { value: UserRole.PROFESSIONAL, label: 'Profesional de la Salud', icon: '👨‍⚕️' },
    { value: UserRole.SECRETARY, label: 'Secretario/a', icon: '📋' },
    { value: UserRole.PATIENT, label: 'Paciente', icon: '👤' }
  ];

  documentTypes = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CI', label: 'Cédula de Identidad' },
    { value: 'Pasaporte', label: 'Pasaporte' }
  ];

  genders = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Otro', label: 'Otro' },
    { value: 'Prefiere no decirlo', label: 'Prefiere no decirlo' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      documentNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      documentType: ['DNI', [Validators.required]],
      gender: ['Prefiere no decirlo', [Validators.required]],
      phone: ['', [Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)]],
      role: [UserRole.PATIENT], // Mantener para futuro, pero oculto
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador personalizado: contraseñas deben coincidir
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Validador de fortaleza de contraseña
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
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

  // Getters para facilitar acceso en template
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get documentNumber() { return this.registerForm.get('documentNumber'); }
  get documentType() { return this.registerForm.get('documentType'); }
  get gender() { return this.registerForm.get('gender'); }
  get phone() { return this.registerForm.get('phone'); }
  get role() { return this.registerForm.get('role'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;

    // Mapear los datos del formulario al formato esperado por el backend
    const registerData: RegisterData = {
      nombre: formValue.firstName,
      apellido: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      telefono: formValue.phone || undefined,
      nroDocumento: parseInt(formValue.documentNumber, 10),
      tipoDocumentoCodigo: formValue.documentType,
      genero: formValue.gender
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        // El backend NO devuelve tokens en el registro, requiere confirmación de email
        alert(response.message || 'Registro exitoso. Por favor verifica tu correo electrónico.');
        // Redirigir al login después del registro exitoso
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al registrarse. Intenta nuevamente.';
        console.error('Register error:', error);
      }
    });
  }
}
