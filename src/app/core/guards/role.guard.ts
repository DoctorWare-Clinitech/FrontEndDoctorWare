import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

/**
 * Guard funcional para control de acceso basado en roles
 * 
 * Uso en routing:
 * {
 *   path: 'professional',
 *   component: ProfessionalComponent,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: [UserRole.PROFESSIONAL] }
 * }
 * 
 * O con múltiples roles:
 * {
 *   path: 'appointments',
 *   component: AppointmentsComponent,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: [UserRole.PROFESSIONAL, UserRole.SECRETARY] }
 * }
 */
export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener roles permitidos de la configuración de ruta
  const allowedRoles = route.data['roles'] as UserRole[];

  if (!allowedRoles || allowedRoles.length === 0) {
    console.warn('No roles specified in route data');
    return true; // Si no hay roles especificados, permitir acceso
  }

  // Verificar autenticación
  if (!authService.isAuthenticated()) {
    console.warn('Access denied - User not authenticated');
    return router.createUrlTree(['/auth/login']);
  }

  // Verificar rol
  const userRole = authService.getUserRole();

  if (!userRole) {
    console.warn('Access denied - No user role found');
    return router.createUrlTree(['/auth/login']);
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Si no tiene permiso, redirigir a su dashboard correspondiente
  console.warn(`Access denied - User role ${userRole} not in allowed roles:`, allowedRoles);
  
  const dashboardRoutes: Record<UserRole, string> = {
    [UserRole.PROFESSIONAL]: '/professional/dashboard',
    [UserRole.SECRETARY]: '/secretary/dashboard',
    [UserRole.PATIENT]: '/patient/dashboard',
    [UserRole.ADMIN]: '/admin/dashboard'
  };

  const redirectRoute = dashboardRoutes[userRole] || '/unauthorized';
  return router.createUrlTree([redirectRoute]);
};

/**
 * Helper function para crear un guard de rol específico
 * 
 * Uso:
 * export const professionalGuard = createRoleGuard([UserRole.PROFESSIONAL]);
 * 
 * En routing:
 * {
 *   path: 'professional',
 *   component: ProfessionalComponent,
 *   canActivate: [authGuard, professionalGuard]
 * }
 */
export function createRoleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    const userRole = authService.getUserRole();
    const dashboardRoutes: Record<UserRole, string> = {
      [UserRole.PROFESSIONAL]: '/professional/dashboard',
      [UserRole.SECRETARY]: '/secretary/dashboard',
      [UserRole.PATIENT]: '/patient/dashboard',
      [UserRole.ADMIN]: '/admin/dashboard'
    };

    const redirectRoute = userRole ? dashboardRoutes[userRole] : '/unauthorized';
    return router.createUrlTree([redirectRoute]);
  };
}

// Guards predefinidos para cada rol
export const professionalGuard = createRoleGuard([UserRole.PROFESSIONAL]);
export const secretaryGuard = createRoleGuard([UserRole.SECRETARY]);
export const patientGuard = createRoleGuard([UserRole.PATIENT]);
export const adminGuard = createRoleGuard([UserRole.ADMIN]);

// Guard para roles de staff (profesional + secretario)
export const staffGuard = createRoleGuard([UserRole.PROFESSIONAL, UserRole.SECRETARY]);

// Guard para roles administrativos (profesional + admin)
export const adminStaffGuard = createRoleGuard([UserRole.PROFESSIONAL, UserRole.ADMIN]);