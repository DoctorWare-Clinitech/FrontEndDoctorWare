import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-schedule',
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">Mi Agenda</h1>
      
      <div class="card">
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 class="text-xl font-medium text-gray-900">Gestión de Agenda</h2>
          <p class="text-gray-600 mt-2">Esta vista estará disponible próximamente</p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Schedule {}