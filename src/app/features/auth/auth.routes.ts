import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./register-selection/register-selection').then(m => m.RegisterSelection)
      },
      {
        path: 'register/patient',
        loadComponent: () => import('./register-patient/register-patient').then(m => m.RegisterPatient)
      },
      {
        path: 'register/professional',
        loadComponent: () => import('./register-professional/register-professional').then(m => m.RegisterProfessional)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword)
      }
    ]
  }
];