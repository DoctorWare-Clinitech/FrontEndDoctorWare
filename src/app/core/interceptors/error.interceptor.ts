import { HttpInterceptorFn, HttpErrorResponse, HttpHandlerFn, HttpRequest, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional para manejo global de errores HTTP
 * 
 * Maneja:
 * - Errores 401 (Unauthorized) - Intenta refresh token o redirige a login
 * - Errores 403 (Forbidden) - Redirige a página de acceso denegado
 * - Errores 404 (Not Found) - Registra el error
 * - Errores 500+ (Server Errors) - Muestra mensaje de error del servidor
 * - Errores de red - Detecta problemas de conectividad
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Error del cliente o de red
      if (error.error instanceof ErrorEvent) {
        console.error('Client-side error:', error.error.message);
        return throwError(() => ({
          message: 'Error de conexión. Por favor, verifica tu conexión a internet.',
          status: 0
        }));
      }

      // Error del servidor
      switch (error.status) {
        case 401:
          return handle401Error(req, next, authService, router, error);
        
        case 403:
          return handle403Error(router, error);
        
        case 404:
          return handle404Error(error);
        
        case 500:
        case 502:
        case 503:
        case 504:
          return handle5xxError(error);
        
        default:
          return handleDefaultError(error);
      }
    })
  );
};

/**
 * Manejar error 401 - No autorizado
 * Intenta renovar el token, si falla redirige a login
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
  error: HttpErrorResponse
): Observable<HttpEvent<unknown>> {
  console.warn('401 Unauthorized - Attempting token refresh');

  // Si la petición ya era de refresh, no intentar de nuevo
  if (req.url.includes('/auth/refresh')) {
    console.error('Refresh token failed, logging out');
    authService.logout();
    return throwError(() => ({
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      status: 401
    }));
  }

  // Intentar renovar el token
  return authService.refreshToken().pipe(
    switchMap(() => {
      console.info('Token refreshed successfully, retrying request');
      // Obtener el nuevo token y reintentar la petición original
      const token = authService.getToken();
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedRequest);
    }),
    catchError(() => {
      console.error('Could not refresh token, logging out');
      authService.logout();
      return throwError(() => ({
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        status: 401
      }));
    })
  );
}

/**
 * Manejar error 403 - Acceso prohibido
 */
function handle403Error(
  router: Router,
  error: HttpErrorResponse
): Observable<never> {
  console.error('403 Forbidden:', error.error?.message || 'Access denied');
  
  router.navigate(['/unauthorized']);
  
  return throwError(() => ({
    message: error.error?.message || 'No tienes permisos para acceder a este recurso.',
    status: 403
  }));
}

/**
 * Manejar error 404 - No encontrado
 */
function handle404Error(error: HttpErrorResponse): Observable<never> {
  console.error('404 Not Found:', error.url);
  
  return throwError(() => ({
    message: error.error?.message || 'El recurso solicitado no fue encontrado.',
    status: 404
  }));
}

/**
 * Manejar errores 5xx - Error del servidor
 */
function handle5xxError(error: HttpErrorResponse): Observable<never> {
  console.error(`${error.status} Server Error:`, error.error);
  
  let message = 'Ocurrió un error en el servidor. Por favor, intenta nuevamente más tarde.';
  
  if (error.status === 503) {
    message = 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.';
  } else if (error.status === 504) {
    message = 'El servidor tardó demasiado en responder. Por favor, intenta nuevamente.';
  }
  
  return throwError(() => ({
    message: error.error?.message || message,
    status: error.status
  }));
}

/**
 * Manejar otros errores
 */
function handleDefaultError(error: HttpErrorResponse): Observable<never> {
  console.error('HTTP Error:', error);
  
  const message = error.error?.message || 
                  error.message || 
                  'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
  
  return throwError(() => ({
    message,
    status: error.status,
    details: error.error
  }));
}