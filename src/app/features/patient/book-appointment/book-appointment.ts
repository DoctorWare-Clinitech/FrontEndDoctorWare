import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Professional {
  id: number;
  firstName: string;
  lastName: string;
  specialty: {
    id: number;
    name: string;
  };
}

interface Specialty {
  id: number;
  name: string;
}

interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookAppointment implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  // State
  protected readonly step = signal<1 | 2 | 3>(1);
  protected readonly isLoadingSpecialties = signal(true);
  protected readonly isLoadingProfessionals = signal(false);
  protected readonly isLoadingSlots = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly specialties = signal<Specialty[]>([]);
  protected readonly professionals = signal<Professional[]>([]);
  protected readonly availableSlots = signal<AvailableSlot[]>([]);
  protected readonly selectedSpecialty = signal<Specialty | null>(null);
  protected readonly selectedProfessional = signal<Professional | null>(null);
  protected readonly selectedDate = signal<string>('');
  protected readonly selectedSlot = signal<AvailableSlot | null>(null);

  // Forms
  protected readonly appointmentForm: FormGroup;

  // Computed
  protected readonly currentUser = signal(this.authService.getCurrentUser());
  protected readonly minDate = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  protected readonly canProceedToStep2 = computed(() => {
    return this.selectedSpecialty() !== null && this.selectedProfessional() !== null;
  });

  protected readonly canProceedToStep3 = computed(() => {
    return this.selectedDate() !== '' && this.selectedSlot() !== null;
  });

  constructor() {
    this.appointmentForm = this.fb.group({
      comments: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadSpecialties();
  }

  /**
   * Cargar especialidades
   */
  private async loadSpecialties(): Promise<void> {
    this.isLoadingSpecialties.set(true);

    try {
      const specialties = await this.http.get<Specialty[]>(
        `${environment.apiBaseUrl}/Specialties`
      ).toPromise();

      this.specialties.set(specialties || []);
    } catch (error) {
      console.error('Error loading specialties:', error);
      this.toastService.error('Error', 'No se pudieron cargar las especialidades');
    } finally {
      this.isLoadingSpecialties.set(false);
    }
  }

  /**
   * Seleccionar especialidad
   */
  protected async selectSpecialty(specialty: Specialty): Promise<void> {
    this.selectedSpecialty.set(specialty);
    this.selectedProfessional.set(null);
    this.professionals.set([]);

    await this.loadProfessionals(specialty.id);
  }

  /**
   * Cargar profesionales por especialidad
   */
  private async loadProfessionals(specialtyId: number): Promise<void> {
    this.isLoadingProfessionals.set(true);

    try {
      const professionals = await this.http.get<Professional[]>(
        `${environment.apiBaseUrl}/Professionals`,
        { params: { specialtyId: specialtyId.toString() } }
      ).toPromise();

      this.professionals.set(professionals || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
      this.toastService.error('Error', 'No se pudieron cargar los profesionales');
    } finally {
      this.isLoadingProfessionals.set(false);
    }
  }

  /**
   * Seleccionar profesional
   */
  protected selectProfessional(professional: Professional): void {
    this.selectedProfessional.set(professional);
  }

  /**
   * Avanzar al paso 2
   */
  protected goToStep2(): void {
    if (this.canProceedToStep2()) {
      this.step.set(2);
    }
  }

  /**
   * Avanzar al paso 3
   */
  protected goToStep3(): void {
    if (this.canProceedToStep3()) {
      this.step.set(3);
    }
  }

  /**
   * Volver al paso anterior
   */
  protected goBack(): void {
    const currentStep = this.step();
    if (currentStep > 1) {
      this.step.set((currentStep - 1) as 1 | 2 | 3);
    }
  }

  /**
   * Cambio de fecha
   */
  protected async onDateChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const date = input.value;

    this.selectedDate.set(date);
    this.selectedSlot.set(null);

    if (date && this.selectedProfessional()) {
      await this.loadAvailableSlots(this.selectedProfessional()!.id, date);
    }
  }

  /**
   * Cargar horarios disponibles
   */
  private async loadAvailableSlots(professionalId: number, date: string): Promise<void> {
    this.isLoadingSlots.set(true);

    try {
      const slots = await this.http.get<AvailableSlot[]>(
        `${environment.apiBaseUrl}/public/professionals/${professionalId}/availability`,
        { params: { date } }
      ).toPromise();

      this.availableSlots.set(slots || []);
    } catch (error) {
      console.error('Error loading available slots:', error);
      this.toastService.error('Error', 'No se pudieron cargar los horarios disponibles');
    } finally {
      this.isLoadingSlots.set(false);
    }
  }

  /**
   * Seleccionar slot
   */
  protected selectSlot(slot: AvailableSlot): void {
    if (slot.available) {
      this.selectedSlot.set(slot);
    }
  }

  /**
   * Confirmar turno
   */
  protected async confirmAppointment(): Promise<void> {
    const professional = this.selectedProfessional();
    const date = this.selectedDate();
    const slot = this.selectedSlot();
    const user = this.currentUser();

    if (!professional || !date || !slot || !user) {
      this.toastService.error('Error', 'Faltan datos para confirmar el turno');
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Verificar si el usuario es un paciente y tiene DNI
      const patientDni = (user as any).dni || '';

      const appointmentData = {
        professionalId: professional.id,
        date: date,
        startTime: slot.startTime,
        patient: {
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ').slice(1).join(' '),
          email: user.email,
          phoneNumber: user.phone || '',
          dni: patientDni
        },
        comments: this.appointmentForm.value.comments || ''
      };

      await this.http.post(
        `${environment.apiBaseUrl}/public/appointments`,
        appointmentData
      ).toPromise();

      this.toastService.success(
        'Turno agendado',
        'Tu turno ha sido solicitado exitosamente. Recibirás una confirmación por email.'
      );

      // Redirigir a mis turnos
      setTimeout(() => {
        this.router.navigate(['/patient/my-appointments']);
      }, 2000);

    } catch (error: any) {
      console.error('Error creating appointment:', error);
      this.toastService.error(
        'Error',
        error?.error?.message || 'No se pudo agendar el turno. Intenta nuevamente.'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Cancelar y volver
   */
  protected cancel(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}
