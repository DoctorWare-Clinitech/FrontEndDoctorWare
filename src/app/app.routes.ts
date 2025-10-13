import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, roleGuard } from './core/guards';
import { UserRole } from './core/models';

export const routes: Routes = [
  // Ruta por defecto - redirige a login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Módulo de autenticación (público)
  {
    path: 'auth',
    canActivate: [noAuthGuard], // Solo accesible si NO está autenticado
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Módulo del profesional médico
  {
    path: 'professional',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.PROFESSIONAL] },
    loadChildren: () => import('./features/professional/professional.routes').then(m => m.PROFESSIONAL_ROUTES)
  },

  // Módulo del secretario/asistente
  {
    path: 'secretary',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.SECRETARY] },
    loadChildren: () => import('./features/secretary/secretary.routes').then(m => m.SECRETARY_ROUTES)
  },

  // Módulo del paciente
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.PATIENT] },
    loadChildren: () => import('./features/patient/patient.routes').then(m => m.PATIENT_ROUTES)
  },

  // Módulo del administrador
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // Páginas públicas
  {
    path: 'public',
    loadChildren: () => import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES)
  },

  // Página de acceso no autorizado
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized').then(m => m.Unauthorized)
  },

  // Página 404 - No encontrado
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFound)
  }
];