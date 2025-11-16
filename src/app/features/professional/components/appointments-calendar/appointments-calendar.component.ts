import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  appointments: Appointment[];
}

@Component({
  selector: 'app-appointments-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './appointments-calendar.component.html',
  styleUrl: './appointments-calendar.component.scss'
})
export class AppointmentsCalendarComponent implements OnInit, OnDestroy {
  selectedDate: Date = new Date();
  selectedDateString: string = '';
  appointments: Appointment[] = [];
  timeSlots: TimeSlot[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Horario de trabajo (8:00 AM - 8:00 PM)
  readonly START_HOUR = 8;
  readonly END_HOUR = 20;
  readonly SLOT_DURATION = 30; // minutos

  private destroy$ = new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateSelectedDateString();
    this.generateTimeSlots();
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSelectedDateString(): void {
    this.selectedDateString = this.selectedDate.toISOString().split('T')[0];
  }

  private generateTimeSlots(): void {
    this.timeSlots = [];

    for (let hour = this.START_HOUR; hour < this.END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += this.SLOT_DURATION) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeSlots.push({
          time: timeString,
          hour,
          minute,
          appointments: []
        });
      }
    }
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = null;

    const startDate = new Date(this.selectedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(this.selectedDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    this.appointmentService.getAppointments({
      startDate,
      endDate
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.distributeAppointmentsToSlots();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.error = 'Error al cargar los turnos. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
  }

  private distributeAppointmentsToSlots(): void {
    // Limpiar appointments de todos los slots
    this.timeSlots.forEach(slot => slot.appointments = []);

    // Distribuir appointments a los slots correspondientes
    this.appointments.forEach(appointment => {
      const [hours, minutes] = appointment.startTime.split(':').map(Number);

      const slot = this.timeSlots.find(s =>
        s.hour === hours && s.minute === minutes
      );

      if (slot) {
        slot.appointments.push(appointment);
      }
    });
  }

  onDateChange(): void {
    this.selectedDate = new Date(this.selectedDateString);
    this.loadAppointments();
  }

  previousDay(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.selectedDate = new Date(this.selectedDate); // Trigger change detection
    this.updateSelectedDateString();
    this.loadAppointments();
  }

  nextDay(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.selectedDate = new Date(this.selectedDate); // Trigger change detection
    this.updateSelectedDateString();
    this.loadAppointments();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.updateSelectedDateString();
    this.loadAppointments();
  }

  getFormattedDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return this.selectedDate.toLocaleDateString('es-ES', options);
  }

  isToday(): boolean {
    const today = new Date();
    return this.selectedDate.toDateString() === today.toDateString();
  }

  getSlotHeight(appointment: Appointment): number {
    // Calcula la altura del slot basado en la duración
    // Cada 30 minutos = 80px (altura base del slot)
    return (appointment.duration / this.SLOT_DURATION) * 80;
  }

  getAppointmentClasses(appointment: Appointment): string {
    const baseClass = 'appointment-block';
    let statusClass = '';

    switch (appointment.status) {
      case AppointmentStatus.SCHEDULED:
        statusClass = 'status-scheduled';
        break;
      case AppointmentStatus.CONFIRMED:
        statusClass = 'status-confirmed';
        break;
      case AppointmentStatus.IN_PROGRESS:
        statusClass = 'status-in-progress';
        break;
      case AppointmentStatus.COMPLETED:
        statusClass = 'status-completed';
        break;
      case AppointmentStatus.CANCELLED:
        statusClass = 'status-cancelled';
        break;
      case AppointmentStatus.NO_SHOW:
        statusClass = 'status-no-show';
        break;
    }

    return `${baseClass} ${statusClass}`;
  }

  viewAppointment(id: string): void {
    this.router.navigate(['/professional/appointments', id]);
  }

  createAppointmentAtTime(timeSlot: TimeSlot): void {
    // Navegar al formulario con fecha y hora pre-seleccionadas
    this.router.navigate(['/professional/appointments/new'], {
      queryParams: {
        date: this.selectedDateString,
        time: timeSlot.time
      }
    });
  }

  getTotalAppointments(): number {
    return this.appointments.length;
  }

  getAppointmentsByStatus(status: AppointmentStatus): number {
    return this.appointments.filter(a => a.status === status).length;
  }
}
