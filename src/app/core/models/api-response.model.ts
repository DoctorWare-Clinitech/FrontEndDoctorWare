/**
 * Wrapper de respuesta estándar del backend
 * Todas las respuestas de la API vienen envueltas en este formato
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errorCode: string | null;
}

/**
 * Códigos de error estándar del backend
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  BAD_REQUEST = 'bad_request',
  SERVER_ERROR = 'server_error',
  METHOD_NOT_ALLOWED = 'method_not_allowed',
  VALIDATION_ERROR = 'validation_error',
  DUPLICATE_ENTRY = 'duplicate_entry'
}

/**
 * Interfaz para errores de la API
 */
export interface ApiError {
  success: false;
  data: null;
  message: string;
  errorCode: string;
  statusCode?: number;
}
