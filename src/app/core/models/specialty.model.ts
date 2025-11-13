/**
 * Interfaz de especialidad médica
 */
export interface Specialty {
  id: string;
  name: string;
  description?: string;
  code?: string;              // Código de la especialidad (ej: "CARD" para Cardiología)
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos para crear una especialidad
 */
export interface CreateSpecialtyDto {
  name: string;
  description?: string;
  code?: string;
  active?: boolean;
}

/**
 * Datos para actualizar una especialidad
 */
export interface UpdateSpecialtyDto {
  name?: string;
  description?: string;
  code?: string;
  active?: boolean;
}
