import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientsService } from '../../../../core/services/patients.service';
import { MedicalHistoryService } from '../../../../core/services/medical-history.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Patient, MedicalHistory, MedicalRecordType } from '../../../../core/models';
import { DateFormatPipe } from '../../../../shared/pipes';
import { Modal } from '../../../../shared/components/modal/modal';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DateFormatPipe, Modal],
  templateUrl: './patient-detail.html',
  styleUrls: ['./patient-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly patientsService = inject(PatientsService);
  private readonly medicalHistoryService = inject(MedicalHistoryService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  // State
  protected readonly isLoading = signal(true);
  protected readonly patient = signal<Patient | null>(null);
  protected readonly medicalHistory = signal<MedicalHistory[]>([]);
  protected readonly activeTab = signal<'info' | 'medical' | 'appointments'>('info');
  protected readonly showMedicalRecordModal = signal(false);
  protected readonly isSavingRecord = signal(false);

  // Forms
  protected medicalRecordForm!: FormGroup;

  // Enums for template
  protected readonly recordTypes = Object.values(MedicalRecordType);

  // Computed
  protected readonly patientAge = computed(() => {
    const p = this.patient();
    return p ? this.calculateAge(p.dateOfBirth) : 0;
  });

  protected readonly hasEmergencyContact = computed(() => {
    return !!this.patient()?.emergencyContact;
  });

  protected readonly hasMedicalInsurance = computed(() => {
    return !!this.patient()?.medicalInsurance;
  });

  protected readonly sortedMedicalHistory = computed(() => {
    return [...this.medicalHistory()].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  ngOnInit(): void {
    this.initMedicalRecordForm();

    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.loadPatient(patientId);
    } else {
      this.toastService.error('Error', 'ID de paciente no válido');
      this.router.navigate(['/professional/patients']);
    }
  }

  /**
   * Inicializar formulario de registro médico
   */
  private initMedicalRecordForm(): void {
    this.medicalRecordForm = this.fb.group({
      type: [MedicalRecordType.CONSULTATION, [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      diagnosis: [''],
      treatment: [''],
      observations: ['']
    });
  }

  /**
   * Cargar datos del paciente
   */
  private loadPatient(id: string): void {
    this.isLoading.set(true);

    this.patientsService.getById(id).subscribe({
      next: (patient) => {
        this.patient.set(patient);
        this.loadMedicalHistory(id);
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
   * Cargar historia clínica
   */
  private loadMedicalHistory(patientId: string): void {
    this.medicalHistoryService.getHistory(patientId).subscribe({
      next: (history) => {
        this.medicalHistory.set(history);
      },
      error: (error) => {
        console.error('Error loading medical history:', error);
        this.toastService.warning('Advertencia', 'No se pudo cargar la historia clínica');
      }
    });
  }

  /**
   * Abrir modal para nuevo registro médico
   */
  protected openMedicalRecordModal(): void {
    this.medicalRecordForm.reset({
      type: MedicalRecordType.CONSULTATION
    });
    this.showMedicalRecordModal.set(true);
  }

  /**
   * Cerrar modal de registro médico
   */
  protected closeMedicalRecordModal(): void {
    this.showMedicalRecordModal.set(false);
    this.medicalRecordForm.reset();
  }

  /**
   * Guardar nuevo registro médico
   */
  protected saveMedicalRecord(): void {
    if (this.medicalRecordForm.invalid) {
      this.markFormGroupTouched(this.medicalRecordForm);
      this.toastService.warning('Formulario incompleto', 'Por favor complete los campos requeridos');
      return;
    }

    const patient = this.patient();
    if (!patient) return;

    this.isSavingRecord.set(true);

    const formValue = this.medicalRecordForm.value;
    const recordData = {
      patientId: patient.id,
      type: formValue.type,
      date: new Date(),
      title: formValue.title,
      description: formValue.description,
      diagnosis: formValue.diagnosis || undefined,
      treatment: formValue.treatment || undefined,
      observations: formValue.observations || undefined
    };

    this.medicalHistoryService.create(recordData).subscribe({
      next: (record) => {
        this.toastService.success('Éxito', 'Registro médico creado correctamente');
        this.medicalHistory.update(history => [record, ...history]);
        this.closeMedicalRecordModal();
        this.isSavingRecord.set(false);
      },
      error: (error) => {
        console.error('Error creating medical record:', error);
        this.toastService.error('Error', 'No se pudo crear el registro médico');
        this.isSavingRecord.set(false);
      }
    });
  }

  /**
   * Cambiar tab activa
   */
  protected setActiveTab(tab: 'info' | 'medical' | 'appointments'): void {
    this.activeTab.set(tab);
  }

  /**
   * Navegar a editar paciente
   */
  protected editPatient(): void {
    const patient = this.patient();
    if (patient) {
      this.router.navigate(['/professional/patients/edit', patient.id]);
    }
  }

  /**
   * Navegar a nuevo turno
   */
  protected newAppointment(): void {
    const patient = this.patient();
    if (patient) {
      this.router.navigate(['/professional/appointments/new'], {
        queryParams: { patientId: patient.id }
      });
    }
  }

  /**
   * Volver a la lista
   */
  protected goBack(): void {
    this.router.navigate(['/professional/patients']);
  }

  /**
   * Calcular edad
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Obtener iniciales del nombre
   */
  protected getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /**
   * Formatear grupo sanguíneo
   */
  protected formatBloodType(bloodType?: string): string {
    return bloodType || 'No especificado';
  }

  /**
   * Obtener clase de color para grupo sanguíneo
   */
  protected getBloodTypeColor(bloodType?: string): string {
    if (!bloodType) return 'bg-gray-100 text-gray-800';

    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-100 text-red-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-100 text-blue-800',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-100 text-purple-800',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-100 text-green-800'
    };

    return colors[bloodType] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtener nombre legible del tipo de registro
   */
  protected getRecordTypeName(type: MedicalRecordType): string {
    const names: Record<MedicalRecordType, string> = {
      [MedicalRecordType.CONSULTATION]: 'Consulta',
      [MedicalRecordType.DIAGNOSIS]: 'Diagnóstico',
      [MedicalRecordType.PRESCRIPTION]: 'Prescripción',
      [MedicalRecordType.LAB_RESULT]: 'Resultado de Laboratorio',
      [MedicalRecordType.PROCEDURE]: 'Procedimiento',
      [MedicalRecordType.VACCINATION]: 'Vacunación',
      [MedicalRecordType.ALLERGY]: 'Alergia',
      [MedicalRecordType.NOTE]: 'Nota General'
    };
    return names[type] || type;
  }

  /**
   * Obtener clase de color para tipo de registro
   */
  protected getRecordTypeColor(type: MedicalRecordType): string {
    const colors: Record<MedicalRecordType, string> = {
      [MedicalRecordType.CONSULTATION]: 'border-blue-500 bg-blue-50',
      [MedicalRecordType.DIAGNOSIS]: 'border-red-500 bg-red-50',
      [MedicalRecordType.PRESCRIPTION]: 'border-green-500 bg-green-50',
      [MedicalRecordType.LAB_RESULT]: 'border-purple-500 bg-purple-50',
      [MedicalRecordType.PROCEDURE]: 'border-orange-500 bg-orange-50',
      [MedicalRecordType.VACCINATION]: 'border-teal-500 bg-teal-50',
      [MedicalRecordType.ALLERGY]: 'border-yellow-500 bg-yellow-50',
      [MedicalRecordType.NOTE]: 'border-gray-500 bg-gray-50'
    };
    return colors[type] || 'border-gray-500 bg-gray-50';
  }

  /**
   * Marcar todos los campos del formulario como touched
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
   * Verificar si un campo tiene errores
   */
  protected hasError(fieldName: string): boolean {
    const field = this.medicalRecordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtener mensaje de error
   */
  protected getErrorMessage(fieldName: string): string {
    const field = this.medicalRecordForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('minlength')) return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    return '';
  }
}