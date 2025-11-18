/**
 * Interfaz de especialidad médica (Backend response)
 */
export interface Specialty {
  id: number;
  nombre: string;
  activo?: boolean; // Opcional porque el backend no siempre lo devuelve
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
