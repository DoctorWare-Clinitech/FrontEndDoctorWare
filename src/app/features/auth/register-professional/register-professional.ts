// src/app/features/auth/register-professional/register-professional.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterProfessionalData, Specialty } from '../../../core/models';
import { passwordMatchValidator, passwordStrengthValidator, cuitCuilValidator } from '../../../core/validators/validators';

@Component({
  selector: 'app-register-professional',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-professional.html',
  styleUrls: ['./register-professional.scss']
})
export class RegisterProfessional implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  specialties: Specialty[] = [];
  loadingSpecialties = false;
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;

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
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSpecialties();
    this.setupPasswordStrengthListener();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      // Datos personales
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      documentType: ['DNI', [Validators.required]],
      documentNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      gender: ['Prefiere no decirlo', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)]],

      // Datos profesionales
      nationalLicense: ['', [Validators.required, Validators.minLength(5)]],
      provincialLicense: ['', [Validators.required, Validators.minLength(5)]],
      specialtyId: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      university: ['', [Validators.required, Validators.minLength(3)]],
      cuitCuil: ['', [Validators.required, cuitCuilValidator]],

      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: passwordMatchValidator
    });
  }

  private loadSpecialties(): void {
    this.loadingSpecialties = true;

    // Deshabilitar el campo mientras se cargan las especialidades
    this.registerForm.get('specialtyId')?.disable();

    this.authService.getSpecialties().subscribe({
      next: (specialties) => {
        // El backend solo devuelve especialidades activas, no necesitamos filtrar
        this.specialties = specialties;
        this.loadingSpecialties = false;

        // Habilitar el campo cuando se carguen las especialidades
        this.registerForm.get('specialtyId')?.enable();
      },
      error: (error) => {
        console.error('Error loading specialties:', error);
        this.toastr.error('No se pudieron cargar las especialidades. Por favor recarga la página.', 'Error');
        this.loadingSpecialties = false;

        // Mantener deshabilitado si hubo un error
      }
    });
  }

  // Getters para facilitar acceso en template
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get documentType() { return this.registerForm.get('documentType'); }
  get documentNumber() { return this.registerForm.get('documentNumber'); }
  get gender() { return this.registerForm.get('gender'); }
  get phone() { return this.registerForm.get('phone'); }
  get nationalLicense() { return this.registerForm.get('nationalLicense'); }
  get provincialLicense() { return this.registerForm.get('provincialLicense'); }
  get specialtyId() { return this.registerForm.get('specialtyId'); }
  get title() { return this.registerForm.get('title'); }
  get university() { return this.registerForm.get('university'); }
  get cuitCuil() { return this.registerForm.get('cuitCuil'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }

  private setupPasswordStrengthListener(): void {
    this.password?.valueChanges.subscribe(value => {
      if (value) {
        this.passwordStrength = this.calculatePasswordStrength(value);
      } else {
        this.passwordStrength = null;
      }
    });
  }

  private calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getFieldValidationClass(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.value) return '';

    if (field.valid) return 'border-green-500';
    if (field.invalid && (field.dirty || field.touched)) return 'border-red-500';

    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toastr.warning('Por favor completa todos los campos obligatorios correctamente', 'Formulario incompleto');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;

    const registerData: RegisterProfessionalData = {
      nombre: formValue.firstName,
      apellido: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      telefono: formValue.phone,
      nroDocumento: parseInt(formValue.documentNumber, 10),
      tipoDocumentoCodigo: formValue.documentType,
      genero: formValue.gender,
      matriculaNacional: formValue.nationalLicense,
      matriculaProvincial: formValue.provincialLicense,
      especialidadId: parseInt(formValue.specialtyId, 10),
      titulo: formValue.title,
      universidad: formValue.university,
      cuit_cuil: formValue.cuitCuil
    };

    this.authService.registerProfessional(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success(
          response.message || 'Tu cuenta profesional ha sido creada exitosamente. Revisa tu correo para confirmar tu email.',
          'Registro exitoso',
          { timeOut: 5000 }
        );
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMsg = error.error?.message || error.message || 'Error al registrarse. Intenta nuevamente.';
        this.toastr.error(errorMsg, 'Error en el registro');
        console.error('Register professional error:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/register']);
  }
}
