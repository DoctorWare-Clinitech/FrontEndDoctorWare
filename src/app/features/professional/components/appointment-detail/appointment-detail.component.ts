import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment/appointment.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.scss'
})
export class AppointmentDetailComponent implements OnInit, OnDestroy {
  appointment: Appointment | null = null;
  loading: boolean = false;
  error: string | null = null;
  processing: boolean = false;

  AppointmentStatus = AppointmentStatus;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAppointment(id);
    } else {
      this.router.navigate(['/professional/appointments']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAppointment(id: string): void {
    this.loading = true;
    this.error = null;

    this.appointmentService.getAppointment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          this.appointment = appointment;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading appointment:', error);
          this.error = 'Error al cargar el turno. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/professional/appointments']);
  }

  editAppointment(): void {
    if (this.appointment) {
      this.router.navigate(['/professional/appointments', this.appointment.id, 'edit']);
    }
  }

  confirmAppointment(): void {
    if (!this.appointment) return;

    this.processing = true;
    const updateData = { status: AppointmentStatus.CONFIRMED };

    this.appointmentService.updateAppointment(this.appointment.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.appointment = updated;
          this.processing = false;
        },
        error: (error) => {
          console.error('Error confirming appointment:', error);
          this.error = 'Error al confirmar el turno. Por favor, intente nuevamente.';
          this.processing = false;
        }
      });
  }

  completeAppointment(): void {
    if (!this.appointment) return;

    this.processing = true;
    const updateData = { status: AppointmentStatus.COMPLETED };

    this.appointmentService.updateAppointment(this.appointment.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.appointment = updated;
          this.processing = false;
        },
        error: (error) => {
          console.error('Error completing appointment:', error);
          this.error = 'Error al completar el turno. Por favor, intente nuevamente.';
          this.processing = false;
        }
      });
  }

  cancelAppointment(): void {
    if (!this.appointment) return;

    if (!confirm('¿Está seguro de que desea cancelar este turno?')) {
      return;
    }

    this.processing = true;

    this.appointmentService.cancelAppointment(this.appointment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/professional/appointments']);
        },
        error: (error) => {
          console.error('Error cancelling appointment:', error);
          this.error = 'Error al cancelar el turno. Por favor, intente nuevamente.';
          this.processing = false;
        }
      });
  }

  canConfirm(): boolean {
    return this.appointment?.status === AppointmentStatus.SCHEDULED;
  }

  canComplete(): boolean {
    return this.appointment?.status === AppointmentStatus.CONFIRMED ||
           this.appointment?.status === AppointmentStatus.IN_PROGRESS;
  }

  canEdit(): boolean {
    return this.appointment?.status !== AppointmentStatus.COMPLETED &&
           this.appointment?.status !== AppointmentStatus.CANCELLED;
  }

  canCancel(): boolean {
    return this.appointment?.status !== AppointmentStatus.COMPLETED &&
           this.appointment?.status !== AppointmentStatus.CANCELLED;
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'first_visit': 'Primera consulta',
      'follow_up': 'Control',
      'emergency': 'Urgencia',
      'routine': 'Rutina',
      'specialist': 'Especialista'
    };
    return labels[type] || type;
  }

  getFormattedDate(): string {
    if (!this.appointment) return '';

    const date = new Date(this.appointment.date);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  }
}
