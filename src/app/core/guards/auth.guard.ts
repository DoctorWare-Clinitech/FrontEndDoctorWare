import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional para proteger rutas que requieren autenticación
 * 
 * Uso en routing:
 * {
 *   path: 'protected',
 *   component: ProtectedComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir a login si no está autenticado
  console.warn('Access denied - User not authenticated');
  return router.createUrlTree(['/auth/login']);
};

/**
 * Guard funcional inverso - permite acceso solo si NO está autenticado
 * Útil para páginas de login/registro
 * 
 * Uso en routing:
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [noAuthGuard]
 * }
 */
export const noAuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si está autenticado, redirigir según su rol
  const userRole = authService.getUserRole();
  
  const dashboardRoutes: Record<string, string> = {
    'professional': '/professional/dashboard',
    'secretary': '/secretary/dashboard',
    'patient': '/patient/dashboard',
    'admin': '/admin/dashboard'
  };

  const route = userRole ? dashboardRoutes[userRole] : '/';
  console.info('User already authenticated, redirecting to dashboard');
  return router.createUrlTree([route]);
};