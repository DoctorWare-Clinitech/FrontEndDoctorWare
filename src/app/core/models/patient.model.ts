/**
 * Tipo de sangre
 */
export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}

/**
 * Género
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

/**
 * Contacto de emergencia
 */
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

/**
 * Obra social / Seguro médico
 */
export interface MedicalInsurance {
  provider: string;
  planName: string;
  memberNumber: string;
  validUntil?: Date;
}

/**
 * Información médica básica
 */
export interface MedicalInfo {
  bloodType?: BloodType;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  surgeries: string[];
  familyHistory?: string;
}

/**
 * Paciente completo
 */
export interface Patient {
  id: string;
  userId?: string;              // ID del usuario si tiene cuenta
  name: string;
  email?: string;
  phone: string;
  dni: string;
  dateOfBirth: Date;
  age: number;
  gender: Gender;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: EmergencyContact;
  medicalInsurance?: MedicalInsurance;
  medicalInfo: MedicalInfo;
  professionalId: string;        // Médico de cabecera
  notes?: string;                // Notas generales
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos para crear paciente
 */
export interface CreatePatientDto {
  name: string;
  email?: string;
  phone: string;
  dni: string;
  dateOfBirth: Date;
  gender: Gender;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: EmergencyContact;
  medicalInsurance?: MedicalInsurance;
  professionalId: string;
}

/**
 * Datos para actualizar paciente
 */
export interface UpdatePatientDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: Partial<Patient['address']>;
  emergencyContact?: EmergencyContact;
  medicalInsurance?: MedicalInsurance;
  notes?: string;
  isActive?: boolean;
}

/**
 * Historia clínica - Entrada
 */
export interface MedicalHistoryEntry {
  id: string;
  patientId: string;
  professionalId: string;
  professionalName: string;
  appointmentId?: string;
  date: Date;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  prescriptions: Prescription[];
  followUp?: string;
  attachments?: string[];        // URLs de archivos adjuntos
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Receta médica
 */
export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

/**
 * Resumen del paciente
 */
export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  dni: string;
  phone: string;
  lastAppointment?: Date;
  nextAppointment?: Date;
  totalAppointments: number;
  activeConditions: number;
}

/**
 * Filtros para búsqueda de pacientes
 */
export interface PatientFilters {
  name?: string;
  dni?: string;
  email?: string;
  phone?: string;
  professionalId?: string;
  isActive?: boolean;
}