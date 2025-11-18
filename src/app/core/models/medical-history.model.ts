/**
 * Tipo de entrada en la historia clínica
 */
export enum MedicalRecordType {
  CONSULTATION = 'consultation',     // Consulta
  DIAGNOSIS = 'diagnosis',           // Diagnóstico
  PRESCRIPTION = 'prescription',     // Prescripción
  LAB_RESULT = 'lab_result',        // Resultado de laboratorio
  PROCEDURE = 'procedure',           // Procedimiento
  VACCINATION = 'vaccination',       // Vacunación
  ALLERGY = 'allergy',              // Alergia
  NOTE = 'note'                     // Nota general
}

/**
 * Severidad de una condición o alergia
 */
export enum Severity {
  LOW = 'low',           // Baja
  MODERATE = 'moderate', // Moderada
  HIGH = 'high',        // Alta
  CRITICAL = 'critical'  // Crítica
}

/**
 * Historia clínica del paciente
 */
export interface MedicalHistory {
  id: string;
  patientId: string;
  createdBy: string;              // ID del profesional
  createdByName: string;          // Nombre del profesional
  appointmentId?: string;         // Turno asociado (si aplica)
  type: MedicalRecordType;
  date: Date;
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  attachments?: string[];         // URLs de archivos adjuntos
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Diagnóstico médico
 */
export interface Diagnosis {
  id: string;
  patientId: string;
  professionalId: string;
  appointmentId?: string;
  code?: string;                  // Código CIE-10
  name: string;
  description?: string;
  severity: Severity;
  diagnosisDate: Date;
  resolvedDate?: Date;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Alergia del paciente
 */
export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;               // Alérgeno (medicamento, alimento, etc.)
  type: 'medication' | 'food' | 'environmental' | 'other';
  severity: Severity;
  symptoms?: string;
  diagnosedDate?: Date;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Medicamento (para prescripciones)
 */
export interface Medication {
  id: string;
  patientId: string;
  professionalId: string;
  appointmentId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;              // Ej: "Cada 8 horas", "Diario"
  duration: string;               // Ej: "7 días", "1 mes"
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vacuna
 */
export interface Vaccination {
  id: string;
  patientId: string;
  professionalId?: string;
  vaccineName: string;
  dose?: string;                  // Ej: "Primera dosis", "Refuerzo"
  manufacturer?: string;
  batchNumber?: string;
  administrationDate: Date;
  nextDoseDate?: Date;
  location?: string;              // Lugar de administración (brazo, pierna, etc.)
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos para crear una entrada en la historia clínica
 */
export interface CreateMedicalHistoryDto {
  patientId: string;
  appointmentId?: string;
  type: MedicalRecordType;
  date?: Date | string; // Added date property
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  attachments?: string[];
}

/**
 * Datos para actualizar una entrada en la historia clínica
 */
export interface UpdateMedicalHistoryDto {
  title?: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  attachments?: string[];
}

/**
 * Datos para crear un diagnóstico
 */
export interface CreateDiagnosisDto {
  patientId: string;
  appointmentId?: string;
  code?: string;
  name: string;
  description?: string;
  severity: Severity;
  diagnosisDate: Date;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

/**
 * Datos para crear una alergia
 */
export interface CreateAllergyDto {
  patientId: string;
  allergen: string;
  type: 'medication' | 'food' | 'environmental' | 'other';
  severity: Severity;
  symptoms?: string;
  diagnosedDate?: Date;
  notes?: string;
}

/**
 * Datos para crear una prescripción
 */
export interface CreateMedicationDto {
  patientId: string;
  appointmentId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: Date;
  endDate?: Date;
  instructions?: string;
}

/**
 * Datos para crear una vacuna
 */
export interface CreateVaccinationDto {
  patientId: string;
  vaccineName: string;
  dose?: string;
  manufacturer?: string;
  batchNumber?: string;
  administrationDate: Date;
  nextDoseDate?: Date;
  location?: string;
  observations?: string;
}

/**
 * Resumen de historia clínica
 */
export interface MedicalHistorySummary {
  patientId: string;
  totalRecords: number;
  activeDiagnoses: number;
  activeAllergies: number;
  activeMedications: number;
  lastConsultation?: Date;
  lastUpdate?: Date;
}
