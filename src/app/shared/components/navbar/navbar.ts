import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <nav class="bg-white shadow-md border-b border-gray-200" style="position: fixed; width: 100%; z-index: 10;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          
          <!-- Logo y título -->
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span class="ml-3 text-xl font-bold text-gray-900">DoctorWare</span>
            </div>
          </div>

          <!-- Menu desktop -->
          <div class="hidden md:flex md:items-center md:space-x-4">
            
            <!-- Notificaciones -->
            <button
              type="button"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              (click)="toggleNotifications()"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              @if (hasNotifications()) {
                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              }
            </button>

            <!-- User menu -->
            <div class="relative">
              <button
                type="button"
                class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                (click)="toggleUserMenu()"
              >
                @if (currentUser(); as user) {
                  <img 
                    [src]="user.avatar || 'https://i.pravatar.cc/150?img=1'" 
                    [alt]="user.name"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div class="text-left hidden lg:block">
                    <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                    <p class="text-xs text-gray-500">{{ getRoleLabel(user.role) }}</p>
                  </div>
                }
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown menu -->
              @if (showUserMenu()) {
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <a
                    routerLink="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    (click)="closeUserMenu()"
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi Perfil
                    </div>
                  </a>
                  <a
                    routerLink="/settings"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    (click)="closeUserMenu()"
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configuración
                    </div>
                  </a>
                  <div class="border-t border-gray-200 my-1"></div>
                  <button
                    type="button"
                    (click)="logout()"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </div>
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="flex items-center md:hidden">
            <button
              type="button"
              class="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              (click)="toggleMobileMenu()"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (showMobileMenu()) {
        <div class="md:hidden border-t border-gray-200">
          <div class="px-4 pt-2 pb-3 space-y-1">
            @if (currentUser(); as user) {
              <div class="flex items-center px-3 py-2">
                <img 
                  [src]="user.avatar || 'https://i.pravatar.cc/150?img=1'" 
                  [alt]="user.name"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <p class="text-xs text-gray-500">{{ getRoleLabel(user.role) }}</p>
                </div>
              </div>
            }
            <a
              routerLink="/profile"
              class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              (click)="closeMobileMenu()"
            >
              Mi Perfil
            </a>
            <a
              routerLink="/settings"
              class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              (click)="closeMobileMenu()"
            >
              Configuración
            </a>
            <button
              type="button"
              (click)="logout()"
              class="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly currentUser = toSignal(this.authService.currentUser$);
  protected readonly showUserMenu = signal(false);
  protected readonly showMobileMenu = signal(false);
  protected readonly showNotifications = signal(false);
  protected readonly hasNotifications = signal(true); // Mock

  protected toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showMobileMenu.set(false);
  }

  protected closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  protected toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
    this.showUserMenu.set(false);
  }

  protected closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  protected toggleNotifications(): void {
    this.showNotifications.update(v => !v);
  }

  protected logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.closeMobileMenu();
  }

  protected getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      professional: 'Profesional',
      secretary: 'Secretaria',
      patient: 'Paciente',
      admin: 'Administrador'
    };
    return labels[role] || role;
  }
}