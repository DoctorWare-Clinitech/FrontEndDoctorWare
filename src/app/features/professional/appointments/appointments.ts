import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-appointments',
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">Gestión de Turnos</h1>
      
      <div class="card">
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 class="text-xl font-medium text-gray-900">Gestión de Turnos</h2>
          <p class="text-gray-600 mt-2">Esta vista estará disponible próximamente</p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Appointments {}