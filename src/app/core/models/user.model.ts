/**
 * Roles disponibles en el sistema
 */
export enum UserRole {
  PROFESSIONAL = 'professional',
  SECRETARY = 'secretary',
  PATIENT = 'patient',
  ADMIN = 'admin'
}

/**
 * Estado del usuario
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

/**
 * Interfaz base de usuario
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Usuario profesional (médico)
 */
export interface ProfessionalUser extends User {
  role: UserRole.PROFESSIONAL;
  specialization: string;
  licenseNumber: string;
  bio?: string;
  consultationDuration: number; // en minutos
}

/**
 * Usuario secretario/asistente
 */
export interface SecretaryUser extends User {
  role: UserRole.SECRETARY;
  professionalId: string; // ID del profesional al que asiste
}

/**
 * Usuario paciente
 */
export interface PatientUser extends User {
  role: UserRole.PATIENT;
  dateOfBirth: Date;
  dni: string;
  address?: string;
  medicalInsurance?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

/**
 * Usuario administrador
 */
export interface AdminUser extends User {
  role: UserRole.ADMIN;
  permissions: string[];
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Datos de registro (adaptado al backend)
 */
export interface RegisterData {
  nombre: string;              // Nombre (requerido por backend)
  apellido: string;            // Apellido (requerido por backend)
  email: string;               // Email (requerido)
  password: string;            // Password (requerido, min 6 caracteres)
  telefono?: string;           // Teléfono (opcional)
  nroDocumento: number;        // Número de documento (requerido por backend)
  tipoDocumentoCodigo: string; // Código tipo documento (default: "DNI")
  genero: string;              // Género (default: "Prefiere no decirlo")
}

/**
 * Datos de registro simplificados (para componente)
 */
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  documentNumber: number;
  documentType: string;
  gender: string;
  terms: boolean;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

/**
 * Respuesta de registro
 */
export interface RegisterResponse {
  message: string;
  requiresEmailConfirmation: boolean;
}

/**
 * Request para refresh token
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Request para forgot password
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Request para reset password
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Token JWT decodificado
 */
export interface DecodedToken {
  sub: string; // user ID
  email: string;
  role: UserRole;
  name: string;
  iat: number;
  exp: number;
}

/**
 * Datos de registro para PACIENTE
 */
export interface RegisterPatientData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  nroDocumento: number;
  tipoDocumentoCodigo: string;
  genero: string;
  // Campos específicos de paciente (opcionales)
  obraSocial?: string;
  numeroAfiliado?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaRelacion?: string;
}

/**
 * Datos de registro para PROFESIONAL
 */
export interface RegisterProfessionalData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  nroDocumento: number;
  tipoDocumentoCodigo: string;
  genero: string;
  // Campos específicos de profesional (requeridos)
  matriculaNacional: string;
  matriculaProvincial: string;
  especialidadId: number;
  titulo: string;
  universidad: string;
  cuit_cuil: string;
}

/**
 * Especialidad médica
 */
export interface Specialty {
  id: number;
  nombre: string;
  activo: boolean;
}