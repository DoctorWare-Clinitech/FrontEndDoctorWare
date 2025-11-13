// src/app/features/auth/register-professional/register-professional.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
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
    this.loadSpecialties();
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
    this.authService.getSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties.filter(s => s.activo);
        this.loadingSpecialties = false;
      },
      error: (error) => {
        console.error('Error loading specialties:', error);
        this.errorMessage = 'No se pudieron cargar las especialidades. Por favor recarga la página.';
        this.loadingSpecialties = false;
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Por favor completa todos los campos obligatorios correctamente';
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
        alert(response.message || 'Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta profesional.');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || error.message || 'Error al registrarse. Intenta nuevamente.';
        console.error('Register professional error:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/register']);
  }
}
