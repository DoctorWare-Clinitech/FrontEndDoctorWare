import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    console.log('🔐 Attempting login...', { email });

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        console.log('✅ Login response:', response);
        this.isLoading = false;
        // La redirección se maneja en AuthService
      },
      error: (error) => {
        console.error('❌ Login error:', error);
        this.isLoading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Error al iniciar sesión. Verifica tus credenciales.';
      },
    });
  }

  // Método para testing rápido con credenciales de prueba
  fillTestCredentials(role: 'professional' | 'secretary' | 'patient' | 'admin'): void {
    const credentials = {
      professional: { email: 'doctor@test.com', password: '123456' },
      secretary: { email: 'secretaria@test.com', password: '123456' },
      patient: { email: 'paciente@test.com', password: '123456' },
      admin: { email: 'admin@test.com', password: '123456' },
    };

    this.loginForm.patchValue(credentials[role]);
  }
}
