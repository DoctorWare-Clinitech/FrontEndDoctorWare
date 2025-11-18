import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Table, TableColumn } from '../../../shared/components/table/table';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast.service';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  DateFormatPipe,
  TimeAgoPipe,
  InitialsPipe
} from '../../../shared/pipes';
import {
  Appointment,
  AppointmentStats,
  AppointmentStatus,
  AppointmentType,
  AppointmentFilters
} from '../../../core/models';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { finalize } from 'rxjs';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

@Component({
  selector: 'app-appointments',
  imports: [
    Table,
    Modal,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    DateFormatPipe,
    TimeAgoPipe,
    InitialsPipe
  ],
  templateUrl: './appointments.html',
  styleUrls: ['./appointments.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Appointments implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly authService = inject(AuthService);

  // State
  protected readonly isLoading = signal(true);
  protected readonly appointments = this.appointmentsService.appointments;
  protected readonly selectedAppointment = signal<Appointment | null>(null);
  protected readonly showDetailModal = signal(false);
  protected readonly showFilterModal = signal(false);
  protected readonly dateFilter = signal<DateFilter>('all');
  protected readonly isEditingObservations = signal(false);
  protected tempObservations = '';

  protected filterForm!: FormGroup;

  protected readonly stats = signal<AppointmentStats>({
    total: 0, scheduled: 0, confirmed: 0, completed: 0, cancelled: 0, noShow: 0
  });

  // Computed
  protected readonly professionalId = computed(() => this.authService.getCurrentUser()?.id || '');

  protected readonly filteredAppointments = computed(() => {
    let data = this.appointments();
    const filters = this.filterForm.value;

    if (filters.status && filters.status !== 'all') {
      data = data.filter(a => a.status === filters.status);
    }
    if (filters.type && filters.type !== 'all') {
      data = data.filter(a => a.type === filters.type);
    }
    // The table component handles text search, so we don't need to filter by patientName here.
    return data;
  });

  // Table configuration
  protected readonly tableColumns = signal<TableColumn<Appointment>[]>([
    { key: 'date', label: 'Fecha', sortable: true, render: (row) => this.renderDate(row) },
    { key: 'startTime', label: 'Hora', sortable: true, class: 'w-24' },
    { key: 'patientName', label: 'Paciente', sortable: true, render: (row) => this.renderPatient(row) },
    { key: 'type', label: 'Tipo', sortable: true, render: (row) => this.renderType(row.type) },
    { key: 'reason', label: 'Motivo', sortable: true },
    { key: 'status', label: 'Estado', sortable: true, render: (row) => this.renderStatus(row.status) },
    { key: 'actions', label: 'Acciones', render: (row) => this.renderActions(row) }
  ]);

  protected readonly tableConfig = {
    showPagination: true,
    pageSize: 15,
    showSearch: true,
    searchPlaceholder: 'Buscar por paciente...'
  };

  // Options
  protected readonly statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'scheduled', label: 'Agendado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'in_progress', label: 'En curso' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'no_show', label: 'No asistió' }
  ];

  protected readonly typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'first_visit', label: 'Primera vez' },
    { value: 'follow_up', label: 'Control' },
    { value: 'emergency', label: 'Urgencia' },
    { value: 'routine', label: 'Rutina' },
    { value: 'specialist', label: 'Especialista' }
  ];

  ngOnInit(): void {
    this.initFilterForm();
    this.loadInitialData();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      status: ['all'],
      type: ['all'],
    });
  }

  private loadInitialData(): void {
    this.loadAppointments(); // Load all appointments initially
    this.loadStats();
  }

  private loadAppointments(filters: Partial<AppointmentFilters> = {}): void {
    const profId = this.professionalId();
    if (!profId) return;

    const finalFilters: AppointmentFilters = { professionalId: profId, ...filters };

    this.isLoading.set(true);
    this.appointmentsService.loadAll(finalFilters)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        error: (error) => this.toastService.error('Error', 'No se pudieron cargar los turnos')
      });
  }

  private loadStats(): void {
    const profId = this.professionalId();
    if (!profId) return;

    this.appointmentsService.getStats(profId).subscribe({
      next: (stats) => this.stats.set(stats),
      error: (error) => this.toastService.error('Error', 'No se pudieron cargar las estadísticas')
    });
  }

  protected setDateFilter(filter: DateFilter): void {
    this.dateFilter.set(filter);
    const today = new Date();
    let dateFilters: Partial<AppointmentFilters> = {};

    switch (filter) {
      case 'today':
        dateFilters = { startDate: startOfDay(today), endDate: endOfDay(today) };
        break;
      case 'week':
        dateFilters = { startDate: startOfWeek(today, { weekStartsOn: 1 }), endDate: endOfWeek(today, { weekStartsOn: 1 }) };
        break;
      case 'month':
        dateFilters = { startDate: startOfMonth(today), endDate: endOfMonth(today) };
        break;
      case 'all':
        dateFilters = {};
        break;
    }
    this.loadAppointments(dateFilters);
  }

  protected openFilterModal(): void {
    this.showFilterModal.set(true);
  }

  protected closeFilterModal(): void {
    this.showFilterModal.set(false);
  }

  protected clearFilters(): void {
    this.filterForm.reset({ status: 'all', type: 'all' });
    this.setDateFilter('all');
  }

  protected onRowClick(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.showDetailModal.set(true);
  }

  protected closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedAppointment.set(null);
  }

  private refreshData(): void {
    // Reload appointments with the current date filter
    this.setDateFilter(this.dateFilter());
    this.loadStats();
  }

  // All other methods (confirm, cancel, etc.) remain the same but call refreshData()

  protected confirmAppointment(appointment: Appointment): void {
    this.appointmentsService.confirm(appointment.id).subscribe({
      next: () => {
        this.toastService.success('Turno confirmado', `Turno con ${appointment.patientName} confirmado`);
        this.refreshData();
      },
      error: (error) => this.handleError(error, 'confirmar')
    });
  }

  protected startAppointment(appointment: Appointment): void {
    this.appointmentsService.update(appointment.id, { status: AppointmentStatus.IN_PROGRESS }).subscribe({
      next: () => {
        this.toastService.info('Turno iniciado', 'El turno está en curso');
        this.refreshData();
        this.closeDetailModal();
      },
      error: (error) => this.handleError(error, 'iniciar')
    });
  }

  protected completeAppointment(appointment: Appointment): void {
    this.appointmentsService.update(appointment.id, { status: AppointmentStatus.COMPLETED }).subscribe({
      next: () => {
        this.toastService.success('Turno completado', 'El turno se completó correctamente');
        this.refreshData();
        this.closeDetailModal();
        this.router.navigate(['/professional/patients', appointment.patientId]);
      },
      error: (error) => this.handleError(error, 'completar')
    });
  }

  protected cancelAppointment(appointment: Appointment): void {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;

    this.appointmentsService.cancel(appointment.id, reason).subscribe({
      next: () => {
        this.toastService.warning('Turno cancelado', `Turno con ${appointment.patientName} cancelado`);
        this.refreshData();
        this.closeDetailModal();
      },
      error: (error) => this.handleError(error, 'cancelar')
    });
  }

  protected markAsNoShow(appointment: Appointment): void {
    if (confirm('¿Confirmar que el paciente no asistió?')) {
      this.appointmentsService.update(appointment.id, { status: AppointmentStatus.NO_SHOW }).subscribe({
        next: () => {
          this.toastService.warning('Marcado como no asistió', 'El turno se marcó como no asistió');
          this.refreshData();
          this.closeDetailModal();
        },
        error: (error) => this.handleError(error, 'actualizar')
      });
    }
  }

  protected goToPatient(patientId: string): void {
    this.router.navigate(['/professional/patients', patientId]);
  }

  protected enableEditObservations(): void {
    const appointment = this.selectedAppointment();
    if (appointment) {
      this.tempObservations = appointment.observations || '';
      this.isEditingObservations.set(true);
    }
  }

  protected cancelEditObservations(): void {
    this.isEditingObservations.set(false);
    this.tempObservations = '';
  }

  protected saveObservations(): void {
    const appointment = this.selectedAppointment();
    if (!appointment) return;

    const observations = this.tempObservations.trim();

    this.appointmentsService.update(appointment.id, { observations }).subscribe({
      next: () => {
        this.toastService.success('Guardado', 'Observaciones clínicas guardadas correctamente');
        this.refreshData();
        this.isEditingObservations.set(false);
        this.tempObservations = '';
        this.selectedAppointment.update(apt => apt ? { ...apt, observations } : null);
      },
      error: (error) => this.handleError(error, 'guardar las observaciones')
    });
  }

  protected exportToCSV(): void {
    this.toastService.info('Exportando', 'Generando archivo CSV...');
    // TODO: Implementación de exportación
  }

  private handleError(error: any, action: string): void {
    console.error(`Error ${action} appointment:`, error);
    this.toastService.error('Error', `No se pudo ${action} el turno`);
  }

  // Render methods
  private renderDate(row: Appointment): string {
    const date = new Date(row.date);
    const dateStr = date.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' });
    return `<span class="font-medium">${dateStr}</span>`;
  }

  private renderPatient(row: Appointment): string {
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

  public renderType(type: string): string {
    const types: Record<string, { label: string; class: string }> = {
      first_visit: { label: 'Primera vez', class: 'bg-blue-100 text-blue-800' },
      follow_up: { label: 'Control', class: 'bg-green-100 text-green-800' },
      emergency: { label: 'Urgencia', class: 'bg-red-100 text-red-800' },
      routine: { label: 'Rutina', class: 'bg-gray-100 text-gray-800' },
      specialist: { label: 'Especialista', class: 'bg-purple-100 text-purple-800' }
    };
    const config = types[type] || { label: type, class: 'bg-gray-100 text-gray-800' };
    return `<span class="px-2 py-1 rounded text-xs font-medium ${config.class}">${config.label}</span>`;
  }

  public renderStatus(status: string): string {
    const statuses: Record<string, { label: string; class: string }> = {
      scheduled: { label: 'Agendado', class: 'bg-blue-100 text-blue-800' },
      confirmed: { label: 'Confirmado', class: 'bg-green-100 text-green-800' },
      in_progress: { label: 'En curso', class: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completado', class: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
      no_show: { label: 'No asistió', class: 'bg-yellow-100 text-yellow-800' }
    };
    const config = statuses[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${config.class}">${config.label}</span>`;
  }

  private renderActions(row: Appointment): string {
    return `<button class="text-sm text-primary-600 hover:text-primary-800 font-medium">Ver detalles</button>`;
  }

  private getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
