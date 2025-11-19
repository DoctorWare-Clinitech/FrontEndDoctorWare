import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableColumn } from '../../../shared/components/table/table';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast.service';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import { DateFormatPipe } from '../../../shared/pipes';
import { Appointment, AppointmentStatus } from '../../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';

type FilterStatus = 'all' | AppointmentStatus;

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Table,
    Modal,
    DateFormatPipe
  ],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyAppointments implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly authService = inject(AuthService);

  // State
  protected readonly isLoading = signal(true);
  protected readonly allAppointments = signal<Appointment[]>([]);
  protected readonly selectedAppointment = signal<Appointment | null>(null);
  protected readonly showCancelModal = signal(false);
  protected readonly showDetailModal = signal(false);
  protected readonly statusFilter = signal<FilterStatus>('all');
  protected readonly searchQuery = signal('');

  // Computed
  protected readonly currentUser = toSignal(this.authService.currentUser$);

  protected readonly filteredAppointments = computed(() => {
    let appointments = this.allAppointments();

    // Filtrar por estado
    const status = this.statusFilter();
    if (status !== 'all') {
      appointments = appointments.filter(a => a.status === status);
    }

    // Filtrar por búsqueda
    const query = this.searchQuery().toLowerCase();
    if (query) {
      appointments = appointments.filter(a =>
        a.professionalName.toLowerCase().includes(query) ||
        a.reason?.toLowerCase().includes(query)
      );
    }

    // Ordenar por fecha descendente (más reciente primero)
    return appointments.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  protected readonly upcomingCount = computed(() =>
    this.allAppointments().filter(a => {
      const date = new Date(a.date);
      return date >= new Date() && (a.status === 'scheduled' || a.status === 'confirmed');
    }).length
  );

  protected readonly completedCount = computed(() =>
    this.allAppointments().filter(a => a.status === 'completed').length
  );

  protected readonly cancelledCount = computed(() =>
    this.allAppointments().filter(a => a.status === 'cancelled').length
  );

  // Table configuration
  protected readonly tableColumns = signal<TableColumn<Appointment>[]>([
    {
      key: 'date',
      label: 'Fecha',
      sortable: true,
      class: 'w-32',
      render: (row) => {
        const date = new Date(row.date);
        return `
          <div>
            <div class="font-medium">${date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div class="text-xs text-gray-500">${date.toLocaleDateString('es-AR', { weekday: 'long' })}</div>
          </div>
        `;
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
            <div class="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium mr-3">
              ${initials}
            </div>
            <div>
              <div class="font-medium">${row.professionalName}</div>
              ${row.reason ? `<div class="text-xs text-gray-500">${row.reason}</div>` : ''}
            </div>
          </div>
        `;
      }
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (row) => this.renderStatus(row.status)
    },
    {
      key: 'actions',
      label: 'Acciones',
      class: 'w-32',
      render: (row) => this.renderActions(row)
    }
  ]);

  protected readonly tableConfig = {
    showPagination: true,
    pageSize: 10,
    showSearch: false
  };

  ngOnInit(): void {
    this.loadAppointments();

    // Si hay un appointmentId en query params, abrir el detalle
    this.route.queryParams.subscribe(params => {
      if (params['appointmentId']) {
        const appointment = this.allAppointments().find(a => a.id === params['appointmentId']);
        if (appointment) {
          this.viewAppointmentDetail(appointment);
        }
      }
    });
  }

  /**
   * Cargar turnos del paciente
   */
  public async loadAppointments(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Usar el endpoint específico GET /api/me/appointments
      const appointments = await this.appointmentsService.getMyAppointments().toPromise();

      this.allAppointments.set(appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      this.toastService.error('Error', 'No se pudieron cargar los turnos');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cambiar filtro de estado
   */
  protected changeStatusFilter(status: FilterStatus): void {
    this.statusFilter.set(status);
  }

  /**
   * Actualizar búsqueda
   */
  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  /**
   * Ver detalle de turno
   */
  protected viewAppointmentDetail(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.showDetailModal.set(true);
  }

  /**
   * Cerrar modal de detalle
   */
  protected closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedAppointment.set(null);
  }

  /**
   * Iniciar cancelación de turno
   */
  protected initiateCancelAppointment(appointment: Appointment, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Verificar que el turno se pueda cancelar
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      this.toastService.warning('Atención', 'Este turno no se puede cancelar');
      return;
    }

    this.selectedAppointment.set(appointment);
    this.showCancelModal.set(true);
  }

  /**
   * Confirmar cancelación de turno
   */
  protected confirmCancelAppointment(): void {
    const appointment = this.selectedAppointment();
    if (!appointment) return;

    this.appointmentsService.cancel(appointment.id, 'Cancelado por el paciente').subscribe({
      next: () => {
        this.toastService.success('Turno cancelado', 'El turno ha sido cancelado exitosamente');
        this.showCancelModal.set(false);
        this.selectedAppointment.set(null);
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error canceling appointment:', error);
        this.toastService.error('Error', 'No se pudo cancelar el turno');
      }
    });
  }

  /**
   * Cerrar modal de cancelación
   */
  protected closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.selectedAppointment.set(null);
  }

  /**
   * Navegar a agendar turno
   */
  protected goToBookAppointment(): void {
    this.router.navigate(['/patient/book-appointment']);
  }

  /**
   * Manejar click en fila de tabla
   */
  protected onRowClick(appointment: Appointment): void {
    this.viewAppointmentDetail(appointment);
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
    const canCancel = row.status === 'scheduled' || row.status === 'confirmed';

    if (canCancel) {
      return `
        <button
          onclick="window.dispatchEvent(new CustomEvent('cancel-patient-appointment', { detail: '${row.id}' }))"
          class="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Cancelar
        </button>
      `;
    }

    return '<span class="text-gray-400 text-sm">-</span>';
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

  /**
   * Listener para eventos custom
   */
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('cancel-patient-appointment', ((event: CustomEvent) => {
        const appointmentId = event.detail;
        const appointment = this.allAppointments().find(a => a.id === appointmentId);
        if (appointment) {
          this.initiateCancelAppointment(appointment);
        }
      }) as EventListener);
    }
  }
}
