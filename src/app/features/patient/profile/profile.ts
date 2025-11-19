import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { PatientUser } from '../../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Profile implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  // State
  protected readonly isLoading = signal(false);
  protected readonly currentUser = toSignal(this.authService.currentUser$);

  // Computed - Usuario como paciente con propiedades específicas
  protected readonly patientUser = computed(() => {
    const user = this.currentUser();
    return user as PatientUser | null;
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * Cargar perfil del usuario
   */
  private loadProfile(): void {
    // El perfil ya está disponible a través del AuthService
    // Si necesitamos datos adicionales, podemos cargarlos aquí
  }

  /**
   * Mostrar mensaje sobre funcionalidad no disponible
   */
  protected showNotAvailableMessage(): void {
    this.toastService.info(
      'Funcionalidad no disponible',
      'La edición del perfil estará disponible próximamente. Por favor contacta al administrador para modificar tus datos.'
    );
  }

  /**
   * Obtener iniciales del nombre
   */
  protected getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
