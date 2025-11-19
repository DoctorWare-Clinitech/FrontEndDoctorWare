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

  private appointmentsSignal = signal<Appointment[]>([]);
  readonly appointments = this.appointmentsSignal.asReadonly();

  /**
   * Carga los turnos en el estado del servicio y devuelve un observable.
   * Usar este método para la carga principal de datos.
   */
  loadAll(filters?: AppointmentFilters): Observable<Appointment[]> {
    const params = this.buildQueryParams(filters);
    
    return this.http.get<Appointment[]>(this.API_URL, { params }).pipe(
      tap(appointments => this.appointmentsSignal.set(appointments))
    );
  }

  /**
   * Obtiene una lista de turnos basada en filtros, pero NO modifica el estado del servicio.
   * Usar este método para obtener datos para vistas específicas sin efectos secundarios.
   */
  getAll(filters?: AppointmentFilters): Observable<Appointment[]> {
    const params = this.buildQueryParams(filters);
    return this.http.get<Appointment[]>(this.API_URL, { params });
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
        this.appointmentsSignal.update(current => [...current, appointment]);
      })
    );
  }

  /**
   * Actualizar turno
   */
  update(id: string, data: UpdateAppointmentDto): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.API_URL}/${id}`, data).pipe(
      tap(updated => {
        this.appointmentsSignal.update(current =>
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
        this.appointmentsSignal.update(current =>
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
   * Obtener turnos de hoy filtrados por profesional
   */
  getTodayByProfessional(professionalUserId: string): Observable<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getAll({
      professionalId: professionalUserId,
      startDate: today,
      endDate: tomorrow
    });
  }

  /**
   * Obtener estadísticas de turnos
   */
  getStats(professionalUserId?: string): Observable<AppointmentStats> {
    const params: any = {};
    if (professionalUserId) {
      params.professionalUserId = professionalUserId;
    }
    return this.http.get<AppointmentStats>(`${this.API_URL}/stats`, { params });
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
   * Obtener turnos del paciente autenticado (endpoint específico para pacientes)
   * GET /api/me/appointments
   */
  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${environment.apiBaseUrl}/me/appointments`);
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