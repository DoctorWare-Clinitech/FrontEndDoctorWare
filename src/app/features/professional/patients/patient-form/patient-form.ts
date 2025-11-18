import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientsService } from '../../../../core/services/patients.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Patient, Gender, BloodType, CreatePatientDto, UpdatePatientDto } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  // State
  protected readonly isLoading = signal(false);
  protected readonly isEditMode = signal(false);
  protected readonly patientId = signal<string | null>(null);

  // Forms
  protected patientForm!: FormGroup;

  // Enums for templates
  protected readonly genders = Object.values(Gender);
  protected readonly bloodTypes = Object.values(BloodType);

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.patientId.set(id);
      this.loadPatient(id);
    }
  }

  /**
   * Inicializar formulario
   */
  private initForm(): void {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{7,8}$/)]],
      dateOfBirth: ['', [Validators.required]],
      gender: [Gender.PREFER_NOT_TO_SAY, [Validators.required]],

      // Address
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        zipCode: ['', [Validators.required]],
        country: ['Argentina', [Validators.required]]
      }),

      // Emergency Contact
      emergencyContact: this.fb.group({
        name: ['', [Validators.required]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
        relationship: ['', [Validators.required]],
        email: ['', [Validators.email]]
      }),

      // Medical Insurance (optional)
      hasMedicalInsurance: [false],
      medicalInsurance: this.fb.group({
        provider: [''],
        planName: [''],
        memberNumber: [''],
        validUntil: ['']
      }),

      // Notes
      notes: ['']
    });

    // Escuchar cambios en hasMedicalInsurance
    this.patientForm.get('hasMedicalInsurance')?.valueChanges.subscribe((hasInsurance) => {
      const insuranceGroup = this.patientForm.get('medicalInsurance');
      if (hasInsurance) {
        insuranceGroup?.get('provider')?.setValidators([Validators.required]);
        insuranceGroup?.get('planName')?.setValidators([Validators.required]);
        insuranceGroup?.get('memberNumber')?.setValidators([Validators.required]);
      } else {
        insuranceGroup?.get('provider')?.clearValidators();
        insuranceGroup?.get('planName')?.clearValidators();
        insuranceGroup?.get('memberNumber')?.clearValidators();
      }
      insuranceGroup?.get('provider')?.updateValueAndValidity();
      insuranceGroup?.get('planName')?.updateValueAndValidity();
      insuranceGroup?.get('memberNumber')?.updateValueAndValidity();
    });
  }

  /**
   * Cargar paciente para edición
   */
  private loadPatient(id: string): void {
    this.isLoading.set(true);

    this.patientsService.getById(id).subscribe({
      next: (patient) => {
        this.patchForm(patient);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading patient:', error);
        this.toastService.error('Error', 'No se pudo cargar el paciente');
        this.isLoading.set(false);
        this.router.navigate(['/professional/patients']);
      }
    });
  }

  /**
   * Actualizar formulario con datos del paciente
   */
  private patchForm(patient: Patient): void {
    this.patientForm.patchValue({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dni: patient.dni,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      hasMedicalInsurance: !!patient.medicalInsurance,
      medicalInsurance: patient.medicalInsurance || {},
      notes: patient.notes
    });
  }

  /**
   * Guardar paciente
   */
  protected onSubmit(): void {
    if (this.patientForm.invalid) {
      this.markFormGroupTouched(this.patientForm);
      this.toastService.warning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.isLoading.set(true);

    if (this.isEditMode()) {
      this.updatePatient();
    } else {
      this.createPatient();
    }
  }

  /**
   * Crear nuevo paciente
   * IMPORTANTE: El payload DEBE coincidir EXACTAMENTE con CreatePatientRequest del backend
   */
  private createPatient(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toastService.error('Error', 'Usuario no autenticado');
      this.isLoading.set(false);
      return;
    }

    const formValue = this.patientForm.value;

    // Construir DTO EXACTO como lo requiere el backend
    const dto: CreatePatientDto = {
      name: formValue.name,                    // Backend split en NOMBRE y APELLIDO
      email: formValue.email || null,
      phone: formValue.phone,
      dni: formValue.dni,
      dateOfBirth: formValue.dateOfBirth,
      gender: formValue.gender,                // Backend mapea: male→Masculino, female→Femenino
      address: {
        street: formValue.address.street,
        city: formValue.address.city,
        state: formValue.address.state,
        zipCode: formValue.address.zipCode,
        country: formValue.address.country
      },
      emergencyContact: {
        name: formValue.emergencyContact.name,
        phone: formValue.emergencyContact.phone,
        relationship: formValue.emergencyContact.relationship,
        email: formValue.emergencyContact.email || undefined
      },
      medicalInsurance: formValue.hasMedicalInsurance ? {
        provider: formValue.medicalInsurance.provider,
        planName: formValue.medicalInsurance.planName,
        memberNumber: formValue.medicalInsurance.memberNumber,
        validUntil: formValue.medicalInsurance.validUntil || undefined
      } : undefined,
      professionalId: currentUser.id,          // userId del profesional → será resuelto por ProfessionalResolver
      notes: formValue.notes || undefined      // Notas generales (serán encriptadas en backend)
    };

    this.patientsService.create(dto).subscribe({
      next: (patient) => {
        this.toastService.success('Éxito', 'Paciente creado exitosamente');
        this.isLoading.set(false);
        this.router.navigate(['/professional/patients', patient.id]);
      },
      error: (error) => {
        console.error('Error creating patient:', error);
        const errorMsg = error.error?.message || error.message || 'No se pudo crear el paciente';
        this.toastService.error('Error', errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Actualizar paciente existente
   */
  private updatePatient(): void {
    const formValue = this.patientForm.value;
    const dto: UpdatePatientDto = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      address: formValue.address,
      emergencyContact: formValue.emergencyContact,
      medicalInsurance: formValue.hasMedicalInsurance ? formValue.medicalInsurance : undefined,
      notes: formValue.notes
    };

    const id = this.patientId();
    if (!id) return;

    this.patientsService.update(id, dto).subscribe({
      next: () => {
        this.toastService.success('Éxito', 'Paciente actualizado exitosamente');
        this.isLoading.set(false);
        this.router.navigate(['/professional/patients', id]);
      },
      error: (error) => {
        console.error('Error updating patient:', error);
        this.toastService.error('Error', 'No se pudo actualizar el paciente');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Cancelar y volver
   */
  protected cancel(): void {
    if (this.patientForm.dirty) {
      if (confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
        this.goBack();
      }
    } else {
      this.goBack();
    }
  }

  /**
   * Volver a la lista o detalle
   */
  private goBack(): void {
    const id = this.patientId();
    if (id) {
      this.router.navigate(['/professional/patients', id]);
    } else {
      this.router.navigate(['/professional/patients']);
    }
  }

  /**
   * Marcar todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Helper para verificar si un campo tiene errores
   */
  protected hasError(fieldName: string): boolean {
    const field = this.patientForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Helper para obtener mensaje de error
   */
  protected getErrorMessage(fieldName: string): string {
    const field = this.patientForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('email')) return 'Email inválido';
    if (field?.hasError('pattern')) return 'Formato inválido';
    if (field?.hasError('minlength')) return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    return '';
  }
}
