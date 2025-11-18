import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import {
  Appointment,
  AppointmentFilters,
  AppointmentStatus,
  AppointmentType
} from '../../../../core/models/appointment/appointment.model';
import { AppointmentCardComponent } from '../../../../shared/components/appointment-card/appointment-card.component';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentCardComponent],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.scss'
})
export class AppointmentsListComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading: boolean = false;
  error: string | null = null;
  searchTerm: string = '';

  // Filtros
  filters: AppointmentFilters = {};
  selectedStatus: string = '';
  selectedType: string = '';
  startDate: string = '';
  endDate: string = '';

  // Opciones para los selectores
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: AppointmentStatus.SCHEDULED, label: 'Programado' },
    { value: AppointmentStatus.CONFIRMED, label: 'Confirmado' },
    { value: AppointmentStatus.IN_PROGRESS, label: 'En Espera' },
    { value: AppointmentStatus.COMPLETED, label: 'Atendido' },
    { value: AppointmentStatus.CANCELLED, label: 'Cancelado' },
    { value: AppointmentStatus.NO_SHOW, label: 'Ausente' }
  ];

  typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: AppointmentType.FIRST_VISIT, label: 'Primera consulta' },
    { value: AppointmentType.FOLLOW_UP, label: 'Control' },
    { value: AppointmentType.EMERGENCY, label: 'Urgencia' },
    { value: AppointmentType.ROUTINE, label: 'Rutina' },
    { value: AppointmentType.SPECIALIST, label: 'Especialista' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = null;

    this.appointmentService.getAppointments(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.error = 'Error al cargar los turnos. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      // Filtro por búsqueda de texto
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const matchesSearch =
          appointment.patientName.toLowerCase().includes(searchLower) ||
          appointment.professionalName.toLowerCase().includes(searchLower) ||
          (appointment.reason?.toLowerCase().includes(searchLower) ?? false);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.filters.status = this.selectedStatus as AppointmentStatus || undefined;
    this.loadAppointments();
  }

  onTypeChange(): void {
    this.filters.type = this.selectedType as AppointmentType || undefined;
    this.loadAppointments();
  }

  onDateChange(): void {
    if (this.startDate) {
      this.filters.startDate = new Date(this.startDate);
    } else {
      delete this.filters.startDate;
    }

    if (this.endDate) {
      this.filters.endDate = new Date(this.endDate);
    } else {
      delete this.filters.endDate;
    }

    this.loadAppointments();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.startDate = '';
    this.endDate = '';
    this.filters = {};
    this.loadAppointments();
  }

  // Manejadores de eventos del AppointmentCard
  onViewAppointment(id: string): void {
    this.router.navigate(['/professional/appointments', id]);
  }

  onEditAppointment(id: string): void {
    this.router.navigate(['/professional/appointments', id, 'edit']);
  }

  onConfirmAppointment(id: string): void {
    const appointment = this.appointments.find(a => a.id === id);
    if (!appointment) return;

    // Actualizar el estado a confirmado
    const updateData = { status: AppointmentStatus.CONFIRMED };

    this.appointmentService.updateAppointment(id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error confirming appointment:', error);
          this.error = 'Error al confirmar el turno. Por favor, intente nuevamente.';
        }
      });
  }

  onCompleteAppointment(id: string): void {
    const appointment = this.appointments.find(a => a.id === id);
    if (!appointment) return;

    // Actualizar el estado a completado
    const updateData = { status: AppointmentStatus.COMPLETED };

    this.appointmentService.updateAppointment(id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error completing appointment:', error);
          this.error = 'Error al completar el turno. Por favor, intente nuevamente.';
        }
      });
  }

  onCancelAppointment(id: string): void {
    if (!confirm('¿Está seguro de que desea cancelar este turno?')) {
      return;
    }

    this.appointmentService.cancelAppointment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error cancelling appointment:', error);
          this.error = 'Error al cancelar el turno. Por favor, intente nuevamente.';
        }
      });
  }

  createNewAppointment(): void {
    this.router.navigate(['/professional/appointments/new']);
  }
}
