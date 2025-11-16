// User models
export * from './user.model';

// Appointment models
export * from './appointment.model';

// Patient models
export * from './patient.model';

// Medical history models
export * from './medical-history.model';

// Clinical notes models
export * from './clinical-note.model';

// Schedule models
export * from './schedule.model';

// Specialty models (explicit exports to avoid conflicts)
export { Specialty, CreateSpecialtyDto, UpdateSpecialtyDto } from './specialty.model';