import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'my-appointments',
        loadComponent: () =>
          import('./my-appointments/my-appointments').then((m) => m.MyAppointments),
      },
      {
        path: 'book-appointment',
        loadComponent: () =>
          import('./book-appointment/book-appointment').then((m) => m.BookAppointment),
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile').then((m) => m.Profile),
      },
    ],
  },
];
