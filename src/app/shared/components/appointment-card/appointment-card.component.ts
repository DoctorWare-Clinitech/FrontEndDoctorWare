import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment/appointment.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './appointment-card.component.html',
  styleUrl: './appointment-card.component.scss'
})
export class AppointmentCardComponent {
  @Input() appointment!: Appointment;
  @Input() showPatient: boolean = true;
  @Input() showProfessional: boolean = false;
  @Input() compact: boolean = false;

  @Output() onView = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<string>();
  @Output() onConfirm = new EventEmitter<string>();
  @Output() onComplete = new EventEmitter<string>();

  AppointmentStatus = AppointmentStatus;

  viewAppointment(): void {
    this.onView.emit(this.appointment.id);
  }

  editAppointment(): void {
    this.onEdit.emit(this.appointment.id);
  }

  cancelAppointment(): void {
    this.onCancel.emit(this.appointment.id);
  }

  confirmAppointment(): void {
    this.onConfirm.emit(this.appointment.id);
  }

  completeAppointment(): void {
    this.onComplete.emit(this.appointment.id);
  }

  getAppointmentTime(): string {
    return `${this.appointment.startTime} - ${this.appointment.endTime}`;
  }

  canConfirm(): boolean {
    return this.appointment.status === AppointmentStatus.SCHEDULED;
  }

  canComplete(): boolean {
    return this.appointment.status === AppointmentStatus.CONFIRMED ||
           this.appointment.status === AppointmentStatus.IN_PROGRESS;
  }

  canCancel(): boolean {
    return this.appointment.status !== AppointmentStatus.COMPLETED &&
           this.appointment.status !== AppointmentStatus.CANCELLED;
  }
}
