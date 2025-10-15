import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-patients',
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
      
      <div class="card">
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 class="text-xl font-medium text-gray-900">Gestión de Pacientes</h2>
          <p class="text-gray-600 mt-2">Esta vista estará disponible próximamente</p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Patients {}
