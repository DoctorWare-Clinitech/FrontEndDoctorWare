import { Routes } from '@angular/router';

export const PROFESSIONAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
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
      },
      {
        path: 'patients/new',
        loadComponent: () => import('./patients/patient-form/patient-form').then(m => m.PatientForm)
      },
      {
        path: 'patients/:id',
        loadComponent: () => import('./patients/patient-detail/patient-detail').then(m => m.PatientDetail)
      },
      {
        path: 'patients/edit/:id',
        loadComponent: () => import('./patients/patient-form/patient-form').then(m => m.PatientForm)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./schedule/schedule').then(m => m.Schedule)
      }
    ]
  }
];