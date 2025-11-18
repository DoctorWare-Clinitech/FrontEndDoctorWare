import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest, startWith } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import {
  AppointmentType,
  AppointmentStatus,
  CreateAppointmentDto,
  UpdateAppointmentDto
} from '../../../../core/models/appointment/appointment.model';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss'
})
export class AppointmentFormComponent implements OnInit, OnDestroy {
  appointmentForm!: FormGroup;
  isEditMode: boolean = false;
  appointmentId: string | null = null;
  loading: boolean = false;
  saving: boolean = false;
  error: string | null = null;

  typeOptions = [
    { value: AppointmentType.FIRST_VISIT, label: 'Primera consulta' },
    { value: AppointmentType.FOLLOW_UP, label: 'Control' },
    { value: AppointmentType.EMERGENCY, label: 'Urgencia' },
    { value: AppointmentType.ROUTINE, label: 'Rutina' },
    { value: AppointmentType.SPECIALIST, label: 'Especialista' }
  ];

  durationOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1 hora 30 minutos' },
    { value: 120, label: '2 horas' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupEndTimeCalculation();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.appointmentForm = this.fb.group({
      patientId: ['', [Validators.required]],
      professionalId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: [''], // Calculado automáticamente
      duration: [30, [Validators.required, Validators.min(15), Validators.max(240)]],
      status: [AppointmentStatus.SCHEDULED], // Por defecto "Programado"
      type: [AppointmentType.ROUTINE, [Validators.required]],
      reason: ['', [Validators.maxLength(500)]],
      notes: ['', [Validators.maxLength(1000)]]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.appointmentId = id;
      this.loadAppointment(id);
    }
  }

  private setupEndTimeCalculation(): void {
    // Calcular endTime automáticamente cuando cambia startTime o duration
    combineLatest([
      this.appointmentForm.get('startTime')!.valueChanges.pipe(startWith('')),
      this.appointmentForm.get('duration')!.valueChanges.pipe(startWith(30))
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([startTime, duration]) => {
      if (startTime && duration) {
        const endTime = this.calculateEndTime(startTime, duration);
        this.appointmentForm.patchValue({ endTime }, { emitEvent: false });
      }
    });
  }

  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  private loadAppointment(id: string): void {
    this.loading = true;
    this.error = null;

    this.appointmentService.getAppointment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          // Extraer fecha y hora del formato de fecha completo
          const appointmentDate = new Date(appointment.date);
          const dateString = appointmentDate.toISOString().split('T')[0];

          this.appointmentForm.patchValue({
            patientId: appointment.patientId,
            professionalId: appointment.professionalId,
            date: dateString,
            startTime: appointment.startTime,
            duration: appointment.duration,
            type: appointment.type,
            reason: appointment.reason || '',
            notes: appointment.notes || ''
          });

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading appointment:', error);
          this.error = 'Error al cargar el turno. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched(this.appointmentForm);
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.appointmentForm.value;

    // Combinar fecha y hora
    const dateTime = new Date(`${formValue.date}T${formValue.startTime}`);

    const appointmentData = {
      patientId: formValue.patientId,
      professionalId: formValue.professionalId,
      date: dateTime,
      startTime: formValue.startTime,
      endTime: formValue.endTime, // Incluir endTime calculado
      duration: formValue.duration,
      status: formValue.status, // Incluir status (por defecto SCHEDULED)
      type: formValue.type,
      reason: formValue.reason || undefined,
      notes: formValue.notes || undefined
    };

    if (this.isEditMode && this.appointmentId) {
      this.updateAppointment(this.appointmentId, appointmentData as UpdateAppointmentDto);
    } else {
      this.createAppointment(appointmentData as CreateAppointmentDto);
    }
  }

  private createAppointment(data: CreateAppointmentDto): void {
    this.appointmentService.createAppointment(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          this.saving = false;
          this.router.navigate(['/professional/appointments']);
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.error = 'Error al crear el turno. Por favor, verifique los datos e intente nuevamente.';
          this.saving = false;
        }
      });
  }

  private updateAppointment(id: string, data: UpdateAppointmentDto): void {
    this.appointmentService.updateAppointment(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          this.saving = false;
          this.router.navigate(['/professional/appointments']);
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
          this.error = 'Error al actualizar el turno. Por favor, verifique los datos e intente nuevamente.';
          this.saving = false;
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/professional/appointments']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters para validación
  get patientId() {
    return this.appointmentForm.get('patientId');
  }

  get professionalId() {
    return this.appointmentForm.get('professionalId');
  }

  get date() {
    return this.appointmentForm.get('date');
  }

  get startTime() {
    return this.appointmentForm.get('startTime');
  }

  get endTime() {
    return this.appointmentForm.get('endTime');
  }

  get duration() {
    return this.appointmentForm.get('duration');
  }

  get status() {
    return this.appointmentForm.get('status');
  }

  get type() {
    return this.appointmentForm.get('type');
  }

  get reason() {
    return this.appointmentForm.get('reason');
  }

  get notes() {
    return this.appointmentForm.get('notes');
  }

  // Helpers para mostrar errores
  showError(controlName: string): boolean {
    const control = this.appointmentForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.appointmentForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (control.hasError('min')) {
      return `El valor mínimo es ${control.errors?.['min'].min}`;
    }

    if (control.hasError('max')) {
      return `El valor máximo es ${control.errors?.['max'].max}`;
    }

    if (control.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
