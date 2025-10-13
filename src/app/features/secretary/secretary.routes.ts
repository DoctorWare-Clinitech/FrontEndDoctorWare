import { Routes } from '@angular/router';

export const SECRETARY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'appointments',
    loadComponent: () => import('./appointments/appointments').then(m => m.Appointments)
  },
  {
    path: 'patients',
    loadComponent: () => import('./patients/patients').then(m => m.Patients)
  }
];