import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilters,
  AppointmentStats
} from '../models/appointment/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly API_URL = `${environment.apiBaseUrl}/appointments`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene lista de turnos con filtros opcionales
   */
  getAppointments(filters?: AppointmentFilters): Observable<Appointment[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.professionalId) {
        params = params.set('professionalId', filters.professionalId);
      }
      if (filters.patientId) {
        params = params.set('patientId', filters.patientId);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate.toISOString());
      }
    }

    return this.http.get<Appointment[]>(this.API_URL, { params });
  }

  /**
   * Obtiene un turno por ID
   */
  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea un nuevo turno
   */
  createAppointment(data: CreateAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(this.API_URL, data);
  }

  /**
   * Actualiza un turno existente
   */
  updateAppointment(id: string, data: UpdateAppointmentDto): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Cancela un turno
   */
  cancelAppointment(id: string, reason?: string): Observable<void> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.delete<void>(`${this.API_URL}/${id}`, { params });
  }

  /**
   * Obtiene estadísticas de turnos
   */
  getStats(professionalId?: string): Observable<AppointmentStats> {
    let params = new HttpParams();
    if (professionalId) {
      params = params.set('professionalId', professionalId);
    }
    return this.http.get<AppointmentStats>(`${this.API_URL}/stats`, { params });
  }

  /**
   * Obtiene turnos del día actual
   */
  getTodayAppointments(professionalId?: string): Observable<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getAppointments({
      professionalId,
      startDate: today,
      endDate: tomorrow
    });
  }

  /**
   * Obtiene próximos turnos
   */
  getUpcomingAppointments(professionalId?: string, days: number = 7): Observable<Appointment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    return this.getAppointments({
      professionalId,
      startDate: today,
      endDate: endDate
    });
  }
}
