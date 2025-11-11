/**
 * Tipo de nota clínica
 */
export enum ClinicalNoteType {
  CONSULTATION = 'consultation',     // Nota de consulta
  EVOLUTION = 'evolution',           // Nota de evolución
  ADMISSION = 'admission',           // Nota de ingreso
  DISCHARGE = 'discharge',           // Nota de egreso
  PROCEDURE = 'procedure',           // Nota de procedimiento
  PROGRESS = 'progress',             // Nota de progreso
  PRIVATE = 'private'                // Nota privada (no visible para paciente)
}

/**
 * Estructura SOAP para notas clínicas
 * (Subjetivo, Objetivo, Análisis, Plan)
 */
export interface SOAPNote {
  subjective?: string;     // S: Síntomas relatados por el paciente
  objective?: string;      // O: Hallazgos objetivos (signos vitales, examen físico)
  assessment?: string;     // A: Análisis/Diagnóstico
  plan?: string;          // P: Plan de tratamiento
}

/**
 * Signos vitales
 */
export interface VitalSigns {
  bloodPressureSystolic?: number;   // Presión sistólica (mmHg)
  bloodPressureDiastolic?: number;  // Presión diastólica (mmHg)
  heartRate?: number;               // Frecuencia cardíaca (bpm)
  temperature?: number;             // Temperatura (°C)
  respiratoryRate?: number;         // Frecuencia respiratoria (rpm)
  oxygenSaturation?: number;        // Saturación de oxígeno (%)
  weight?: number;                  // Peso (kg)
  height?: number;                  // Altura (cm)
  bmi?: number;                     // Índice de masa corporal
}

/**
 * Nota clínica completa
 */
export interface ClinicalNote {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  appointmentId?: string;
  type: ClinicalNoteType;
  date: Date;

  // Contenido estructurado
  chiefComplaint?: string;          // Motivo de consulta
  vitalSigns?: VitalSigns;
  soap?: SOAPNote;

  // Contenido libre
  content: string;                  // Contenido principal de la nota

  // Diagnósticos y tratamiento
  diagnoses?: string[];             // IDs de diagnósticos asociados
  prescriptions?: string[];         // IDs de prescripciones asociadas

  // Seguimiento
  followUpDate?: Date;
  followUpInstructions?: string;

  // Archivos adjuntos
  attachments?: string[];           // URLs de archivos adjuntos

  // Metadata
  isPrivate: boolean;               // Si es privada (no visible para paciente)
  isTemplate: boolean;              // Si es una plantilla
  templateName?: string;
  tags?: string[];                  // Etiquetas para categorización

  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;                  // Fecha de firma
  signedBy?: string;                // ID del profesional que firmó
}

/**
 * Plantilla de nota clínica
 */
export interface ClinicalNoteTemplate {
  id: string;
  professionalId: string;
  name: string;
  type: ClinicalNoteType;
  content: string;
  soapTemplate?: Partial<SOAPNote>;
  fields?: string[];                // Campos personalizados
  isPublic: boolean;                // Si está disponible para otros profesionales
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos para crear una nota clínica
 */
export interface CreateClinicalNoteDto {
  patientId: string;
  appointmentId?: string;
  type: ClinicalNoteType;
  chiefComplaint?: string;
  vitalSigns?: VitalSigns;
  soap?: SOAPNote;
  content: string;
  diagnoses?: string[];
  prescriptions?: string[];
  followUpDate?: Date;
  followUpInstructions?: string;
  attachments?: string[];
  isPrivate?: boolean;
  tags?: string[];
}

/**
 * Datos para actualizar una nota clínica
 */
export interface UpdateClinicalNoteDto {
  type?: ClinicalNoteType;
  chiefComplaint?: string;
  vitalSigns?: VitalSigns;
  soap?: SOAPNote;
  content?: string;
  diagnoses?: string[];
  prescriptions?: string[];
  followUpDate?: Date;
  followUpInstructions?: string;
  attachments?: string[];
  isPrivate?: boolean;
  tags?: string[];
}

/**
 * Datos para crear una plantilla
 */
export interface CreateClinicalNoteTemplateDto {
  name: string;
  type: ClinicalNoteType;
  content: string;
  soapTemplate?: Partial<SOAPNote>;
  fields?: string[];
  isPublic?: boolean;
}

/**
 * Filtros para buscar notas clínicas
 */
export interface ClinicalNoteFilters {
  patientId?: string;
  professionalId?: string;
  appointmentId?: string;
  type?: ClinicalNoteType;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  isPrivate?: boolean;
}

/**
 * Resumen de notas clínicas
 */
export interface ClinicalNotesSummary {
  patientId: string;
  totalNotes: number;
  lastNote?: Date;
  notesByType: Record<ClinicalNoteType, number>;
}
