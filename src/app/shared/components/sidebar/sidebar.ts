import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { UserRole } from '../../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, Subscription } from 'rxjs';
import { startOfDay, endOfDay } from 'date-fns';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside 
      [class]="sidebarClasses()"
      class="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40"
    >
      <div class="flex flex-col h-full">
        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          @for (item of visibleMenuItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary-50 text-primary-700 border-l-4 border-primary-600"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span [innerHTML]="item.icon" class="w-5 h-5 mr-3"></span>
              @if (!isCollapsed()) {
                <span class="flex-1 font-medium">{{ item.label }}</span>
                @if (item.badge && item.badge > 0) {
                  <span class="ml-auto bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                    {{ item.badge }}
                  </span>
                }
              }
            </a>
          }
        </nav>

        <!-- Collapse toggle -->
        <div class="p-4 border-t border-gray-200">
          <button
            type="button"
            (click)="toggleCollapse()"
            class="w-full flex items-center justify-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg 
              [class.rotate-180]="isCollapsed()"
              class="w-5 h-5 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            @if (!isCollapsed()) {
              <span class="ml-2 font-medium">Contraer</span>
            }
          </button>
        </div>
      </div>

      <!-- Overlay mobile -->
      @if (isOpen() && isMobile()) {
        <div 
          class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm md:hidden"
          (click)="close()"
        ></div>
      }
    </aside>

    <!-- Spacer para el contenido principal -->
    <div [class]="spacerClasses()"></div>
  `,
  styles: [`
    .rotate-180 {
      transform: rotate(180deg);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly router = inject(Router);
  private routerSubscription!: Subscription;
  private intervalId: any;

  protected readonly isCollapsed = signal(false);
  protected readonly isOpen = signal(true);
  protected readonly isMobile = signal(false);
  private readonly currentUser = toSignal(this.authService.currentUser$);
  private readonly appointmentsTodayCount = signal(0);

  ngOnInit(): void {
    this.loadAppointmentStats();

    // Refresh stats on navigation
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadAppointmentStats();
    });

    // Refresh stats every minute
    this.intervalId = setInterval(() => this.loadAppointmentStats(), 60000);
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    clearInterval(this.intervalId);
  }

  private loadAppointmentStats(): void {
    const user = this.currentUser();
    if (user?.role === UserRole.PROFESSIONAL) {
      const today = new Date();
      const filters = {
        professionalId: user.id,
        startDate: startOfDay(today),
        endDate: endOfDay(today)
      };
      this.appointmentsService.getAll(filters).subscribe(appointments => {
        this.appointmentsTodayCount.set(appointments.length);
      });
    }
  }

  // Computed: filtrar items según rol y añadir badges dinámicos
  protected readonly visibleMenuItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    const allItems: MenuItem[] = [
      // Professional
      { label: 'Dashboard', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>', route: '/professional/dashboard', roles: [UserRole.PROFESSIONAL] },
      { label: 'Agenda', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>', route: '/professional/schedule', roles: [UserRole.PROFESSIONAL] },
      { label: 'Turnos', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>', route: '/professional/appointments', roles: [UserRole.PROFESSIONAL], badge: this.appointmentsTodayCount() },
      { label: 'Pacientes', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>', route: '/professional/patients', roles: [UserRole.PROFESSIONAL] },

      // Patient
      { label: 'Inicio', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>', route: '/patient/dashboard', roles: [UserRole.PATIENT] },
      { label: 'Mis Turnos', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>', route: '/patient/my-appointments', roles: [UserRole.PATIENT] },
      { label: 'Agendar Turno', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>', route: '/patient/book-appointment', roles: [UserRole.PATIENT] },
      { label: 'Mi Perfil', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>', route: '/patient/profile', roles: [UserRole.PATIENT] },

      // Secretary
      { label: 'Dashboard', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>', route: '/secretary/dashboard', roles: [UserRole.SECRETARY] },
      { label: 'Turnos', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>', route: '/secretary/appointments', roles: [UserRole.SECRETARY] },
      { label: 'Pacientes', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>', route: '/secretary/patients', roles: [UserRole.SECRETARY] },

      // Admin
      { label: 'Dashboard', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>', route: '/admin/dashboard', roles: [UserRole.ADMIN] },
      { label: 'Usuarios', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>', route: '/admin/users', roles: [UserRole.ADMIN] },
      { label: 'Reportes', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>', route: '/admin/reports', roles: [UserRole.ADMIN] },
    ];
    
    return allItems.filter(item => item.roles.includes(user.role as UserRole));
  });

  protected readonly sidebarClasses = computed(() => {
    const baseClasses = 'w-64';
    const collapsedClasses = this.isCollapsed() ? 'md:w-20' : 'md:w-64';
    const mobileClasses = this.isOpen() ? 'translate-x-0' : '-translate-x-full md:translate-x-0';
    return `${baseClasses} ${collapsedClasses} ${mobileClasses}`;
  });

  protected readonly spacerClasses = computed(() => {
    return this.isCollapsed() ? 'md:ml-20' : 'md:ml-64';
  });

  protected toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected open(): void {
    this.isOpen.set(true);
  }
}