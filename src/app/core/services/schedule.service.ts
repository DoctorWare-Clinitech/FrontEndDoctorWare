import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  duration: number; // minutos por consulta
  isActive: boolean;
}

export interface BlockedSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string;
  createdAt: Date;
}

export interface ScheduleConfig {
  professionalId: string;
  timeSlots: TimeSlot[];
  blockedSlots: BlockedSlot[];
  consultationDuration: number; // duración por defecto en minutos
}

export interface AvailableSlot {
  date: Date;
  time: string;
  available: boolean;
  appointmentId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/schedule`;

  private scheduleConfig = signal<ScheduleConfig | null>(null);
  readonly scheduleConfig$ = this.scheduleConfig.asReadonly();

  /**
   * Obtener configuración de agenda
   */
  getConfig(professionalId: string): Observable<ScheduleConfig> {
    return this.http.get<ScheduleConfig>(`${this.API_URL}/${professionalId}`).pipe(
      tap(config => this.scheduleConfig.set(config))
    );
  }

  /**
   * Actualizar configuración de agenda
   */
  updateConfig(professionalId: string, config: Partial<ScheduleConfig>): Observable<ScheduleConfig> {
    return this.http.put<ScheduleConfig>(`${this.API_URL}/${professionalId}`, config).pipe(
      tap(updated => this.scheduleConfig.set(updated))
    );
  }

  /**
   * Agregar horario disponible
   */
  addTimeSlot(professionalId: string, slot: Omit<TimeSlot, 'id'>): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(`${this.API_URL}/${professionalId}/slots`, slot);
  }

  /**
   * Actualizar horario disponible
   */
  updateTimeSlot(professionalId: string, slotId: string, slot: Partial<TimeSlot>): Observable<TimeSlot> {
    return this.http.put<TimeSlot>(`${this.API_URL}/${professionalId}/slots/${slotId}`, slot);
  }

  /**
   * Eliminar horario disponible
   */
  deleteTimeSlot(professionalId: string, slotId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${professionalId}/slots/${slotId}`);
  }

  /**
   * Bloquear horario
   */
  blockSlot(professionalId: string, block: Omit<BlockedSlot, 'id' | 'createdAt'>): Observable<BlockedSlot> {
    return this.http.post<BlockedSlot>(`${this.API_URL}/${professionalId}/blocks`, block);
  }

  /**
   * Desbloquear horario
   */
  unblockSlot(professionalId: string, blockId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${professionalId}/blocks/${blockId}`);
  }

  /**
   * Obtener horarios disponibles para una fecha
   */
  getAvailableSlots(professionalId: string, date: Date): Observable<AvailableSlot[]> {
    return this.http.get<AvailableSlot[]>(`${this.API_URL}/${professionalId}/available`, {
      params: {
        date: date.toISOString()
      }
    });
  }

  /**
   * Obtener todos los bloques de un rango de fechas
   */
  getBlockedSlots(professionalId: string, startDate: Date, endDate: Date): Observable<BlockedSlot[]> {
    return this.http.get<BlockedSlot[]>(`${this.API_URL}/${professionalId}/blocks`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  }
}