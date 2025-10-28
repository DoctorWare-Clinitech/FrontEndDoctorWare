import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { 
  User, 
  UserRole, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  DecodedToken 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiBaseUrl;
  private readonly TOKEN_KEY = environment.jwtStorageKey;
  private readonly REFRESH_TOKEN_KEY = `${environment.jwtStorageKey}_refresh`;
  private readonly platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeAuth();
  }

  /**
   * Inicializar autenticación al cargar el servicio
   */
  private initializeAuth(): void {
    if (!this.isBrowser) return;
    
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.loadCurrentUser();
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Registro de usuario
   */
  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data)
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        }),
        catchError(error => {
          console.error('Register error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout de usuario
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Verificar si el token está expirado
    if (this.jwtHelper.isTokenExpired(token)) {
      this.clearAuthData();
      return false;
    }

    return true;
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener rol del usuario actual
   */
  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getUserRole();
    return userRole !== null && roles.includes(userRole);
  }

  /**
   * Renovar token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        }),
        catchError(error => {
          console.error('Refresh token error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Recuperar contraseña
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/forgot-password`, { email });
  }

  /**
   * Restablecer contraseña
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/reset-password`, { token, newPassword });
  }

  /**
   * Obtener información del usuario actual desde el servidor
   */
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Manejar respuesta de autenticación
   */
  private handleAuthResponse(response: AuthResponse): void {
    if (!this.isBrowser) return;
    
    // Guardar tokens
    localStorage.setItem(this.TOKEN_KEY, response.token);
    if (response.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    }

    // Actualizar usuario actual
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);

    // Redirigir según el rol
    this.redirectByRole(response.user.role);
  }

  /**
   * Cargar usuario actual desde el token
   */
  private loadCurrentUser(): void {
    if (!this.isBrowser) return;
    
    const token = this.getToken();
    
    if (!token) {
      return;
    }

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      if (!decodedToken) {
        throw new Error('Failed to decode token');
      }
      const decoded: DecodedToken = decodedToken;
      
      // Crear objeto User básico desde el token
      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        status: 'active' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.currentUserSubject.next(user);

      // Opcionalmente, obtener info completa del servidor
      this.getUserProfile().subscribe({
        error: (error) => {
          console.warn('Could not fetch user profile:', error);
        }
      });
    } catch (error) {
      console.error('Error decoding token:', error);
      this.clearAuthData();
    }
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuthData(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Redirigir según el rol del usuario
   */
  private redirectByRole(role: UserRole): void {
    const routes: Record<UserRole, string> = {
      [UserRole.PROFESSIONAL]: '/professional/dashboard',
      [UserRole.SECRETARY]: '/secretary/dashboard',
      [UserRole.PATIENT]: '/patient/dashboard',
      [UserRole.ADMIN]: '/admin/dashboard'
    };

    const route = routes[role] || '/';
    this.router.navigate([route]);
  }

  /**
   * Verificar si el token está por expirar (menos de 5 minutos)
   */
  isTokenExpiringSoon(): boolean {
    if (!this.isBrowser) return false;
    
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
    if (!expirationDate) {
      return false;
    }

    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;
    return (expirationDate.getTime() - now.getTime()) < fiveMinutes;
  }
}