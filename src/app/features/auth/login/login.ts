import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRememberedEmail();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  private loadRememberedEmail(): void {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
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
      this.toastr.warning('Por favor completa todos los campos correctamente', 'Formulario incompleto');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    console.log('🔐 Attempting login...', { email });

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        console.log('✅ Login response:', response);
        this.isLoading = false;

        // Guardar o eliminar email según el checkbox "Recuérdame"
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        this.toastr.success('Has iniciado sesión exitosamente', 'Bienvenido');
        // La redirección se maneja en AuthService
      },
      error: (error) => {
        console.error('❌ Login error:', error);
        this.isLoading = false;
        const errorMsg = error.error?.message || error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        this.toastr.error(errorMsg, 'Error de autenticación');
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
