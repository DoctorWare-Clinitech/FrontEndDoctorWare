import { 
  ApplicationConfig, 
  provideZoneChangeDetection,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';

import { routes } from './app.routes';
import { jwtInterceptor, errorInterceptor } from './core/interceptors';
import { environment } from '../environments/environment';

/**
 * Función para obtener el token del localStorage
 */
export function tokenGetter(): string | null {
  return localStorage.getItem(environment.jwtStorageKey);
}

/**
 * Configuración principal de la aplicación
 * 
 * Incluye:
 * - SSR/SSG (Client Hydration con Event Replay)
 * - Detección de cambios optimizada
 * - HTTP Client con interceptores JWT y manejo de errores
 * - JWT Module con configuración de tokens
 * - Animaciones
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Listeners globales de errores del navegador
    provideBrowserGlobalErrorListeners(),

    // Detección de cambios optimizada
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router con rutas lazy-loaded
    provideRouter(routes),

    // Client Hydration para SSR/SSG con replay de eventos
    provideClientHydration(withEventReplay()),

    // HTTP Client con interceptores y soporte Fetch API
    provideHttpClient(
      withFetch(), // Usa Fetch API en lugar de XMLHttpRequest (mejor para SSR)
      withInterceptors([
        jwtInterceptor,      // Agrega JWT a las peticiones
        errorInterceptor     // Manejo global de errores HTTP
      ])
    ),

    // Animaciones de Angular Material
    provideAnimations(),

    // JWT Module - Configuración de autenticación
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter,
          // Dominios permitidos para enviar el token
          allowedDomains: [
            'localhost:3000',
            'api.doctorware.com'
          ],
          // Rutas que NO deben incluir el token
          disallowedRoutes: [
            'localhost:3000/api/auth/login',
            'localhost:3000/api/auth/register',
            'localhost:3000/api/auth/forgot-password',
            'api.doctorware.com/api/auth/login',
            'api.doctorware.com/api/auth/register',
            'api.doctorware.com/api/auth/forgot-password'
          ]
        }
      })
    )
  ]
};