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

export function tokenGetter(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(environment.jwtStorageKey);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        jwtInterceptor,
        errorInterceptor
      ])
    ),
    provideAnimations(),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter,
          allowedDomains: [
            'localhost:3000',
            'api.doctorware.com'
          ],
          disallowedRoutes: [
            'localhost:3000/api/auth/login',
            'localhost:3000/api/auth/register',
            'localhost:3000/api/auth/forgot-password',
            'api.doctorware.com/api/auth/login',
            'api.doctorware.com/api/auth/register',
            'api.doctorware.com/api/auth/forgot-password'
          ],
          // NO configurar secretKey aquí, solo el backend lo necesita
          skipWhenExpired: false
        }
      })
    )
  ]
};