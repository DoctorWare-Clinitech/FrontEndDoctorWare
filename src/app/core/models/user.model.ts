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
 * Datos de registro
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
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