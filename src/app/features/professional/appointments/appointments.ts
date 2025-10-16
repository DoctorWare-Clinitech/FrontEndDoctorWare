import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
  AppointmentStatus, 
  AppointmentType 
} from '../../../core/models';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

@Component({
  selector: 'app-appointments',
  imports: [
    Table,
    Modal,
    ReactiveFormsModule,
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
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly selectedAppointment = signal<Appointment | null>(null);
  protected readonly showDetailModal = signal(false);
  protected readonly showFilterModal = signal(false);
  protected readonly dateFilter = signal<DateFilter>('all');

  protected filterForm!: FormGroup;

  // Computed
  protected readonly currentUser = this.authService.currentUser$;
  
  protected readonly filteredAppointments = computed(() => {
    let result = this.appointments();
    const filters = this.filterForm?.value;

    if (!filters) return result;

    // Filtrar por estado
    if (filters.status && filters.status !== 'all') {
      result = result.filter(a => a.status === filters.status);
    }

    // Filtrar por tipo
    if (filters.type && filters.type !== 'all') {
      result = result.filter(a => a.type === filters.type);
    }

    // Filtrar por fecha
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter(a => new Date(a.date) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      result = result.filter(a => new Date(a.date) <= endDate);
    }

    // Filtrar por paciente
    if (filters.patientName) {
      const search = filters.patientName.toLowerCase();
      result = result.filter(a => a.patientName.toLowerCase().includes(search));
    }

    return result;
  });

  protected readonly stats = computed(() => {
    const all = this.filteredAppointments();
    return {
      total: all.length,
      scheduled: all.filter(a => a.status === 'scheduled').length,
      confirmed: all.filter(a => a.status === 'confirmed').length,
      completed: all.filter(a => a.status === 'completed').length,
      cancelled: all.filter(a => a.status === 'cancelled').length,
      noShow: all.filter(a => a.status === 'no_show').length
    };
  });

  // Table configuration
  protected readonly tableColumns = signal<TableColumn<Appointment>[]>([
    {
      key: 'date',
      label: 'Fecha',
      sortable: true,
      render: (row) => this.renderDate(row)
    },
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
      render: (row) => this.renderPatient(row)
    },
    {
      key: 'type',
      label: 'Tipo',
      sortable: true,
      render: (row) => this.renderType(row.type)
    },
    {
      key: 'reason',
      label: 'Motivo',
      sortable: true
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
      render: (row) => this.renderActions(row)
    }
  ]);

  protected readonly tableConfig = {
    showPagination: true,
    pageSize: 15,
    showSearch: true,
    searchPlaceholder: 'Buscar por paciente, motivo...'
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
    this.loadAppointments();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      status: ['all'],
      type: ['all'],
      startDate: [''],
      endDate: [''],
      patientName: ['']
    });

    // Escuchar cambios en el formulario
    this.filterForm.valueChanges.subscribe(() => {
      // Los filtros se aplican automáticamente via computed
    });
  }

  private loadAppointments(): void {
    this.isLoading.set(true);

    this.appointmentsService.getAll().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.toastService.error('Error', 'No se pudieron cargar los turnos');
        this.isLoading.set(false);
      }
    });
  }

  protected setDateFilter(filter: DateFilter): void {
    this.dateFilter.set(filter);
    const today = new Date();

    switch (filter) {
      case 'today':
        this.filterForm.patchValue({
          startDate: this.formatDate(startOfDay(today)),
          endDate: this.formatDate(endOfDay(today))
        });
        break;
      case 'week':
        this.filterForm.patchValue({
          startDate: this.formatDate(startOfWeek(today, { weekStartsOn: 1 })),
          endDate: this.formatDate(endOfWeek(today, { weekStartsOn: 1 }))
        });
        break;
      case 'month':
        this.filterForm.patchValue({
          startDate: this.formatDate(startOfMonth(today)),
          endDate: this.formatDate(endOfMonth(today))
        });
        break;
      case 'all':
        this.filterForm.patchValue({
          startDate: '',
          endDate: ''
        });
        break;
    }
  }

  protected openFilterModal(): void {
    this.showFilterModal.set(true);
  }

  protected closeFilterModal(): void {
    this.showFilterModal.set(false);
  }

  protected clearFilters(): void {
    this.filterForm.reset({
      status: 'all',
      type: 'all',
      startDate: '',
      endDate: '',
      patientName: ''
    });
    this.dateFilter.set('all');
  }

  protected onRowClick(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.showDetailModal.set(true);
  }

  protected closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedAppointment.set(null);
  }

  protected confirmAppointment(appointment: Appointment): void {
    this.appointmentsService.confirm(appointment.id).subscribe({
      next: () => {
        this.toastService.success('Turno confirmado', `Turno con ${appointment.patientName} confirmado`);
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error confirming appointment:', error);
        this.toastService.error('Error', 'No se pudo confirmar el turno');
      }
    });
  }

  protected startAppointment(appointment: Appointment): void {
    this.appointmentsService.update(appointment.id, { status: AppointmentStatus.IN_PROGRESS }).subscribe({
      next: () => {
        this.toastService.info('Turno iniciado', 'El turno está en curso');
        this.loadAppointments();
        this.closeDetailModal();
      },
      error: (error) => {
        console.error('Error starting appointment:', error);
        this.toastService.error('Error', 'No se pudo iniciar el turno');
      }
    });
  }

  protected completeAppointment(appointment: Appointment): void {
    this.appointmentsService.update(appointment.id, { status: AppointmentStatus.COMPLETED }).subscribe({
      next: () => {
        this.toastService.success('Turno completado', 'El turno se completó correctamente');
        this.loadAppointments();
        this.closeDetailModal();
        // Redirigir a historia clínica
        this.router.navigate(['/professional/patients', appointment.patientId, 'history', 'new']);
      },
      error: (error) => {
        console.error('Error completing appointment:', error);
        this.toastService.error('Error', 'No se pudo completar el turno');
      }
    });
  }

  protected cancelAppointment(appointment: Appointment): void {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;

    this.appointmentsService.cancel(appointment.id, reason).subscribe({
      next: () => {
        this.toastService.warning('Turno cancelado', `Turno con ${appointment.patientName} cancelado`);
        this.loadAppointments();
        this.closeDetailModal();
      },
      error: (error) => {
        console.error('Error canceling appointment:', error);
        this.toastService.error('Error', 'No se pudo cancelar el turno');
      }
    });
  }

  protected markAsNoShow(appointment: Appointment): void {
    if (confirm('¿Confirmar que el paciente no asistió?')) {
      this.appointmentsService.update(appointment.id, { status: AppointmentStatus.NO_SHOW }).subscribe({
        next: () => {
          this.toastService.warning('Marcado como no asistió', 'El turno se marcó como no asistió');
          this.loadAppointments();
          this.closeDetailModal();
        },
        error: (error) => {
          console.error('Error marking no show:', error);
          this.toastService.error('Error', 'No se pudo actualizar el turno');
        }
      });
    }
  }

  protected goToPatient(patientId: string): void {
    this.router.navigate(['/professional/patients', patientId]);
  }

  protected exportToCSV(): void {
    this.toastService.info('Exportando', 'Generando archivo CSV...');
    // Implementación de exportación
  }

  // Render methods
  private renderDate(row: Appointment): string {
    const date = new Date(row.date);
    const dateStr = date.toLocaleDateString('es-AR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    });
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
    if (row.status === 'scheduled' || row.status === 'confirmed') {
      return `
        <button 
          class="text-sm text-primary-600 hover:text-primary-800 font-medium"
          onclick="event.stopPropagation()"
        >
          Ver detalles
        </button>
      `;
    }
    return '-';
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}