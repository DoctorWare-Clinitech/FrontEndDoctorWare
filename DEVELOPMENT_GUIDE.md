# DoctorWare - Guía de Desarrollo Frontend

## 📋 Información General del Backend

### Configuración
- **Base URL**: `http://localhost:5000/api`
- **Swagger**: `http://localhost:5000/swagger`
- **Database**: PostgreSQL (localhost:5432)
- **Autenticación**: JWT Bearer Token

### Credenciales de Ejemplo (Development)
```json
{
  "email": "clinitech.doctorware@gmail.com",
  "password": "[ver appsettings.Development.json]"
}
```

**⚠️ IMPORTANTE**: El archivo `appsettings.Development.json` contiene credenciales sensibles y ya está ignorado en `.gitignore`. Copia `appsettings.Development.json.example` y renómbralo para configurar tu entorno.

---

## 🔐 Autenticación

### Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register/patient` | Registro de paciente |
| POST | `/auth/register/professional` | Registro de profesional |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/refresh` | Refrescar token |
| GET | `/auth/me` | Obtener usuario actual |
| GET | `/auth/specialties` | Lista de especialidades |
| POST | `/auth/forgot-password` | Solicitar recuperación |
| POST | `/auth/reset-password` | Restablecer contraseña |
| GET | `/auth/confirm-email` | Confirmar email |
| POST | `/auth/resend-confirmation` | Reenviar confirmación |

### Flujo de Autenticación
1. Usuario se registra (`/auth/register/patient` o `/auth/register/professional`)
2. Confirma email (link enviado por correo)
3. Inicia sesión (`/auth/login`)
4. Recibe `token`, `refreshToken` y datos de `user`
5. Usa `Authorization: Bearer {token}` en requests protegidos

---

## 👥 Gestión de Pacientes

### Endpoints

| Método | Endpoint | Requiere Auth | Descripción |
|--------|----------|---------------|-------------|
| GET | `/patients` | ✅ | Lista de pacientes (con filtros) |
| GET | `/patients/{id}` | ✅ | Detalle de paciente |
| POST | `/patients` | ✅ | Crear paciente |
| PUT | `/patients/{id}` | ✅ | Actualizar paciente |
| DELETE | `/patients/{id}` | ✅ | Eliminar paciente |
| GET | `/patients/summary` | ✅ | Resumen de pacientes |
| GET | `/patients/{id}/history` | ✅ | Historia clínica del paciente |

### Filtros disponibles (GET /patients)
- `name`: string
- `dni`: string
- `email`: string
- `phone`: string
- `professionalId`: string (ID de usuario del profesional)
- `isActive`: boolean

### Vistas a Implementar en Frontend
1. **Lista de Pacientes** (`/professional/patients`)
   - Tabla con búsqueda y filtros
   - Acciones: Ver, Editar, Eliminar
   - Botón "Nuevo Paciente"

2. **Formulario de Paciente** (`/professional/patients/new`, `/professional/patients/:id/edit`)
   - Datos personales
   - Contacto de emergencia
   - Obra social
   - Asignación de médico de cabecera

3. **Detalle de Paciente** (`/professional/patients/:id`)
   - Información completa
   - Historial de turnos
   - Historia clínica
   - Diagnósticos activos
   - Alergias
   - Medicación actual

---

## 📅 Gestión de Turnos (Appointments)

### Endpoints

| Método | Endpoint | Requiere Auth | Descripción |
|--------|----------|---------------|-------------|
| GET | `/appointments` | ✅ | Lista de turnos |
| GET | `/appointments/{id}` | ✅ | Detalle de turno |
| POST | `/appointments` | ✅ | Crear turno |
| PUT | `/appointments/{id}` | ✅ | Actualizar turno |
| DELETE | `/appointments/{id}` | ✅ | Cancelar turno |
| GET | `/appointments/stats` | ✅ | Estadísticas |

### Filtros disponibles (GET /appointments)
- `professionalId`: string
- `patientId`: string
- `startDate`: ISO string
- `endDate`: ISO string
- `status`: `scheduled|confirmed|in_progress|completed|cancelled|no_show`
- `type`: `first_visit|follow_up|emergency|routine|specialist`

### Estados de Turno
- `scheduled`: Programado
- `confirmed`: Confirmado
- `in_progress`: En Espera
- `completed`: Atendido
- `cancelled`: Cancelado
- `no_show`: Ausente

### Tipos de Turno
- `first_visit`: Primera consulta
- `follow_up`: Seguimiento
- `emergency`: Urgencia
- `routine`: Rutina/Control
- `specialist`: Estudio/Especialista

### Vistas a Implementar
1. **Agenda/Calendario** (`/professional/schedule`)
   - Vista de calendario (día/semana/mes)
   - Filtro por estado y tipo
   - Creación rápida de turnos
   - Arrastrar y soltar para reprogramar

2. **Lista de Turnos** (`/professional/appointments`)
   - Tabla con todos los filtros
   - Acciones rápidas (confirmar, cancelar, completar)
   - Indicadores visuales por estado

3. **Detalle/Edición de Turno** (`/professional/appointments/:id`)
   - Información completa
   - Cambio de estado
   - Agregar observaciones
   - Vincular con historia clínica

4. **Dashboard de Turnos** (`/professional/dashboard`)
   - Turnos de hoy
   - Próximos turnos
   - Estadísticas (`/appointments/stats`)

---

## 🌐 Portal Público (Sin Autenticación)

### Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/public/professionals/{professionalId}/availability` | ❌ | Disponibilidad del profesional |
| POST | `/public/appointments` | ❌ | Solicitar turno |

### Vistas a Implementar
1. **Búsqueda de Profesionales** (`/public/search`)
   - Filtro por especialidad
   - Filtro por nombre
   - Lista de profesionales disponibles

2. **Disponibilidad y Reserva** (`/public/book/:professionalId`)
   - Calendario con slots disponibles
   - Formulario de datos del paciente
   - Confirmación de reserva
   - No requiere login

---

## 👤 Portal del Paciente

### Endpoints

| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| GET | `/me/appointments` | patient | Mis turnos |
| GET | `/me/appointments/{id}` | patient | Detalle de mi turno |
| DELETE | `/me/appointments/{id}` | patient | Cancelar mi turno |
| GET | `/me/history` | patient | Mi historia clínica |

### Vistas a Implementar
1. **Mis Turnos** (`/patient/appointments`)
   - Lista de turnos programados
   - Filtro por fechas
   - Acción: Cancelar turno

2. **Mi Historia Clínica** (`/patient/medical-history`)
   - Consultas anteriores
   - Diagnósticos
   - Medicación
   - Alergias

---

## 🏥 Historia Clínica

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/medical-history/patient/{patientId}` | Historia del paciente |
| GET | `/medical-history/{id}` | Entrada específica |
| POST | `/medical-history` | Crear entrada |
| PUT | `/medical-history/{id}` | Actualizar entrada |
| DELETE | `/medical-history/{id}` | Eliminar entrada |

### Campos de CreateMedicalHistoryDto
```typescript
{
  patientId: string;
  appointmentId?: string;
  type: string;
  date: Date;
  title: string;
  description: string;
  diagnosis: string;
  treatment: string;
  observations?: string;
  attachments?: string[];
}
```

### Vistas a Implementar
1. **Historia Clínica del Paciente** (`/professional/patients/:id/history`)
   - Timeline de consultas
   - Buscar por fecha/tipo
   - Ver adjuntos
   - Crear nueva entrada

2. **Editor de Entrada** (Modal o ruta)
   - Formulario completo
   - Upload de adjuntos
   - Vincular con turno

---

## 💊 Diagnósticos, Alergias y Medicación

### Diagnósticos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/diagnoses/patient/{patientId}` | Diagnósticos del paciente |
| POST | `/diagnoses` | Crear diagnóstico |
| PUT | `/diagnoses/{id}` | Actualizar diagnóstico |

```typescript
interface CreateDiagnosisDto {
  patientId: string;
  appointmentId?: string;
  code: string; // CIE-10
  name: string;
  description?: string;
  severity: 'low' | 'moderate' | 'high';
  diagnosisDate: Date;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}
```

### Alergias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/allergies/patient/{patientId}` | Alergias del paciente |
| POST | `/allergies` | Crear alergia |
| PUT | `/allergies/{id}` | Actualizar alergia |
| PATCH | `/allergies/{id}/deactivate` | Desactivar alergia |

```typescript
interface CreateAllergyDto {
  patientId: string;
  allergen: string;
  type: 'food' | 'medication' | 'environmental' | 'other';
  severity: 'low' | 'moderate' | 'high';
  symptoms?: string;
  diagnosedDate?: Date;
  notes?: string;
}
```

### Medicación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/medications/patient/{patientId}` | Medicación del paciente |
| POST | `/medications` | Crear medicación |
| PUT | `/medications/{id}` | Actualizar medicación |
| PATCH | `/medications/{id}/discontinue` | Discontinuar medicación |

```typescript
interface CreateMedicationDto {
  patientId: string;
  appointmentId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  startDate: Date;
  endDate?: Date;
  instructions?: string;
}
```

### Vistas a Implementar
1. **Panel de Diagnósticos** (dentro de detalle de paciente)
   - Lista de diagnósticos activos
   - Filtro por estado
   - Agregar/editar diagnóstico

2. **Panel de Alergias** (dentro de detalle de paciente)
   - Lista de alergias activas
   - Indicadores de severidad
   - Agregar/editar/desactivar

3. **Panel de Medicación** (dentro de detalle de paciente)
   - Medicación activa y discontinuada
   - Fechas de inicio/fin
   - Agregar/editar/discontinuar

---

## 👨‍⚕️ Profesionales y Especialidades

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/specialties` | Lista de especialidades |
| GET | `/specialties/{id}/subspecialties` | Sub-especialidades |
| GET | `/professionals` | Lista de profesionales |
| GET | `/professionals/{id}` | Detalle de profesional |

### Filtros (GET /professionals)
- `specialtyId`: number
- `name`: string

---

## 📊 Métricas

### Endpoint

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| GET | `/metrics/summary` | admin, professional | Métricas de uso |

### Respuesta
```typescript
interface MetricsSummary {
  totalRequests: number;
  averageMilliseconds: number;
  maxMilliseconds: number;
  requestsByPath: Record<string, number>;
  generatedAtUtc: string;
}
```

### Vista a Implementar
**Dashboard de Métricas** (`/admin/metrics`)
- Gráficos de uso
- Endpoints más usados
- Tiempos de respuesta
- Solo visible para admin y professional

---

## 🗂️ Estructura de Carpetas Recomendada

```
src/app/
├── core/
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── patient.model.ts
│   │   ├── appointment.model.ts
│   │   ├── medical-history.model.ts
│   │   ├── diagnosis.model.ts
│   │   ├── allergy.model.ts
│   │   └── medication.model.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   ├── appointment.service.ts
│   │   ├── medical-history.service.ts
│   │   ├── diagnosis.service.ts
│   │   ├── allergy.service.ts
│   │   └── medication.service.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   └── interceptors/
│       ├── auth.interceptor.ts
│       └── error.interceptor.ts
├── features/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── professional/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── schedule/
│   │   └── medical-history/
│   ├── patient/
│   │   ├── my-appointments/
│   │   └── my-history/
│   ├── public/
│   │   ├── search/
│   │   └── book/
│   └── admin/
│       └── metrics/
└── shared/
    ├── components/
    ├── pipes/
    └── directives/
```

---

## 🛠️ Servicios a Implementar

### 1. PatientService
```typescript
@Injectable({ providedIn: 'root' })
export class PatientService {
  private API_URL = `${environment.apiBaseUrl}/patients`;

  getPatients(filters?: PatientFilters): Observable<Patient[]>
  getPatient(id: string): Observable<Patient>
  createPatient(data: CreatePatientDto): Observable<Patient>
  updatePatient(id: string, data: UpdatePatientDto): Observable<Patient>
  deletePatient(id: string): Observable<void>
  getPatientSummary(): Observable<PatientSummary[]>
  getPatientHistory(id: string): Observable<MedicalHistory[]>
}
```

### 2. AppointmentService
```typescript
@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private API_URL = `${environment.apiBaseUrl}/appointments`;

  getAppointments(filters?: AppointmentFilters): Observable<Appointment[]>
  getAppointment(id: string): Observable<Appointment>
  createAppointment(data: CreateAppointmentDto): Observable<Appointment>
  updateAppointment(id: string, data: UpdateAppointmentDto): Observable<Appointment>
  cancelAppointment(id: string, reason?: string): Observable<void>
  getStats(professionalId?: string): Observable<AppointmentStats>
}
```

### 3. MedicalHistoryService
```typescript
@Injectable({ providedIn: 'root' })
export class MedicalHistoryService {
  private API_URL = `${environment.apiBaseUrl}/medical-history`;

  getPatientHistory(patientId: string): Observable<MedicalHistory[]>
  getEntry(id: string): Observable<MedicalHistory>
  createEntry(data: CreateMedicalHistoryDto): Observable<MedicalHistory>
  updateEntry(id: string, data: UpdateMedicalHistoryDto): Observable<MedicalHistory>
  deleteEntry(id: string): Observable<void>
}
```

---

## 🎨 Componentes Comunes a Crear

1. **AppointmentCard** - Tarjeta de turno con estado
2. **PatientCard** - Tarjeta de paciente
3. **StatusBadge** - Badge de estado (turno, diagnóstico, etc.)
4. **Calendar** - Calendario para selección de fechas
5. **TimeSlotPicker** - Selector de horarios disponibles
6. **PatientSearchInput** - Búsqueda de pacientes con autocomplete
7. **MedicalHistoryTimeline** - Timeline de historia clínica
8. **AllergyAlert** - Alerta de alergias importantes
9. **LoadingSpinner** - Indicador de carga
10. **ConfirmDialog** - Diálogo de confirmación

---

## 📝 Próximos Pasos

### Prioridad Alta
1. ✅ Proteger archivos sensibles en .gitignore
2. ⏳ Implementar gestión de turnos (appointments)
3. ⏳ Implementar gestión de pacientes
4. ⏳ Implementar vista de disponibilidad pública

### Prioridad Media
5. Implementar portal del paciente
6. Implementar historia clínica
7. Implementar diagnósticos, alergias y medicación

### Prioridad Baja
8. Implementar dashboard de métricas
9. Optimizaciones de UX
10. Tests unitarios y e2e

---

## 📌 Notas Importantes

- **professionalId** en el backend siempre es el ID de usuario (claim `sub` en JWT)
- Los timestamps están en UTC
- El backend usa camelCase en JSON
- Todos los IDs se exponen como string para el frontend
- El proyecto usa Dapper + PostgreSQL
- Swagger disponible en: http://localhost:5000/swagger

---

## 🔗 Referencias

- [README Backend](../BackendDoctorWare/README.md)
- [API Contract](../BackendDoctorWare/API_CONTRACT.md)
- [Swagger JSON](http://localhost:5000/swagger/v1/swagger.json)
- [Postman Collection](../BackendDoctorWare/DoctorWare/docs/collections/DoctorWare.postman_collection.json)
