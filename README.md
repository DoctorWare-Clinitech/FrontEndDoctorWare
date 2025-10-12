# 🩺 DoctorWare — Frontend

> Sistema de gestión integral con agenda de turnos para profesionales de la salud independientes

[![Angular](https://img.shields.io/badge/Angular-v20-red)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-orange)](LICENSE)

---

## 📋 Descripción

**DoctorWare** es una aplicación web SaaS desarrollada por **CLINITECH**, diseñada para facilitar la gestión de agendas, turnos y pacientes de profesionales de la salud independientes. El frontend está construido con **Angular v20** y arquitecturado bajo un enfoque modular basado en roles, garantizando una experiencia óptima y segura para cada tipo de usuario.

### 🔗 Repositorios relacionados

- **Frontend**: [github.com/DoctorWare-Clinitech/FrontEndDoctorWare](https://github.com/DoctorWare-Clinitech/FrontEndDoctorWare)
- **Backend**: [github.com/DoctorWare-Clinitech/BackendDoctorWare](https://github.com/DoctorWare-Clinitech/BackendDoctorWare)

---

## ✨ Características principales

- 🔐 **Autenticación JWT** con control de sesión y refresh tokens
- 👥 **Sistema de roles (RBAC)**: Professional, Secretary, Patient, Admin
- 📅 **Gestión de agenda y turnos** con calendario interactivo
- 🏥 **Administración de pacientes** e historias clínicas
- 📊 **Dashboard personalizado** según rol de usuario
- 🎨 **Interfaz moderna** con Tailwind CSS y Angular Material
- 📱 **Diseño responsive** adaptado a dispositivos móviles
- 🌍 **Multi-entorno**: desarrollo y producción
- 🧪 **Testing** con Jasmine y Karma

---

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 18.x
- pnpm >= 9.x
- Angular CLI >= 20.x

Nota: Este proyecto utiliza pnpm como gestor de paquetes. Si no lo tienes instalado, ejecuta:
```bash
npm install -g pnpm
```
### Pasos de instalación

```bash
# Clonar el repositorio
git clone https://github.com/DoctorWare-Clinitech/FrontEndDoctorWare.git

# Navegar al directorio
cd FrontEndDoctorWare

# Instalar dependencias
pnpm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Configurar variables de entorno (ver sección Configuración)

# Iniciar servidor de desarrollo
pnpm start
```

La aplicación estará disponible en `http://localhost:4200`

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── core/                      # Servicios core, guards, interceptores
│   │   ├── guards/
│   │   │   ├── auth.guard.ts      # Protección de rutas autenticadas
│   │   │   └── role.guard.ts      # Control de acceso por roles
│   │   ├── interceptors/
│   │   │   ├── jwt.interceptor.ts # Inyección de tokens JWT
│   │   │   └── error.interceptor.ts
│   │   ├── models/                # Interfaces y tipos TypeScript
│   │   │   ├── user.model.ts
│   │   │   ├── appointment.model.ts
│   │   │   └── patient.model.ts
│   │   └── services/
│   │       ├── auth.service.ts    # Servicio de autenticación
│   │       ├── api.service.ts     # Cliente HTTP base
│   │       └── storage.service.ts # Gestión de localStorage
│   │
│   ├── shared/                    # Componentes y utilidades compartidas
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   ├── sidebar/
│   │   │   ├── modal/
│   │   │   ├── table/
│   │   │   ├── calendar/
│   │   │   ├── toast/
│   │   │   └── loader/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── validators/
│   │
│   ├── features/                  # Módulos de funcionalidad por rol
│   │   ├── auth/                  # Login, registro, recuperación
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── professional/          # Área del profesional médico
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   ├── patients/
│   │   │   └── schedule/
│   │   ├── secretary/             # Área del asistente
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   └── patients/
│   │   ├── patient/               # Área del paciente
│   │   │   ├── dashboard/
│   │   │   ├── my-appointments/
│   │   │   └── profile/
│   │   ├── admin/                 # Área administrativa Clinitech
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   └── reports/
│   │   └── public/                # Páginas públicas
│   │       ├── home/
│   │       ├── about/
│   │       └── contact/
│   │
│   ├── layout/                    # Layouts principales
│   │   ├── main-layout/
│   │   ├── auth-layout/
│   │   └── public-layout/
│   │
│   └── app-routing.module.ts      # Configuración de rutas
│
├── environments/                  # Variables de entorno
│   ├── environment.ts
│   └── environment.prod.ts
│
└── assets/                        # Recursos estáticos
    ├── images/
    ├── icons/
    └── styles/
```

---

## ⚙️ Configuración

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```bash
# .env.example

# URL base del API backend
API_BASE_URL=http://localhost:3000/api

# Clave para almacenar JWT en localStorage
JWT_STORAGE_KEY=doctorware_token

# Nombre de la aplicación
APP_NAME=DoctorWare

# Nivel de logging (debug, info, warn, error)
LOG_LEVEL=debug

# Entorno de ejecución
ENVIRONMENT=development
```

### Archivo `environment.ts`

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  jwtStorageKey: 'doctorware_token',
  appName: 'DoctorWare',
  logLevel: 'debug'
};
```

### Archivo `environment.prod.ts`

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.doctorware.com/api',
  jwtStorageKey: 'doctorware_token',
  appName: 'DoctorWare',
  logLevel: 'error'
};
```

---

## 🔐 Autenticación y autorización

### Implementación JWT

El sistema utiliza **JSON Web Tokens (JWT)** para la autenticación de usuarios mediante la librería `@auth0/angular-jwt`.

#### Estructura esperada del token

```json
{
  "sub": "user_id_12345",
  "email": "doctor@example.com",
  "role": "professional",
  "name": "Dr. Juan Pérez",
  "iat": 1640000000,
  "exp": 1640086400
}
```

### AuthService

```typescript
// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {
    this.loadCurrentUser();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        tap((response: any) => {
          localStorage.setItem(environment.jwtStorageKey, response.token);
          this.loadCurrentUser();
        })
      );
  }

  logout(): void {
    localStorage.removeItem(environment.jwtStorageKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getToken(): string | null {
    return localStorage.getItem(environment.jwtStorageKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decoded = this.jwtHelper.decodeToken(token);
      return decoded.role;
    }
    return null;
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next(decoded);
    }
  }
}
```

### AuthGuard

```typescript
// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    this.router.navigate(['/auth/login']);
    return false;
  }
}
```

### RoleGuard

```typescript
// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const userRole = this.authService.getUserRole();

    if (userRole && expectedRoles.includes(userRole)) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
```

### JwtInterceptor

```typescript
// src/app/core/interceptors/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

### Configuración de rutas protegidas

```typescript
// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'professional',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['professional'] },
    loadChildren: () => import('./features/professional/professional.module').then(m => m.ProfessionalModule)
  },
  {
    path: 'secretary',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['secretary'] },
    loadChildren: () => import('./features/secretary/secretary.module').then(m => m.SecretaryModule)
  },
  {
    path: 'patient',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['patient'] },
    loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

## 👥 Roles de usuario

El sistema implementa cuatro roles principales con permisos diferenciados:

| Rol | Identificador | Descripción | Permisos principales |
|-----|--------------|-------------|---------------------|
| 🩺 **Profesional** | `professional` | Médico o profesional de la salud | Gestión completa de agenda, pacientes e historias clínicas |
| 📋 **Secretario/a** | `secretary` | Asistente administrativo | Gestión de turnos, coordinación de agenda, atención al paciente |
| 👤 **Paciente** | `patient` | Usuario paciente | Solicitud de turnos, visualización de historial, gestión de perfil |
| ⚙️ **Administrador** | `admin` | Administrador Clinitech | Gestión de usuarios, configuración del sistema, reportes globales |

---

## 📦 Dependencias principales

### Instalación de dependencias

```bash
# Dependencias de producción
pnpm install @angular/material @angular/cdk @auth0/angular-jwt date-fns ngx-toastr

# Dependencias de desarrollo
pnpm install -D tailwindcss postcss autoprefixer
```

### Package.json (fragmento)

```json
{
  "dependencies": {
    "@angular/animations": "^20.0.0",
    "@angular/common": "^20.0.0",
    "@angular/compiler": "^20.0.0",
    "@angular/core": "^20.0.0",
    "@angular/forms": "^20.0.0",
    "@angular/material": "^20.0.0",
    "@angular/platform-browser": "^20.0.0",
    "@angular/router": "^20.0.0",
    "@auth0/angular-jwt": "^5.2.0",
    "date-fns": "^3.0.0",
    "ngx-toastr": "^18.0.0",
    "rxjs": "^7.8.0",
    "tailwindcss": "^3.4.0",
    "tslib": "^2.6.0",
    "zone.js": "^0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^20.0.0",
    "@angular/cli": "^20.0.0",
    "@angular/compiler-cli": "^20.0.0",
    "@types/jasmine": "^5.1.0",
    "autoprefixer": "^10.4.0",
    "jasmine-core": "^5.1.0",
    "karma": "^6.4.0",
    "karma-chrome-launcher": "^3.2.0",
    "karma-coverage": "^2.2.0",
    "karma-jasmine": "^5.1.0",
    "karma-jasmine-html-reporter": "^2.1.0",
    "postcss": "^8.4.0",
    "typescript": "~5.4.0"
  }
}
```

### Configuración de Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        secondary: '#00CC99',
        accent: '#FF6B6B',
        background: '#F8F9FA',
        text: '#212529'
      }
    },
  },
  plugins: [],
}
```

---

## 🛠️ Scripts disponibles

```bash
# Iniciar servidor de desarrollo
pnpm start
# o
pnpm run start

# Compilar para producción
pnpm run build

# Compilar y observar cambios
pnpm run watch

# Ejecutar pruebas unitarias
pnpm test
# o
pnpm run test

# Ejecutar pruebas con cobertura
pnpm run test:coverage

# Ejecutar linter
pnpm run lint

# Corregir problemas de linting automáticamente
pnpm run lint:fix

# Analizar bundle size
pnpm run analyze
```

---

## 🌐 API esperada (Backend)

El frontend espera los siguientes endpoints del backend:

### Autenticación

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| POST | `/auth/login` | Iniciar sesión | `{ email, password }` |
| POST | `/auth/register` | Registrar usuario | `{ email, password, name, role }` |
| POST | `/auth/forgot-password` | Recuperar contraseña | `{ email }` |
| POST | `/auth/reset-password` | Restablecer contraseña | `{ token, newPassword }` |
| GET | `/auth/me` | Obtener usuario actual | - |
| POST | `/auth/refresh` | Renovar token | `{ refreshToken }` |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users/me` | Perfil del usuario actual |
| PUT | `/users/me` | Actualizar perfil |
| GET | `/users` | Listar usuarios (admin) |
| GET | `/users/:id` | Obtener usuario por ID |
| PUT | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |

### Pacientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/patients` | Listar pacientes |
| POST | `/patients` | Crear paciente |
| GET | `/patients/:id` | Obtener paciente |
| PUT | `/patients/:id` | Actualizar paciente |
| DELETE | `/patients/:id` | Eliminar paciente |
| GET | `/patients/:id/history` | Historial médico |

### Turnos (Appointments)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/appointments` | Listar turnos |
| POST | `/appointments` | Crear turno |
| GET | `/appointments/:id` | Obtener turno |
| PUT | `/appointments/:id` | Actualizar turno |
| DELETE | `/appointments/:id` | Cancelar turno |
| GET | `/appointments/available` | Horarios disponibles |

### Agenda (Schedule)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/schedule` | Obtener agenda |
| PUT | `/schedule` | Actualizar agenda |
| GET | `/schedule/availability` | Disponibilidad |

---

## 🧩 Componentes compartidos

### Estructura de componentes reutilizables

```typescript
// src/app/shared/components/modal/modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }
}
```

### Componentes disponibles

- **Navbar**: Barra de navegación principal
- **Sidebar**: Menú lateral con navegación por roles
- **Modal**: Ventana modal reutilizable
- **Table**: Tabla de datos con paginación y filtros
- **Calendar**: Calendario interactivo para gestión de turnos
- **Toast**: Notificaciones tipo toast
- **Loader**: Indicador de carga

---

## 📚 Buenas prácticas

### Convenciones de código

1. **Nomenclatura**: Utilizar camelCase para variables y funciones, PascalCase para clases y componentes
2. **Tipado estricto**: Aprovechar TypeScript para tipar todas las variables y funciones
3. **Modularización**: Separar funcionalidades en módulos lazy-loaded
4. **Servicios singleton**: Utilizar `providedIn: 'root'` para servicios globales
5. **Observables**: Utilizar async pipe en templates siempre que sea posible
6. **Unsubscribe**: Gestionar correctamente las suscripciones para evitar memory leaks

### Estructura de commits

Utilizar conventional commits:

```
feat: agregar módulo de pacientes
fix: corregir error en login
docs: actualizar README
style: aplicar formato Tailwind
refactor: optimizar AuthService
test: agregar tests para AppointmentComponent
```

### Testing

```typescript
// Ejemplo de test unitario
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should authenticate user with valid credentials', () => {
    // Test implementation
  });
});
```

---

## 🚧 Estado del proyecto

## 📦 Uso de PNPM

Este proyecto utiliza **pnpm** en lugar de npm para una gestión de dependencias más rápida y eficiente.

### Ventajas principales
- Instalaciones más veloces mediante un almacenamiento global compartido
- Aislamiento limpio entre dependencias
- Mejor compatibilidad con workspaces monorepo

### Comandos equivalentes

| Acción | npm | pnpm |
|--------|-----|------|
| Instalar dependencias | `npm install` | `pnpm install` |
| Ejecutar servidor dev | `npm start` | `pnpm start` |
| Compilar | `npm run build` | `pnpm build` |
| Ejecutar tests | `npm run test` | `pnpm test` |

> Si no tienes pnpm instalado:
> ```bash
> npm install -g pnpm
> ```


**Fase actual**: Desarrollo inicial

- ✅ Configuración base del proyecto
- ✅ Estructura de carpetas definida
- 🔄 Implementación de autenticación JWT
- 🔄 Desarrollo de módulos por rol
- ⏳ Integración con backend (usando JSON temporal)
- ⏳ Testing unitario y e2e
- ⏳ Optimizaciones de performance

---

## 🤝 Contribución

Este es un proyecto privado de CLINITECH. Para contribuir:

1. Crear una rama desde `develop`: `git checkout -b feature/nueva-funcionalidad`
2. Realizar los cambios siguiendo las convenciones establecidas
3. Ejecutar tests y linter: `pnpm test && pnpm run lint`
4. Hacer commit con conventional commits
5. Crear Pull Request hacia `develop`

---

## 📄 Licencia

Este proyecto es propiedad de **CLINITECH** y su uso está restringido según los términos establecidos en el contrato de desarrollo.

**Desarrollado por CLINITECH © 2025**

---

## 📞 Contacto

Para consultas sobre el proyecto:

- **Organización**: CLINITECH
- **Repositorio**: [github.com/DoctorWare-Clinitech](https://github.com/DoctorWare-Clinitech)
- **Documentación técnica**: [Wiki del proyecto](https://github.com/DoctorWare-Clinitech/FrontEndDoctorWare/wiki)

---

## 📖 Recursos adicionales

- [Documentación oficial de Angular](https://angular.io/docs)
- [Guía de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de Angular Material](https://material.angular.io/)
- [JWT.io - JSON Web Tokens](https://jwt.io/)

---

**Última actualización**: Octubre 2025