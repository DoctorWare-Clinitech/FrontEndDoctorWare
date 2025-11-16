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
        children: [
          {
            path: '',
            loadComponent: () => import('./components/appointments-list/appointments-list.component').then(m => m.AppointmentsListComponent)
          },
          {
            path: 'calendar',
            loadComponent: () => import('./components/appointments-calendar/appointments-calendar.component').then(m => m.AppointmentsCalendarComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./components/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./components/appointment-detail/appointment-detail.component').then(m => m.AppointmentDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./components/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent)
          }
        ]
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
        path: 'patients/edit/:id',
        loadComponent: () => import('./patients/patient-form/patient-form').then(m => m.PatientForm)
      },
      {
        path: 'patients/:id',
        loadComponent: () => import('./patients/patient-detail/patient-detail').then(m => m.PatientDetail)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./schedule/schedule').then(m => m.Schedule)
      }
    ]
  }
];