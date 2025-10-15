import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Table, TableColumn } from '../../../shared/components/table/table';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast.service';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { PatientsService } from '../../../core/services/patients.service';
import { AuthService } from '../../../core/services/auth.service';
import { 
  DateFormatPipe, 
  TimeAgoPipe, 
  InitialsPipe 
} from '../../../shared/pipes';
import { Appointment } from '../../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';

interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  pendingAppointments: number;
  completedToday: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    Table,
    Modal,
    DateFormatPipe,
    TimeAgoPipe,
    InitialsPipe
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly patientsService = inject(PatientsService);
  private readonly authService = inject(AuthService);

  // State
  protected readonly isLoading = signal(true);
  protected readonly showNewAppointmentModal = signal(false);
  protected readonly selectedAppointment = signal<Appointment | null>(null);
  protected readonly todayAppointments = signal<Appointment[]>([]);
  protected readonly stats = signal<DashboardStats>({
    todayAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    completedToday: 0
  });
  protected readonly today = new Date();

  // Computed
  protected readonly currentUser = toSignal(this.authService.currentUser$);
  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  });

  // Table configuration
  protected readonly tableColumns = signal<TableColumn<Appointment>[]>([
    {
      key: 'startTime',
      label: 'Hora',
      sortable: true,
      class: 'w-24'
    },
    {
      key: 'patientName',
      label: 'Paciente',
      sortable: true,
      render: (row) => {
        const initials = this.getInitials(row.patientName);
        return `
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">
              ${initials}
            </div>
            <span class="font-medium">${row.patientName}</span>
          </div>
        `;
      }
    },
    {
      key: 'reason',
      label: 'Motivo',
      sortable: true
    },
    {
      key: 'status',
      label: 'Estado',
      render: (row) => this.renderStatus(row.status)
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => this.renderActions(row)
    }
  ]);

  protected readonly tableConfig = {
    showPagination: true,
    pageSize: 10,
    showSearch: true,
    searchPlaceholder: 'Buscar turnos...'
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Cargar datos del dashboard
   */
  public loadDashboardData(): void {
    this.isLoading.set(true);

    // Cargar turnos de hoy
    this.appointmentsService.getToday().subscribe({
      next: (appointments) => {
        this.todayAppointments.set(appointments);
        this.calculateStats(appointments);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.toastService.error('Error', 'No se pudieron cargar los turnos');
        this.isLoading.set(false);
      }
    });

    // Cargar pacientes para el contador
    this.patientsService.getAll().subscribe({
      next: (patients) => {
        this.stats.update(s => ({ ...s, totalPatients: patients.length }));
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });
  }

  /**
   * Calcular estadísticas
   */
  private calculateStats(appointments: Appointment[]): void {
    const stats: DashboardStats = {
      todayAppointments: appointments.length,
      totalPatients: this.stats().totalPatients,
      pendingAppointments: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
      completedToday: appointments.filter(a => a.status === 'completed').length
    };

    this.stats.set(stats);
  }

  /**
   * Manejar click en fila de tabla
   */
  protected onRowClick(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.router.navigate(['/professional/appointments', appointment.id]);
  }

  /**
   * Confirmar turno
   */
  protected confirmAppointment(appointment: Appointment, event: Event): void {
    event.stopPropagation();

    this.appointmentsService.confirm(appointment.id).subscribe({
      next: () => {
        this.toastService.success('Turno confirmado', `Turno con ${appointment.patientName} confirmado`);
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('Error confirming appointment:', error);
        this.toastService.error('Error', 'No se pudo confirmar el turno');
      }
    });
  }

  /**
   * Cancelar turno
   */
  protected cancelAppointment(appointment: Appointment, event: Event): void {
    event.stopPropagation();

    if (confirm('¿Estás seguro de cancelar este turno?')) {
      this.appointmentsService.cancel(appointment.id, 'Cancelado por el profesional').subscribe({
        next: () => {
          this.toastService.warning('Turno cancelado', `Turno con ${appointment.patientName} cancelado`);
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error canceling appointment:', error);
          this.toastService.error('Error', 'No se pudo cancelar el turno');
        }
      });
    }
  }

  /**
   * Navegar a agenda
   */
  protected goToSchedule(): void {
    this.router.navigate(['/professional/schedule']);
  }

  /**
   * Navegar a pacientes
   */
  protected goToPatients(): void {
    this.router.navigate(['/professional/patients']);
  }

  /**
   * Abrir modal de nuevo turno
   */
  protected openNewAppointmentModal(): void {
    this.showNewAppointmentModal.set(true);
  }

  /**
   * Cerrar modal de nuevo turno
   */
  protected closeNewAppointmentModal(): void {
    this.showNewAppointmentModal.set(false);
  }

  /**
   * Crear nuevo turno
   */
  protected createAppointment(): void {
    this.toastService.info('Funcionalidad en desarrollo', 'Redirigiendo a la agenda...');
    this.closeNewAppointmentModal();
    setTimeout(() => this.goToSchedule(), 1000);
  }

  /**
   * Renderizar estado
   */
  private renderStatus(status: string): string {
    const statusConfig: Record<string, { label: string; class: string }> = {
      scheduled: { label: 'Agendado', class: 'bg-blue-100 text-blue-800' },
      confirmed: { label: 'Confirmado', class: 'bg-green-100 text-green-800' },
      in_progress: { label: 'En curso', class: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completado', class: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
      no_show: { label: 'No asistió', class: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${config.class}">${config.label}</span>`;
  }

  /**
   * Renderizar acciones
   */
  private renderActions(row: Appointment): string {
    if (row.status === 'scheduled') {
      return `
        <div class="flex items-center gap-2">
          <button 
            onclick="window.dispatchEvent(new CustomEvent('confirm-appointment', { detail: '${row.id}' }))"
            class="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Confirmar
          </button>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('cancel-appointment', { detail: '${row.id}' }))"
            class="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      `;
    }
    return '-';
  }

  /**
   * Obtener iniciales
   */
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}