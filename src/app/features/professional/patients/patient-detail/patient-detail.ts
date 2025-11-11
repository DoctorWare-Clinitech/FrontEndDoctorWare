import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PatientsService } from '../../../../core/services/patients.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Patient, MedicalHistoryEntry } from '../../../../core/models';
import { DateFormatPipe } from '../../../../shared/pipes';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe],
  templateUrl: './patient-detail.html',
  styleUrls: ['./patient-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);
  private readonly toastService = inject(ToastService);

  // State
  protected readonly isLoading = signal(true);
  protected readonly patient = signal<Patient | null>(null);
  protected readonly medicalHistory = signal<MedicalHistoryEntry[]>([]);
  protected readonly activeTab = signal<'info' | 'medical' | 'appointments'>('info');

  // Computed
  protected readonly patientAge = computed(() => {
    const p = this.patient();
    return p ? this.calculateAge(p.dateOfBirth) : 0;
  });

  protected readonly hasEmergencyContact = computed(() => {
    return !!this.patient()?.emergencyContact;
  });

  protected readonly hasMedicalInsurance = computed(() => {
    return !!this.patient()?.medicalInsurance;
  });

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.loadPatient(patientId);
    } else {
      this.toastService.error('Error', 'ID de paciente no válido');
      this.router.navigate(['/professional/patients']);
    }
  }

  /**
   * Cargar datos del paciente
   */
  private loadPatient(id: string): void {
    this.isLoading.set(true);

    this.patientsService.getById(id).subscribe({
      next: (patient) => {
        this.patient.set(patient);
        this.loadMedicalHistory(id);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading patient:', error);
        this.toastService.error('Error', 'No se pudo cargar el paciente');
        this.isLoading.set(false);
        this.router.navigate(['/professional/patients']);
      }
    });
  }

  /**
   * Cargar historia clínica
   */
  private loadMedicalHistory(patientId: string): void {
    this.patientsService.getMedicalHistory(patientId).subscribe({
      next: (history: any[]) => {
        this.medicalHistory.set(history);
      },
      error: (error: any) => {
        console.error('Error loading medical history:', error);
        this.toastService.warning('Advertencia', 'No se pudo cargar la historia clínica');
      }
    });
  }

  /**
   * Cambiar tab activa
   */
  protected setActiveTab(tab: 'info' | 'medical' | 'appointments'): void {
    this.activeTab.set(tab);
  }

  /**
   * Navegar a editar paciente
   */
  protected editPatient(): void {
    const patient = this.patient();
    if (patient) {
      this.router.navigate(['/professional/patients/edit', patient.id]);
    }
  }

  /**
   * Navegar a nuevo turno
   */
  protected newAppointment(): void {
    const patient = this.patient();
    if (patient) {
      this.router.navigate(['/professional/appointments/new'], {
        queryParams: { patientId: patient.id }
      });
    }
  }

  /**
   * Volver a la lista
   */
  protected goBack(): void {
    this.router.navigate(['/professional/patients']);
  }

  /**
   * Calcular edad
   */
  private calculateAge(birthDate: Date): number {
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
   * Formatear grupo sanguíneo
   */
  protected formatBloodType(bloodType?: string): string {
    return bloodType || 'No especificado';
  }

  /**
   * Obtener clase de color para grupo sanguíneo
   */
  protected getBloodTypeColor(bloodType?: string): string {
    if (!bloodType) return 'bg-gray-100 text-gray-800';

    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-100 text-red-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-100 text-blue-800',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-100 text-purple-800',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-100 text-green-800'
    };

    return colors[bloodType] || 'bg-gray-100 text-gray-800';
  }
}
