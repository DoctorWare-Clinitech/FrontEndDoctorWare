import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.toastr.warning('Por favor ingresa un correo electrónico válido', 'Campo requerido');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email } = this.forgotPasswordForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.emailSent = true;
        this.successMessage = response.message || 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.';
        this.toastr.success('Revisa tu bandeja de entrada', 'Correo enviado');
      },
      error: (error) => {
        this.isLoading = false;
        const errorMsg = error.error?.message || error.message || 'Error al enviar el correo. Intenta nuevamente.';
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg, 'Error');
        console.error('Forgot password error:', error);
      }
    });
  }

  resendEmail(): void {
    this.emailSent = false;
    this.successMessage = '';
    this.onSubmit();
  }
}