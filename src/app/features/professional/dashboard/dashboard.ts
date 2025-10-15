import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Table, TableColumn } from '../../../shared/components/table/table';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast.service';
import { 
  DateFormatPipe, 
  TimeAgoPipe, 
  CurrencyFormatPipe,
  DniFormatPipe,
  PhoneFormatPipe,
  InitialsPipe
} from '../../../shared/pipes';

interface Appointment {
  id: string;
  patient: string;
  date: string;
  time: string;
  status: string;
  dni?: string;
  phone?: string;
  price?: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    Table, 
    Modal,
    DateFormatPipe,
    TimeAgoPipe,
    CurrencyFormatPipe,
    DniFormatPipe,
    PhoneFormatPipe,
    InitialsPipe
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ today | dateFormat:'EEEE, dd MMMM yyyy' }}
          </p>
        </div>
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
          <p class="text-xs text-gray-500 mt-1">
            Actualizado {{ lastUpdate | timeAgo }}
          </p>
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
        <div class="space-y-4">
          <p>Formulario de nuevo turno aquí...</p>
          
          <!-- Ejemplo de pipes en el modal -->
          <div class="card bg-gray-50">
            <h3 class="font-semibold mb-2">Ejemplo de formato</h3>
            <div class="space-y-2 text-sm">
              <div>
                <strong>Fecha:</strong> {{ today | dateFormat:'dd/MM/yyyy' }}
              </div>
              <div>
                <strong>DNI:</strong> {{ '12345678' | dniFormat }}
              </div>
              <div>
                <strong>Teléfono:</strong> {{ '541112345678' | phoneFormat }}
              </div>
              <div>
                <strong>Precio:</strong> {{ 5000 | currencyFormat }}
              </div>
            </div>
          </div>
        </div>
        
        <div footer class="flex gap-3">
          <button 
            type="button" 
            (click)="showModal.set(false)" 
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            (click)="createAppointment()" 
            class="btn-primary"
          >
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

  protected readonly today = new Date();
  protected readonly lastUpdate = new Date(Date.now() - 30 * 60 * 1000); // 30 minutos atrás

  protected readonly showModal = signal(false);
  protected readonly appointments = signal<Appointment[]>([
    { 
      id: '1', 
      patient: 'Carlos Rodríguez', 
      date: '2024-10-15', 
      time: '10:00', 
      status: 'Confirmado',
      dni: '12345678',
      phone: '541112345678',
      price: 5000
    },
    { 
      id: '2', 
      patient: 'Ana García', 
      date: '2024-10-15', 
      time: '11:00', 
      status: 'Pendiente',
      dni: '23456789',
      phone: '541123456789',
      price: 5000
    },
    { 
      id: '3', 
      patient: 'Luis Martínez', 
      date: '2024-10-15', 
      time: '14:00', 
      status: 'Confirmado',
      dni: '34567890',
      phone: '541134567890',
      price: 5000
    }
  ]);

  protected readonly columns = signal<TableColumn<Appointment>[]>([
    { 
      key: 'patient', 
      label: 'Paciente', 
      sortable: true,
      render: (row) => {
        const initials = row.patient.split(' ').map(n => n[0]).join('');
        return `
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
              ${initials}
            </div>
            <span>${row.patient}</span>
          </div>
        `;
      }
    },
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
    this.toastService.info(
      'Turno seleccionado', 
      `Paciente: ${appointment.patient} - DNI: ${appointment.dni}`
    );
  }

  protected createAppointment(): void {
    this.toastService.success('Turno creado', 'El turno se creó correctamente');
    this.showModal.set(false);
  }
}