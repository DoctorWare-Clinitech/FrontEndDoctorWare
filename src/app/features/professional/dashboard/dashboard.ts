import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Table, TableColumn } from '../../../shared/components/table/table';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast.service';

interface Appointment {
  id: string;
  patient: string;
  date: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [Table, Modal],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button 
          type="button"
          (click)="showModal.set(true)"
          class="btn-primary"
        >
          Nuevo Turno
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <h3 class="text-sm font-medium text-gray-500">Turnos Hoy</h3>
          <p class="mt-2 text-3xl font-bold text-primary-600">8</p>
        </div>
        <div class="card">
          <h3 class="text-sm font-medium text-gray-500">Pacientes</h3>
          <p class="mt-2 text-3xl font-bold text-secondary-600">124</p>
        </div>
        <div class="card">
          <h3 class="text-sm font-medium text-gray-500">Pendientes</h3>
          <p class="mt-2 text-3xl font-bold text-yellow-600">3</p>
        </div>
      </div>

      <!-- Table -->
      <div>
        <h2 class="text-xl font-bold text-gray-900 mb-4">Próximos Turnos</h2>
        <app-table
          [data]="appointments()"
          [columns]="columns()"
          [config]="tableConfig"
          (rowClick)="onRowClick($event)"
        />
      </div>

      <!-- Modal Example -->
      <app-modal
        [isOpen]="showModal()"
        (closed)="showModal.set(false)"
        title="Nuevo Turno"
        [showFooter]="true"
      >
        <p>Formulario de nuevo turno aquí...</p>
        
        <div footer class="flex gap-3">
          <button type="button" (click)="showModal.set(false)" class="px-4 py-2 border border-gray-300 rounded-lg">
            Cancelar
          </button>
          <button type="button" (click)="createAppointment()" class="btn-primary">
            Guardar
          </button>
        </div>
      </app-modal>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  private readonly toastService = inject(ToastService);

  protected readonly showModal = signal(false);
  protected readonly appointments = signal<Appointment[]>([
    { id: '1', patient: 'Carlos Rodríguez', date: '2024-10-15', time: '10:00', status: 'Confirmado' },
    { id: '2', patient: 'Ana García', date: '2024-10-15', time: '11:00', status: 'Pendiente' },
    { id: '3', patient: 'Luis Martínez', date: '2024-10-15', time: '14:00', status: 'Confirmado' }
  ]);

  protected readonly columns = signal<TableColumn<Appointment>[]>([
    { key: 'patient', label: 'Paciente', sortable: true },
    { key: 'date', label: 'Fecha', sortable: true },
    { key: 'time', label: 'Hora', sortable: true },
    {
      key: 'status',
      label: 'Estado',
      render: (row) => {
        const colors = {
          'Confirmado': 'bg-green-100 text-green-800',
          'Pendiente': 'bg-yellow-100 text-yellow-800',
          'Cancelado': 'bg-red-100 text-red-800'
        };
        const color = colors[row.status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${color}">${row.status}</span>`;
      }
    }
  ]);

  protected readonly tableConfig = {
    showPagination: true,
    pageSize: 5,
    showSearch: true,
    searchPlaceholder: 'Buscar turnos...'
  };

  protected onRowClick(appointment: Appointment): void {
    this.toastService.info('Turno seleccionado', `Paciente: ${appointment.patient}`);
  }

  protected createAppointment(): void {
    this.toastService.success('Turno creado', 'El turno se creó correctamente');
    this.showModal.set(false);
  }
}