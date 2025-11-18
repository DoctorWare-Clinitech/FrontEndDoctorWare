import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional para agregar el token JWT a las peticiones HTTP
 * 
 * Automáticamente agrega el header Authorization con el Bearer token
 * a todas las peticiones que vayan al API backend
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Obtener el token
  const token = authService.getToken();

  // Si no hay token, continuar con la petición original
  if (!token) {
    return next(req);
  }

  // Lista de URLs que no requieren token (incluye variaciones de mayúsculas/minúsculas)
  const excludedUrls = [
    '/auth/login',
    '/Auth/login',
    '/auth/register',
    '/Auth/register',
    '/auth/register/patient',
    '/Auth/register/patient',
    '/auth/register/professional',
    '/Auth/register/professional',
    '/auth/specialties',
    '/Auth/specialties',
    '/auth/forgot-password',
    '/Auth/forgot-password',
    '/auth/reset-password',
    '/Auth/reset-password',
    '/auth/refresh',
    '/Auth/refresh'
  ];

  // Verificar si la URL actual debe excluirse
  const shouldExclude = excludedUrls.some(url => req.url.includes(url));
  
  if (shouldExclude) {
    return next(req);
  }

  // Clonar la petición y agregar el header Authorization
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedRequest);
};