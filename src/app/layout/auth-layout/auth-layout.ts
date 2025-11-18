
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div class="w-full max-w-6xl">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800">DoctorWare</h1>
          <p class="text-gray-600 mt-2">Sistema de Gestión Médica</p>
        </div>

        <!-- Contenido dinámico (Login, Register, etc.) -->
        <div class="bg-white rounded-lg shadow-xl p-8">
          <router-outlet></router-outlet>
        </div>

        <!-- Footer -->
        <div class="text-center mt-6 text-sm text-gray-600">
          <p>&copy; 2025 CLINITECH. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuthLayout {}
