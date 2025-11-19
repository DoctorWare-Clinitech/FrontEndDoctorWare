import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas con parámetros dinámicos - no prerender
  {
    path: 'professional/patients/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'professional/patients/edit/:id',
    renderMode: RenderMode.Server
  },
  // Rutas autenticadas - no prerender
  {
    path: 'professional/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'secretary/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'patient/**',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Server
  },
  // Rutas públicas - prerender
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
