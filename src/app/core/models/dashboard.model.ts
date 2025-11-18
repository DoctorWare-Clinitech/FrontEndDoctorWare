/**
 * Dashboard Models
 * Interfaces para el Dashboard del Profesional
 */

import { Appointment } from './appointment.model';

/**
 * Estadísticas de turnos del backend
 */
export interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

/**
 * Estadísticas calculadas para el Dashboard
 */
export interface DashboardStats {
  todayTotal: number;
  todayPending: number;
  todayCompleted: number;
  totalPatients: number;
}

/**
 * Datos consolidados del Dashboard
 */
export interface DashboardData {
  stats: DashboardStats;
  todayAppointments: Appointment[];
  loading: boolean;
  error: string | null;
}

/**
 * Filtros para cargar datos del Dashboard
 */
export interface DashboardFilters {
  professionalUserId: string;
  date?: Date;
}
