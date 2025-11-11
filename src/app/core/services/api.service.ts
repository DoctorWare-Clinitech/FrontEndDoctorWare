import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Opciones de configuración para las peticiones HTTP
 */
export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  observe?: 'body';
  responseType?: 'json';
  reportProgress?: boolean;
  withCredentials?: boolean;
  retry?: number;
}

/**
 * Servicio centralizado para todas las peticiones HTTP
 *
 * Proporciona métodos genéricos para GET, POST, PUT, DELETE y PATCH
 * Maneja errores de forma centralizada
 * Construye URLs automáticamente con el baseUrl del environment
 *
 * @example
 * ```typescript
 * // En un servicio:
 * private api = inject(ApiService);
 *
 * getUsers(): Observable<User[]> {
 *   return this.api.get<User[]>('/users');
 * }
 *
 * createUser(user: User): Observable<User> {
 *   return this.api.post<User>('/users', user);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Realiza una petición GET
   *
   * @param endpoint - Ruta del endpoint (ej: '/users', '/users/123')
   * @param options - Opciones de configuración de la petición
   * @returns Observable con la respuesta
   */
  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const retryCount = options?.retry ?? 0;

    return this.http.get<T>(url, options as any).pipe(
      retry(retryCount),
      catchError(this.handleError)
    );
  }

  /**
   * Realiza una petición POST
   *
   * @param endpoint - Ruta del endpoint
   * @param body - Cuerpo de la petición
   * @param options - Opciones de configuración de la petición
   * @returns Observable con la respuesta
   */
  post<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const retryCount = options?.retry ?? 0;

    return this.http.post<T>(url, body, options as any).pipe(
      retry(retryCount),
      catchError(this.handleError)
    );
  }

  /**
   * Realiza una petición PUT
   *
   * @param endpoint - Ruta del endpoint
   * @param body - Cuerpo de la petición
   * @param options - Opciones de configuración de la petición
   * @returns Observable con la respuesta
   */
  put<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const retryCount = options?.retry ?? 0;

    return this.http.put<T>(url, body, options as any).pipe(
      retry(retryCount),
      catchError(this.handleError)
    );
  }

  /**
   * Realiza una petición PATCH
   *
   * @param endpoint - Ruta del endpoint
   * @param body - Cuerpo de la petición
   * @param options - Opciones de configuración de la petición
   * @returns Observable con la respuesta
   */
  patch<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const retryCount = options?.retry ?? 0;

    return this.http.patch<T>(url, body, options as any).pipe(
      retry(retryCount),
      catchError(this.handleError)
    );
  }

  /**
   * Realiza una petición DELETE
   *
   * @param endpoint - Ruta del endpoint
   * @param options - Opciones de configuración de la petición
   * @returns Observable con la respuesta
   */
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const retryCount = options?.retry ?? 0;

    return this.http.delete<T>(url, options as any).pipe(
      retry(retryCount),
      catchError(this.handleError)
    );
  }

  /**
   * Construye la URL completa concatenando baseUrl + endpoint
   *
   * @param endpoint - Ruta relativa del endpoint
   * @returns URL completa
   */
  private buildUrl(endpoint: string): string {
    // Asegurar que el endpoint comienza con /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Asegurar que el baseUrl no termina con /
    const normalizedBaseUrl = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;

    return `${normalizedBaseUrl}${normalizedEndpoint}`;
  }

  /**
   * Maneja errores HTTP de forma centralizada
   *
   * @param error - Error HTTP capturado
   * @returns Observable que emite el error procesado
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
      console.error('Error del cliente:', error.error.message);
    } else {
      // Error del lado del servidor
      errorMessage = `Error ${error.status}: ${error.message}`;
      console.error(
        `Backend retornó código ${error.status}, ` +
        `body: ${JSON.stringify(error.error)}`
      );

      // Manejo específico según código de estado
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Verifica los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'Acceso denegado. No tienes permisos para esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 409:
          errorMessage = 'Conflicto. El recurso ya existe o hay datos duplicados.';
          break;
        case 422:
          errorMessage = 'Datos de validación incorrectos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible. Intenta nuevamente más tarde.';
          break;
        default:
          // Usar mensaje del backend si está disponible
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }
    }

    // Retornar el error procesado
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error
    }));
  }
}
