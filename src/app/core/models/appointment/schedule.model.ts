// Corresponds to ScheduleTimeSlotDto in backend
export interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  duration: number; // minutes per consultation
  isActive: boolean;
}

// Corresponds to ScheduleBlockedSlotDto in backend
export interface BlockedSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string;
  createdAt: Date;
}

// Corresponds to ScheduleConfigDto in backend
export interface ScheduleConfig {
  professionalId: string;
  timeSlots: TimeSlot[];
  blockedSlots: BlockedSlot[];
  consultationDuration: number; // default duration in minutes
}

// Corresponds to ScheduleAvailableSlotDto in backend
export interface AvailableSlot {
  date: Date;
  time: string;
  available: boolean;
  appointmentId?: string;
  duration: number; // This was missing
}

// DTO for creating a time slot
export type CreateTimeSlotDto = Omit<TimeSlot, 'id'>;

// DTO for updating a time slot
export type UpdateTimeSlotDto = Partial<Omit<TimeSlot, 'id'>>;

// DTO for creating a blocked slot
export type CreateBlockedSlotDto = Omit<BlockedSlot, 'id' | 'createdAt'>;

// DTO for updating the schedule config
export type UpdateScheduleConfigDto = Partial<Omit<ScheduleConfig, 'professionalId' | 'timeSlots' | 'blockedSlots'>>;