import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Appointment, 
  CreateAppointmentDto, 
  UpdateAppointmentDto,
  AppointmentFilters,
  AppointmentStats, 
  AppointmentStatus
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/appointments`;

  private appointments = signal<Appointment[]>([]);
  readonly appointments$ = this.appointments.asReadonly();

  /**
   * Obtener todos los turnos
   */
  getAll(filters?: AppointmentFilters): Observable<Appointment[]> {
    const params = this.buildQueryParams(filters);
    
    return this.http.get<Appointment[]>(this.API_URL, { params }).pipe(
      tap(appointments => this.appointments.set(appointments))
    );
  }

  /**
   * Obtener turno por ID
   */
  getById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevo turno
   */
  create(data: CreateAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(this.API_URL, data).pipe(
      tap(appointment => {
        this.appointments.update(current => [...current, appointment]);
      })
    );
  }

  /**
   * Actualizar turno
   */
  update(id: string, data: UpdateAppointmentDto): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.API_URL}/${id}`, data).pipe(
      tap(updated => {
        this.appointments.update(current =>
          current.map(a => a.id === id ? updated : a)
        );
      })
    );
  }

  /**
   * Eliminar turno
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.appointments.update(current =>
          current.filter(a => a.id !== id)
        );
      })
    );
  }

  /**
   * Confirmar turno
   */
  confirm(id: string): Observable<Appointment> {
    return this.update(id, { status: AppointmentStatus.CONFIRMED });
  }

  /**
   * Cancelar turno
   */
  cancel(id: string, reason?: string): Observable<Appointment> {
    return this.update(id, { 
      status: AppointmentStatus.CANCELLED,
      reason: reason
    });
  }

  /**
   * Obtener turnos de hoy
   */
  getToday(): Observable<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getAll({
      startDate: today,
      endDate: tomorrow
    });
  }

  /**
   * Obtener estadísticas de turnos
   */
  getStats(): Observable<AppointmentStats> {
    return this.http.get<AppointmentStats>(`${this.API_URL}/stats`);
  }

  /**
   * Obtener horarios disponibles
   */
  getAvailableSlots(professionalId: string, date: Date): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/available`, {
      params: {
        professionalId,
        date: date.toISOString()
      }
    });
  }

  /**
   * Construir parámetros de query
   */
  private buildQueryParams(filters?: AppointmentFilters): any {
    if (!filters) return {};

    const params: any = {};

    if (filters.professionalId) params.professionalId = filters.professionalId;
    if (filters.patientId) params.patientId = filters.patientId;
    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate.toISOString();
    if (filters.endDate) params.endDate = filters.endDate.toISOString();
    if (filters.type) params.type = filters.type;

    return params;
  }
}