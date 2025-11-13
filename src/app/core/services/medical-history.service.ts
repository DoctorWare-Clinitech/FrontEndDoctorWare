import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicalHistory, Diagnosis, Allergy, Medication } from '../models';

/**
 * DTOs para crear registros médicos
 */
export interface CreateMedicalHistoryDto {
  patientId: string;
  type: string;
  date: Date;
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
}

export interface CreateDiagnosisDto {
  patientId: string;
  appointmentId?: string;
  code?: string;
  name: string;
  description?: string;
  severity: string;
  diagnosisDate: Date;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

export interface CreateAllergyDto {
  patientId: string;
  allergen: string;
  type: 'medication' | 'food' | 'environmental' | 'other';
  severity: string;
  symptoms?: string;
  diagnosedDate?: Date;
  notes?: string;
}

export interface CreateMedicationDto {
  patientId: string;
  appointmentId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: Date;
  endDate?: Date;
  instructions?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalHistoryService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/medical-history`;

  /**
   * Obtener historia clínica del paciente
   */
  getHistory(patientId: string): Observable<MedicalHistory[]> {
    return this.http.get<MedicalHistory[]>(`${this.API_URL}/patient/${patientId}`);
  }

  /**
   * Obtener registro específico de historia clínica
   */
  getById(id: string): Observable<MedicalHistory> {
    return this.http.get<MedicalHistory>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevo registro en historia clínica
   */
  create(data: CreateMedicalHistoryDto): Observable<MedicalHistory> {
    return this.http.post<MedicalHistory>(this.API_URL, data);
  }

  /**
   * Actualizar registro de historia clínica
   */
  update(id: string, data: Partial<MedicalHistory>): Observable<MedicalHistory> {
    return this.http.put<MedicalHistory>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Eliminar registro de historia clínica
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // ========== Diagnósticos ==========

  /**
   * Obtener diagnósticos del paciente
   */
  getDiagnoses(patientId: string): Observable<Diagnosis[]> {
    return this.http.get<Diagnosis[]>(`${environment.apiBaseUrl}/diagnoses/patient/${patientId}`);
  }

  /**
   * Crear nuevo diagnóstico
   */
  createDiagnosis(data: CreateDiagnosisDto): Observable<Diagnosis> {
    return this.http.post<Diagnosis>(`${environment.apiBaseUrl}/diagnoses`, data);
  }

  /**
   * Actualizar diagnóstico
   */
  updateDiagnosis(id: string, data: Partial<Diagnosis>): Observable<Diagnosis> {
    return this.http.put<Diagnosis>(`${environment.apiBaseUrl}/diagnoses/${id}`, data);
  }

  // ========== Alergias ==========

  /**
   * Obtener alergias del paciente
   */
  getAllergies(patientId: string): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(`${environment.apiBaseUrl}/allergies/patient/${patientId}`);
  }

  /**
   * Crear nueva alergia
   */
  createAllergy(data: CreateAllergyDto): Observable<Allergy> {
    return this.http.post<Allergy>(`${environment.apiBaseUrl}/allergies`, data);
  }

  /**
   * Actualizar alergia
   */
  updateAllergy(id: string, data: Partial<Allergy>): Observable<Allergy> {
    return this.http.put<Allergy>(`${environment.apiBaseUrl}/allergies/${id}`, data);
  }

  /**
   * Desactivar alergia
   */
  deactivateAllergy(id: string): Observable<Allergy> {
    return this.http.patch<Allergy>(`${environment.apiBaseUrl}/allergies/${id}/deactivate`, {});
  }

  // ========== Medicamentos ==========

  /**
   * Obtener medicamentos activos del paciente
   */
  getMedications(patientId: string): Observable<Medication[]> {
    return this.http.get<Medication[]>(`${environment.apiBaseUrl}/medications/patient/${patientId}`);
  }

  /**
   * Crear nueva prescripción
   */
  createMedication(data: CreateMedicationDto): Observable<Medication> {
    return this.http.post<Medication>(`${environment.apiBaseUrl}/medications`, data);
  }

  /**
   * Actualizar medicamento
   */
  updateMedication(id: string, data: Partial<Medication>): Observable<Medication> {
    return this.http.put<Medication>(`${environment.apiBaseUrl}/medications/${id}`, data);
  }

  /**
   * Marcar medicamento como inactivo
   */
  discontinueMedication(id: string): Observable<Medication> {
    return this.http.patch<Medication>(`${environment.apiBaseUrl}/medications/${id}/discontinue`, {});
  }
}
