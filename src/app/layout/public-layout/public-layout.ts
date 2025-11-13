import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-white flex flex-col">
      <!-- Navbar público -->
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo y nombre -->
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="inline-flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <span class="ml-3 text-xl font-bold text-gray-800">DoctorWare</span>
            </div>

            <!-- Links de navegación -->
            <div class="hidden md:flex items-center space-x-8">
              <a routerLink="/public/home" routerLinkActive="text-primary-600"
                 class="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Inicio
              </a>
              <a routerLink="/public/features" routerLinkActive="text-primary-600"
                 class="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Características
              </a>
              <a routerLink="/public/pricing" routerLinkActive="text-primary-600"
                 class="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Precios
              </a>
              <a routerLink="/public/contact" routerLinkActive="text-primary-600"
                 class="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Contacto
              </a>
            </div>

            <!-- Botones de acción -->
            <div class="flex items-center space-x-4">
              <a routerLink="/auth/login"
                 class="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Iniciar Sesión
              </a>
              <a routerLink="/auth/register"
                 class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Registrarse
              </a>
            </div>

            <!-- Botón móvil (hamburger menu) -->
            <div class="md:hidden">
              <button type="button" class="text-gray-700 hover:text-primary-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenido principal -->
      <main class="flex-1">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="bg-gray-50 border-t border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Columna 1: Acerca de -->
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">DoctorWare</h3>
              <p class="text-gray-600 text-sm">
                Sistema integral de gestión médica para profesionales de la salud y clínicas.
              </p>
            </div>

            <!-- Columna 2: Producto -->
            <div>
              <h3 class="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">Producto</h3>
              <ul class="space-y-2">
                <li><a routerLink="/public/features" class="text-gray-600 hover:text-primary-600 text-sm">Características</a></li>
                <li><a routerLink="/public/pricing" class="text-gray-600 hover:text-primary-600 text-sm">Precios</a></li>
                <li><a routerLink="/public/demo" class="text-gray-600 hover:text-primary-600 text-sm">Demo</a></li>
              </ul>
            </div>

            <!-- Columna 3: Soporte -->
            <div>
              <h3 class="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">Soporte</h3>
              <ul class="space-y-2">
                <li><a routerLink="/public/docs" class="text-gray-600 hover:text-primary-600 text-sm">Documentación</a></li>
                <li><a routerLink="/public/faq" class="text-gray-600 hover:text-primary-600 text-sm">FAQ</a></li>
                <li><a routerLink="/public/contact" class="text-gray-600 hover:text-primary-600 text-sm">Contacto</a></li>
              </ul>
            </div>

            <!-- Columna 4: Legal -->
            <div>
              <h3 class="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">Legal</h3>
              <ul class="space-y-2">
                <li><a routerLink="/public/privacy" class="text-gray-600 hover:text-primary-600 text-sm">Privacidad</a></li>
                <li><a routerLink="/public/terms" class="text-gray-600 hover:text-primary-600 text-sm">Términos de uso</a></li>
              </ul>
            </div>
          </div>

          <!-- Copyright -->
          <div class="mt-8 pt-8 border-t border-gray-200">
            <p class="text-center text-gray-600 text-sm">
              &copy; 2025 CLINITECH. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicLayout {}
