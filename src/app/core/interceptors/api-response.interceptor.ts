import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiResponse, ApiError } from '../models/api-response.model';

/**
 * Interceptor que maneja el formato ApiResponse<T> del backend
 *
 * Funcionalidad:
 * 1. Desempaqueta respuestas exitosas: extrae el campo 'data' del wrapper ApiResponse
 * 2. Maneja errores del backend: extrae el mensaje y código de error
 * 3. Es transparente para el resto de la aplicación
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    tap(event => {
      // Solo procesar respuestas HTTP exitosas
      if (event instanceof HttpResponse) {
        const body = event.body;

        // Verificar si la respuesta tiene el formato ApiResponse
        if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
          const apiResponse = body as ApiResponse<any>;

          // Si la respuesta fue exitosa, extraer el campo 'data'
          if (apiResponse.success) {
            // Reemplazar el body con solo el campo 'data'
            return event.clone({ body: apiResponse.data });
          }

          // Si success es false pero el HTTP status es 200, tratarlo como error
          // (esto puede pasar si el backend devuelve errores de negocio con status 200)
          if (!apiResponse.success) {
            const error: ApiError = {
              success: false,
              data: null,
              message: apiResponse.message || 'Error desconocido',
              errorCode: apiResponse.errorCode || 'unknown_error',
              statusCode: event.status
            };

            throw new HttpErrorResponse({
              error,
              status: event.status,
              statusText: event.statusText,
              url: event.url || undefined
            });
          }
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Si el error ya tiene el formato ApiResponse en error.error, no hacer nada
      if (error.error && typeof error.error === 'object' && 'success' in error.error) {
        const apiError = error.error as ApiResponse<any>;

        // Crear un error más legible para la aplicación
        const enhancedError: ApiError = {
          success: false,
          data: null,
          message: apiError.message || error.message || 'Error desconocido',
          errorCode: apiError.errorCode || 'unknown_error',
          statusCode: error.status
        };

        // Reemplazar error.error con nuestro formato mejorado
        return throwError(() => new HttpErrorResponse({
          error: enhancedError,
          status: error.status,
          statusText: error.statusText,
          url: error.url || undefined,
          headers: error.headers
        }));
      }

      // Si el error no tiene el formato esperado, crear uno
      const fallbackError: ApiError = {
        success: false,
        data: null,
        message: error.error?.message || error.message || 'Error de conexión',
        errorCode: 'network_error',
        statusCode: error.status
      };

      return throwError(() => new HttpErrorResponse({
        error: fallbackError,
        status: error.status,
        statusText: error.statusText,
        url: error.url || undefined,
        headers: error.headers
      }));
    })
  );
};
