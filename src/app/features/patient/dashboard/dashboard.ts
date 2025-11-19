import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Table, TableColumn } from '../../../shared/components/table/table';
import { ToastService } from '../../../shared/services/toast.service';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import { DateFormatPipe } from '../../../shared/pipes';
import { Appointment } from '../../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';

interface PatientDashboardStats {
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalAppointments: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Table,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly authService = inject(AuthService);

  // State
  protected readonly isLoading = signal(true);
  protected readonly upcomingAppointments = signal<Appointment[]>([]);
  protected readonly stats = signal<PatientDashboardStats>({
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalAppointments: 0
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
      key: 'date',
      label: 'Fecha',
      sortable: true,
      class: 'w-32',
      render: (row) => {
        const date = new Date(row.date);
        return date.toLocaleDateString('es-AR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short'
        });
      }
    },
    {
      key: 'startTime',
      label: 'Hora',
      sortable: true,
      class: 'w-24'
    },
    {
      key: 'professionalName',
      label: 'Profesional',
      sortable: true,
      render: (row) => {
        const initials = this.getInitials(row.professionalName);
        return `
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium mr-3">
              ${initials}
            </div>
            <span class="font-medium">${row.professionalName}</span>
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
    }
  ]);

  protected readonly tableConfig = {
    showPagination: true,
    pageSize: 5,
    showSearch: false
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Cargar datos del dashboard
   */
  public async loadDashboardData(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Obtener todos los turnos del paciente usando el endpoint específico
      const appointments = await this.getPatientAppointments();

      if (!appointments) {
        this.isLoading.set(false);
        return;
      }

      // Filtrar turnos próximos (fecha >= hoy y estados no finalizados)
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming = appointments.filter(a => {
        const appointmentDate = new Date(a.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate >= now &&
               (a.status === 'scheduled' || a.status === 'confirmed');
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      this.upcomingAppointments.set(upcoming.slice(0, 5)); // Mostrar solo los próximos 5

      // Calcular estadísticas
      const dashboardStats: PatientDashboardStats = {
        upcomingAppointments: upcoming.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
        totalAppointments: appointments.length
      };

      this.stats.set(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.toastService.error('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtener turnos del paciente (endpoint específico)
   */
  private async getPatientAppointments(): Promise<Appointment[]> {
    try {
      // Usar el endpoint específico GET /api/me/appointments
      return await this.appointmentsService.getMyAppointments().toPromise() || [];
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      this.toastService.error('Error', 'No se pudieron cargar los turnos');
      return [];
    }
  }

  /**
   * Navegar a mis turnos
   */
  protected goToMyAppointments(): void {
    this.router.navigate(['/patient/my-appointments']);
  }

  /**
   * Navegar a agendar turno
   */
  protected goToBookAppointment(): void {
    this.router.navigate(['/patient/book-appointment']);
  }

  /**
   * Navegar a perfil
   */
  protected goToProfile(): void {
    this.router.navigate(['/patient/profile']);
  }

  /**
   * Manejar click en fila de tabla
   */
  protected onRowClick(appointment: Appointment): void {
    this.router.navigate(['/patient/my-appointments'], {
      queryParams: { appointmentId: appointment.id }
    });
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
