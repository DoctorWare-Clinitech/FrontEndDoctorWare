/**
 * Estados del turno
 */
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',      // Agendado
  CONFIRMED = 'confirmed',       // Confirmado
  IN_PROGRESS = 'in_progress',  // En curso
  COMPLETED = 'completed',       // Completado
  CANCELLED = 'cancelled',       // Cancelado
  NO_SHOW = 'no_show'           // No asistió
}

/**
 * Tipo de consulta
 */
export enum AppointmentType {
  FIRST_VISIT = 'first_visit',         // Primera vez
  FOLLOW_UP = 'follow_up',             // Control
  EMERGENCY = 'emergency',             // Urgencia
  ROUTINE = 'routine',                 // Rutina
  SPECIALIST = 'specialist'            // Especialista
}

/**
 * Interfaz de turno
 */
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  date: Date;
  startTime: string;           // Formato: "HH:mm"
  endTime: string;             // Formato: "HH:mm"
  duration: number;            // en minutos
  status: AppointmentStatus;
  type: AppointmentType;
  reason?: string;             // Motivo de consulta
  notes?: string;              // Notas adicionales
  observations?: string;       // Observaciones del profesional
  createdBy: string;           // ID del usuario que creó el turno
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
}

/**
 * Datos para crear un turno
 */
export interface CreateAppointmentDto {
  patientId: string;
  professionalId: string;
  date: Date;
  startTime: string;
  duration: number;
  type: AppointmentType;
  reason?: string;
  notes?: string;
}

/**
 * Datos para actualizar un turno
 */
export interface UpdateAppointmentDto {
  date?: Date;
  startTime?: string;
  duration?: number;
  status?: AppointmentStatus;
  type?: AppointmentType;
  reason?: string;
  notes?: string;
  observations?: string;
}

/**
 * Filtros para buscar turnos
 */
export interface AppointmentFilters {
  professionalId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
  type?: AppointmentType;
}

/**
 * Horario disponible
 */
export interface AvailableSlot {
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
}

/**
 * Estadísticas de turnos
 */
export interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
}