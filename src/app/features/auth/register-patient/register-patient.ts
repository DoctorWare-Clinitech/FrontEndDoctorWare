// src/app/features/auth/register-patient/register-patient.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterPatientData } from '../../../core/models';
import { passwordMatchValidator, passwordStrengthValidator } from '../../../core/validators/validators';

@Component({
  selector: 'app-register-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-patient.html',
  styleUrls: ['./register-patient.scss']
})
export class RegisterPatient implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  showOptionalFields = false;

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

  relationshipTypes = [
    { value: 'Padre', label: 'Padre' },
    { value: 'Madre', label: 'Madre' },
    { value: 'Hermano/a', label: 'Hermano/a' },
    { value: 'Cónyuge', label: 'Cónyuge' },
    { value: 'Hijo/a', label: 'Hijo/a' },
    { value: 'Amigo/a', label: 'Amigo/a' },
    { value: 'Otro', label: 'Otro' }
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
      // Campos obligatorios
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      documentType: ['DNI', [Validators.required]],
      documentNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      gender: ['Prefiere no decirlo', [Validators.required]],
      phone: ['', [Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)]],
      acceptTerms: [false, [Validators.requiredTrue]],

      // Campos opcionales
      healthInsurance: [''],
      affiliateNumber: [''],
      emergencyContactName: [''],
      emergencyContactPhone: ['', [Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)]],
      emergencyContactRelation: ['']
    }, {
      validators: passwordMatchValidator
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
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }
  get healthInsurance() { return this.registerForm.get('healthInsurance'); }
  get affiliateNumber() { return this.registerForm.get('affiliateNumber'); }
  get emergencyContactName() { return this.registerForm.get('emergencyContactName'); }
  get emergencyContactPhone() { return this.registerForm.get('emergencyContactPhone'); }
  get emergencyContactRelation() { return this.registerForm.get('emergencyContactRelation'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleOptionalFields(): void {
    this.showOptionalFields = !this.showOptionalFields;
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

    const registerData: RegisterPatientData = {
      nombre: formValue.firstName,
      apellido: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      telefono: formValue.phone || undefined,
      nroDocumento: parseInt(formValue.documentNumber, 10),
      tipoDocumentoCodigo: formValue.documentType,
      genero: formValue.gender,
      obraSocial: formValue.healthInsurance || undefined,
      numeroAfiliado: formValue.affiliateNumber || undefined,
      contactoEmergenciaNombre: formValue.emergencyContactName || undefined,
      contactoEmergenciaTelefono: formValue.emergencyContactPhone || undefined,
      contactoEmergenciaRelacion: formValue.emergencyContactRelation || undefined
    };

    this.authService.registerPatient(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert(response.message || 'Registro exitoso. Por favor verifica tu correo electrónico.');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || error.message || 'Error al registrarse. Intenta nuevamente.';
        console.error('Register patient error:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/register']);
  }
}
