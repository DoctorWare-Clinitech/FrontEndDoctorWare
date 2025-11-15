import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { passwordMatchValidator, passwordStrengthValidator } from '../../../core/validators/validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;
  userId: number | null = null;
  token: string | null = null;
  invalidToken = false;
  passwordReset = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Obtener userId y token de query params
    this.route.queryParams.subscribe(params => {
      this.userId = params['uid'] ? parseInt(params['uid'], 10) : null;
      this.token = params['token'] || null;

      if (!this.userId || !this.token) {
        this.invalidToken = true;
        this.toastr.error('El enlace de restablecimiento es inválido o ha expirado', 'Enlace Inválido');
      }
    });

    this.initForm();
    this.setupPasswordStrengthListener();
  }

  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator
    });
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  private setupPasswordStrengthListener(): void {
    this.newPassword?.valueChanges.subscribe(value => {
      if (value) {
        this.passwordStrength = this.calculatePasswordStrength(value);
      } else {
        this.passwordStrength = null;
      }
    });
  }

  private calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      this.toastr.warning('Por favor completa todos los campos correctamente', 'Formulario Incompleto');
      return;
    }

    if (!this.userId || !this.token) {
      this.toastr.error('El enlace de restablecimiento es inválido', 'Error');
      return;
    }

    this.isLoading = true;

    const { newPassword } = this.resetPasswordForm.value;

    this.authService.resetPassword(this.userId, this.token, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.passwordReset = true;
        this.toastr.success('Ahora puedes iniciar sesión con tu nueva contraseña', 'Contraseña Restablecida');

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMsg = error.error?.message || error.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.';
        this.toastr.error(errorMsg, 'Error');
        console.error('Reset password error:', error);

        // Si el token es inválido o expiró, marcar como inválido
        if (error.status === 401 || error.status === 404) {
          this.invalidToken = true;
        }
      }
    });
  }

  requestNewLink(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
