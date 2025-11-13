import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientsService } from '../../../core/services/patients.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Patient, PatientFilters } from '../../../core/models';
import { DateFormatPipe } from '../../../shared/pipes';
import { Modal } from '../../../shared/components/modal/modal';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DateFormatPipe, Modal],
  templateUrl: './patients.html',
  styleUrls: ['./patients.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Patients implements OnInit {
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);
  private readonly toastService = inject(ToastService);

  // State
  protected readonly isLoading = signal(true);
  protected readonly patients = signal<Patient[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly showDeleteModal = signal(false);
  protected readonly patientToDelete = signal<Patient | null>(null);

  // Computed
  protected readonly filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allPatients = this.patients();

    if (!term) return allPatients;

    return allPatients.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.dni.includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phone.includes(term)
    );
  });

  protected readonly totalPatients = computed(() => this.patients().length);
  protected readonly activePatients = computed(() =>
    this.patients().filter(p => p.isActive).length
  );

  ngOnInit(): void {
    this.loadPatients();
  }

  /**
   * Cargar lista de pacientes
   */
  private loadPatients(): void {
    this.isLoading.set(true);

    this.patientsService.getAll().subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.toastService.error('Error', 'No se pudieron cargar los pacientes');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Buscar pacientes
   */
  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  /**
   * Ver detalle del paciente
   */
  protected viewPatient(patient: Patient): void {
    this.router.navigate(['/professional/patients', patient.id]);
  }

  /**
   * Navegar a crear nuevo paciente
   */
  protected newPatient(): void {
    this.router.navigate(['/professional/patients/new']);
  }

  /**
   * Navegar a editar paciente
   */
  protected editPatient(patient: Patient): void {
    this.router.navigate(['/professional/patients/edit', patient.id]);
  }

  /**
   * Abrir modal de confirmación para eliminar
   */
  protected confirmDelete(patient: Patient): void {
    this.patientToDelete.set(patient);
    this.showDeleteModal.set(true);
  }

  /**
   * Cancelar eliminación
   */
  protected cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.patientToDelete.set(null);
  }

  /**
   * Eliminar paciente
   */
  protected deletePatient(): void {
    const patient = this.patientToDelete();
    if (!patient) return;

    this.patientsService.delete(patient.id).subscribe({
      next: () => {
        this.toastService.success('Éxito', 'Paciente eliminado correctamente');
        this.loadPatients();
        this.cancelDelete();
      },
      error: (error) => {
        console.error('Error deleting patient:', error);
        this.toastService.error('Error', 'No se pudo eliminar el paciente');
      }
    });
  }

  /**
   * Calcular edad
   */
  protected calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Obtener iniciales del nombre
   */
  protected getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /**
   * Crear nuevo turno para el paciente
   */
  protected newAppointment(patient: Patient): void {
    this.router.navigate(['/professional/appointments/new'], {
      queryParams: { patientId: patient.id }
    });
  }
}
