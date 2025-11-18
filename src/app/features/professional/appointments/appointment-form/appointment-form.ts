import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { PatientsService } from '../../../../core/services/patients.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ScheduleService } from '../../../../core/services/schedule.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CreateAppointmentDto, Patient, AvailableSlot } from '../../../../core/models';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './appointment-form.html',
  styleUrls: ['./appointment-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly patientsService = inject(PatientsService);
  private readonly authService = inject(AuthService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly toastService = inject(ToastService);

  // State
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly patients = signal<Patient[]>([]);
  protected readonly selectedPatientId = signal<string | null>(null);
  protected readonly availableTimes = signal<AvailableSlot[]>([]);
  protected readonly isLoadingTimes = signal(false);

  protected appointmentForm!: FormGroup;

  protected readonly typeOptions = [
    { value: 'first_visit', label: 'Primera vez' },
    { value: 'follow_up', label: 'Control' },
    { value: 'emergency', label: 'Urgencia' },
    { value: 'routine', label: 'Rutina' },
    { value: 'specialist', label: 'Especialista' }
  ];

  protected readonly durationOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' }
  ];

  protected readonly professionalId = computed(() => this.authService.getCurrentUser()?.id || '');

  protected readonly selectedPatient = computed(() => {
    const patientId = this.selectedPatientId();
    return this.patients().find(p => p.id === patientId);
  });

  ngOnInit(): void {
    this.initForm();
    this.loadPatients();
    this.handleQueryParams();
    this.listenForDateChanges();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.appointmentForm = this.fb.group({
      patientId: ['', [Validators.required]],
      date: [today, [Validators.required]],
      startTime: ['', [Validators.required]],
      duration: [30, [Validators.required]],
      type: ['first_visit', [Validators.required]],
      reason: [''],
      notes: ['']
    });

    this.appointmentForm.get('patientId')?.valueChanges.subscribe(patientId => {
      this.selectedPatientId.set(patientId || null);
    });
  }

  private handleQueryParams(): void {
    const patientId = this.route.snapshot.queryParamMap.get('patientId');
    const date = this.route.snapshot.queryParamMap.get('date');
    const time = this.route.snapshot.queryParamMap.get('time');

    const patchData: { [key: string]: any } = {};
    if (patientId) patchData['patientId'] = patientId;
    if (date) patchData['date'] = date;
    if (time) patchData['startTime'] = time;
    
    this.appointmentForm.patchValue(patchData);
  }

  private listenForDateChanges(): void {
    const dateControl = this.appointmentForm.get('date');
    if (!dateControl) return;

    dateControl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(() => {
        this.isLoadingTimes.set(true);
        this.availableTimes.set([]);
        this.appointmentForm.get('startTime')?.setValue('');
      }),
      debounceTime(300),
      switchMap(dateStr => {
        const profId = this.professionalId();
        if (!dateStr || !profId) return [];
        const date = new Date(dateStr);
        return this.scheduleService.getAvailableSlots(profId, date);
      })
    ).subscribe(slots => {
      this.availableTimes.set(slots.filter(s => s.available));
      this.isLoadingTimes.set(false);
    });

    // Trigger initial load
    dateControl.updateValueAndValidity();
  }

  private loadPatients(): void {
    this.isLoading.set(true);
    const profId = this.professionalId();
    if (!profId) {
      this.isLoading.set(false);
      return;
    }

    this.patientsService.getAll({ professionalId: profId, isActive: true }).subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error', 'No se pudieron cargar los pacientes');
        this.isLoading.set(false);
      }
    });
  }

  protected onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched(this.appointmentForm);
      this.toastService.warning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);
    const profId = this.professionalId();
    if (!profId) {
      this.isSaving.set(false);
      return;
    }

    const formValue = this.appointmentForm.value;
    const dateAsUTC = new Date(formValue.date + 'T00:00:00Z');

    const dto: CreateAppointmentDto = {
      patientId: formValue.patientId,
      professionalId: profId,
      date: dateAsUTC,
      startTime: formValue.startTime,
      duration: Number(formValue.duration),
      type: formValue.type,
      reason: formValue.reason || undefined,
      notes: formValue.notes || undefined
    };

    this.appointmentsService.create(dto).subscribe({
      next: () => {
        this.toastService.success('Éxito', 'Turno creado exitosamente');
        this.router.navigate(['/professional/appointments']);
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'No se pudo crear el turno';
        this.toastService.error('Error', errorMsg);
        this.isSaving.set(false);
      }
    });
  }

  protected cancel(): void {
    if (this.appointmentForm.dirty) {
      if (confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
        this.goBack();
      }
    } else {
      this.goBack();
    }
  }

  private goBack(): void {
    this.router.navigate(['/professional/appointments']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  protected hasError(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.appointmentForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('pattern')) return 'Formato inválido (HH:mm)';
    return '';
  }

  protected getPatientAge(patient: Patient): number {
    if (!patient.dateOfBirth) return 0;
    const today = new Date();
    const birth = new Date(patient.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}