import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentStatus } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [ngClass]="getBadgeClasses()"
    >
      {{ getStatusLabel() }}
    </span>
  `,
  styles: []
})
export class StatusBadgeComponent {
  @Input() status!: AppointmentStatus;

  getBadgeClasses(): string {
    const baseClasses = '';

    switch (this.status) {
      case AppointmentStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case AppointmentStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case AppointmentStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case AppointmentStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case AppointmentStatus.NO_SHOW:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getStatusLabel(): string {
    switch (this.status) {
      case AppointmentStatus.SCHEDULED:
        return 'Programado';
      case AppointmentStatus.CONFIRMED:
        return 'Confirmado';
      case AppointmentStatus.IN_PROGRESS:
        return 'En Espera';
      case AppointmentStatus.COMPLETED:
        return 'Atendido';
      case AppointmentStatus.CANCELLED:
        return 'Cancelado';
      case AppointmentStatus.NO_SHOW:
        return 'Ausente';
      default:
        return 'Desconocido';
    }
  }
}
