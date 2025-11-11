/**
 * Días de la semana
 */
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

/**
 * Estado del horario
 */
export enum ScheduleStatus {
  ACTIVE = 'active',           // Activo
  INACTIVE = 'inactive',       // Inactivo
  TEMPORARY = 'temporary'      // Temporal (vacaciones, licencia, etc.)
}

/**
 * Horario de trabajo del profesional
 */
export interface Schedule {
  id: string;
  professionalId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;           // Formato: "HH:mm"
  endTime: string;             // Formato: "HH:mm"
  slotDuration: number;        // Duración de cada turno en minutos
  status: ScheduleStatus;
  validFrom?: Date;            // Fecha desde la cual es válido
  validUntil?: Date;           // Fecha hasta la cual es válido
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Bloqueo de horario (para días no laborables, vacaciones, etc.)
 */
export interface ScheduleBlock {
  id: string;
  professionalId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;          // Si es null, bloquea todo el día
  endTime?: string;
  reason: string;
  recurring?: boolean;         // Si se repite anualmente
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos para crear un horario
 */
export interface CreateScheduleDto {
  professionalId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration: number;
  status?: ScheduleStatus;
  validFrom?: Date;
  validUntil?: Date;
  notes?: string;
}

/**
 * Datos para actualizar un horario
 */
export interface UpdateScheduleDto {
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
  status?: ScheduleStatus;
  validFrom?: Date;
  validUntil?: Date;
  notes?: string;
}

/**
 * Datos para crear un bloqueo
 */
export interface CreateScheduleBlockDto {
  professionalId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  reason: string;
  recurring?: boolean;
}

/**
 * Configuración de disponibilidad
 */
export interface AvailabilityConfig {
  professionalId: string;
  schedules: Schedule[];
  blocks: ScheduleBlock[];
  defaultSlotDuration: number;
  minAdvanceBooking: number;   // Días mínimos de anticipación
  maxAdvanceBooking: number;   // Días máximos de anticipación
}
