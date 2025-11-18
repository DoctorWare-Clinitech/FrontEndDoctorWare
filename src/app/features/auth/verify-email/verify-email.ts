import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

type VerificationStatus = 'processing' | 'success' | 'error' | 'expired' | 'invalid';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.scss']
})
export class VerifyEmail implements OnInit {
  status: VerificationStatus = 'processing';
  message: string = '';
  errorDetails: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Verificar si viene del backend con status en query params
    this.route.queryParams.subscribe(params => {
      const statusParam = params['status'];
      const uid = params['uid'];
      const token = params['token'];

      if (statusParam) {
        // El backend ya procesó la verificación y redirigió con el estado
        this.handleBackendRedirect(statusParam);
      } else if (uid && token) {
        // Llamar al backend para verificar el email
        this.verifyEmail(uid, token);
      } else {
        // Sin parámetros válidos
        this.status = 'invalid';
        this.message = 'Enlace de verificación inválido';
        this.errorDetails = 'No se encontraron los parámetros necesarios para verificar el email.';
      }
    });
  }

  private handleBackendRedirect(statusParam: string): void {
    switch (statusParam.toLowerCase()) {
      case 'success':
        this.status = 'success';
        this.message = 'Tu email ha sido verificado exitosamente';
        break;
      case 'error':
        this.status = 'error';
        this.message = 'Error al verificar el email';
        this.errorDetails = 'Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.';
        break;
      case 'expired':
        this.status = 'expired';
        this.message = 'El enlace ha expirado';
        this.errorDetails = 'El enlace de verificación ha caducado. Solicita uno nuevo.';
        break;
      case 'invalid':
        this.status = 'invalid';
        this.message = 'Enlace inválido';
        this.errorDetails = 'El enlace de verificación no es válido.';
        break;
      default:
        this.status = 'error';
        this.message = 'Estado desconocido';
        this.errorDetails = 'No se pudo determinar el estado de la verificación.';
    }
  }

  private verifyEmail(uid: string, token: string): void {
    this.status = 'processing';
    this.message = 'Verificando tu email...';

    // Llamar al endpoint del backend
    const url = `${environment.apiBaseUrl}/auth/confirm-email?uid=${uid}&token=${encodeURIComponent(token)}`;

    this.http.get(url).subscribe({
      next: (response: any) => {
        this.status = 'success';
        this.message = response.message || 'Tu email ha sido verificado exitosamente';
      },
      error: (error) => {
        console.error('Verification error:', error);

        if (error.status === 400 || error.status === 401) {
          this.status = 'expired';
          this.message = 'El enlace ha expirado';
          this.errorDetails = error.error?.message || 'El enlace de verificación ha caducado. Solicita uno nuevo.';
        } else if (error.status === 404) {
          this.status = 'invalid';
          this.message = 'Usuario no encontrado';
          this.errorDetails = 'No se encontró una cuenta asociada a este enlace.';
        } else {
          this.status = 'error';
          this.message = 'Error al verificar el email';
          this.errorDetails = error.error?.message || 'Ocurrió un error inesperado. Por favor intenta nuevamente.';
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToResendConfirmation(): void {
    this.router.navigate(['/auth/resend-confirmation']);
  }
}
