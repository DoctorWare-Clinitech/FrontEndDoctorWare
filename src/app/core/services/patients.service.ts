import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Patient, 
  CreatePatientDto, 
  UpdatePatientDto,
  PatientFilters,
  PatientSummary 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/patients`;

  private patients = signal<Patient[]>([]);
  readonly patients$ = this.patients.asReadonly();

  /**
   * Obtener todos los pacientes
   */
  getAll(filters?: PatientFilters): Observable<Patient[]> {
    const params = this.buildQueryParams(filters);
    
    return this.http.get<Patient[]>(this.API_URL, { params }).pipe(
      tap(patients => this.patients.set(patients))
    );
  }

  /**
   * Obtener paciente por ID
   */
  getById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevo paciente
   */
  create(data: CreatePatientDto): Observable<Patient> {
    return this.http.post<Patient>(this.API_URL, data).pipe(
      tap(patient => {
        this.patients.update(current => [...current, patient]);
      })
    );
  }

  /**
   * Actualizar paciente
   */
  update(id: string, data: UpdatePatientDto): Observable<Patient> {
    return this.http.put<Patient>(`${this.API_URL}/${id}`, data).pipe(
      tap(updated => {
        this.patients.update(current =>
          current.map(p => p.id === id ? updated : p)
        );
      })
    );
  }

  /**
   * Eliminar paciente
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.patients.update(current =>
          current.filter(p => p.id !== id)
        );
      })
    );
  }

  /**
   * Obtener historial médico del paciente
   */
  getHistory(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${patientId}/history`);
  }

  /**
   * Obtener historial médico del paciente (alias de getHistory)
   */
  getMedicalHistory(patientId: string): Observable<any[]> {
    return this.getHistory(patientId);
  }

  /**
   * Obtener resumen de pacientes
   */
  getSummary(): Observable<PatientSummary[]> {
    return this.http.get<PatientSummary[]>(`${this.API_URL}/summary`);
  }

  /**
   * Construir parámetros de query
   */
  private buildQueryParams(filters?: PatientFilters): any {
    if (!filters) return {};

    const params: any = {};

    if (filters.name) params.name = filters.name;
    if (filters.dni) params.dni = filters.dni;
    if (filters.email) params.email = filters.email;
    if (filters.phone) params.phone = filters.phone;
    if (filters.professionalId) params.professionalId = filters.professionalId;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;

    return params;
  }
}