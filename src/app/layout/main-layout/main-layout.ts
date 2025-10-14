import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, Sidebar],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <app-navbar />

      <!-- Sidebar + Content -->
      <div class="flex">
        <app-sidebar />
        
        <!-- Main Content -->
        <main class="flex-1 p-6 mt-16">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayout {}
