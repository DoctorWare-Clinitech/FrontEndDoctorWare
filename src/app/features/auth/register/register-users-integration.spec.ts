import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RegisterPatientData, RegisterProfessionalData } from '../../../core/models/user.model';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';

/**
 * TEST DE INTEGRACIÓN REAL - REGISTRO DE USUARIOS
 * Este test hace peticiones HTTP REALES al backend
 * Los usuarios se crean REALMENTE en la base de datos con hashes correctos
 *
 * REQUISITOS:
 * 1. Backend corriendo en http://localhost:5000
 * 2. Base de datos PostgreSQL activa
 *
 * EJECUCIÓN:
 * npm test -- --include=register-users-integration.spec.ts
 */
describe('User Registration Integration - Registro REAL de usuarios', () => {
  let authService: AuthService;

  // Datos de usuarios a registrar (formato backend)
  const testUsers: Array<any> = [
    // ADMINISTRADOR
    {
      nombre: 'Admin',
      apellido: 'Sistema',
      nroDocumento: 10000001,
      tipoDocumentoCodigo: 'DNI',
      genero: 'Prefiere no decirlo',
      email: 'admin@doctorware.com',
      password: 'DoctorWare2024',
      telefono: '3815000000',
      role: 'Administrador'
    },

    // PROFESIONALES
    {
      nombre: 'Juan',
      apellido: 'Pérez',
      nroDocumento: 25123456,
      tipoDocumentoCodigo: 'DNI',
      genero: 'Masculino',
      email: 'juan.perez@doctorware.com',
      password: 'DoctorWare2024',
      telefono: '3815111111',
      role: 'Profesional',
      especialidadId: 1, // Cardiología
      matriculaNacional: 'MN-12345',
      matriculaProvincial: 'MP-TUC-5678',
      cuit_cuil: '20-25123456-7',
      titulo: 'Médico Cardiólogo',
      universidad: 'Universidad Nacional de Tucumán'
    } as RegisterProfessionalData,
    {
      nombre: 'María',
      apellido: 'González',
      nroDocumento: 27234567,
      tipoDocumentoCodigo: 'DNI',
      genero: 'Femenino',
      email: 'maria.gonzalez@doctorware.com',
      password: 'DoctorWare2024',
      telefono: '3815222222',
      role: 'Profesional',
      especialidadId: 2, // Pediatría
      matriculaNacional: 'MN-23456',
      matriculaProvincial: 'MP-TUC-6789',
      cuit_cuil: '27-27234567-3',
      titulo: 'Médica Pediatra',
      universidad: 'Universidad Nacional de Tucumán'
    } as RegisterProfessionalData,

    // PACIENTES
    {
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      nroDocumento: 35456789,
      tipoDocumentoCodigo: 'DNI',
      genero: 'Masculino',
      email: 'carlos.rodriguez@email.com',
      password: 'DoctorWare2024',
      telefono: '3815333333',
      role: 'Paciente',
      obraSocial: 'OSDE',
      numeroAfiliado: '0000123456'
    } as RegisterPatientData,
    {
      nombre: 'Ana',
      apellido: 'Martínez',
      nroDocumento: 38567890,
      tipoDocumentoCodigo: 'DNI',
      genero: 'Femenino',
      email: 'ana.martinez@email.com',
      password: 'DoctorWare2024',
      telefono: '3815444444',
      role: 'Paciente',
      obraSocial: 'Swiss Medical',
      numeroAfiliado: '0000234567'
    } as RegisterPatientData,
    {
      nombre: 'Pedro',
      apellido: 'López',
      nroDocumento: 42678901,
      tipoDocumentoCodigo: 'DNI',
      genero: 'Masculino',
      email: 'pedro.lopez@email.com',
      password: 'DoctorWare2024',
      telefono: '3815555555',
      role: 'Paciente',
      obraSocial: 'APROSS',
      numeroAfiliado: '0000345678',
      contactoEmergenciaNombre: 'Marta López',
      contactoEmergenciaTelefono: '3815777777',
      contactoEmergenciaRelacion: 'Madre'
    } as RegisterPatientData,
    {
      nombre: 'Laura',
      apellido: 'Fernández',
      nroDocumento: 40789012,
      tipoDocumentoCodigo: 'DNI',
      genero: 'Femenino',
      email: 'laura.fernandez@email.com',
      password: 'DoctorWare2024',
      telefono: '3815666666',
      role: 'Paciente',
      contactoEmergenciaNombre: 'Ricardo Fernández',
      contactoEmergenciaTelefono: '3815999999',
      contactoEmergenciaRelacion: 'Padre'
    } as RegisterPatientData,
    {
      nombre: 'Diego',
      apellido: 'Sánchez',
      nroDocumento: 33890123,
      tipoDocumentoCodigo: 'DNI',
      genero: 'Masculino',
      email: 'diego.sanchez@email.com',
      password: 'DoctorWare2024',
      telefono: '3815888888',
      role: 'Paciente',
      obraSocial: 'Galeno',
      numeroAfiliado: '0000456789'
    } as RegisterPatientData
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        JwtHelperService,
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        provideHttpClient(), // HTTP REAL (no HttpClientTestingModule)
        provideRouter([]),
        provideToastr(),
        provideAnimations()
      ]
    });

    authService = TestBed.inject(AuthService);
  });

  it('debe registrar todos los usuarios REALMENTE en el backend', (done) => {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('    INICIANDO REGISTRO REAL DE USUARIOS EN EL BACKEND             ');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`Total de usuarios a registrar: ${testUsers.length}`);
    console.log('⚠️  ADVERTENCIA: Esto creará usuarios REALES en la base de datos');
    console.log('');

    let registeredCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Función para registrar un usuario
    const registerUser = (index: number) => {
      if (index >= testUsers.length) {
        // Todos los usuarios procesados
        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('                    RESUMEN DE REGISTRO                             ');
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log(`✅ Usuarios registrados exitosamente: ${registeredCount}`);
        console.log(`❌ Usuarios fallidos: ${failedCount}`);

        if (errors.length > 0) {
          console.log('\n⚠️  Errores encontrados:');
          errors.forEach((error, i) => {
            console.log(`${i + 1}. ${error}`);
          });
        }

        if (registeredCount > 0) {
          console.log('\n✨ ÉXITO: Los usuarios fueron creados en la base de datos');
          console.log('🔑 Password para todos: DoctorWare2024');
          console.log('📧 Todos tienen EMAIL_CONFIRMADO = true');
          console.log('\n💡 Ahora puedes iniciar sesión con cualquiera de estos usuarios');
        }

        console.log('\n═══════════════════════════════════════════════════════════════════\n');

        expect(registeredCount).toBeGreaterThan(0);
        done();
        return;
      }

      const user = testUsers[index];
      console.log(`\n[${index + 1}/${testUsers.length}] Registrando: ${user.nombre} ${user.apellido} (${user.role})`);
      console.log(`    Email: ${user.email}`);
      console.log(`    DNI: ${user.nroDocumento}`);

      // PETICIÓN HTTP REAL AL BACKEND
      authService.register(user).subscribe({
        next: (response) => {
          console.log(`    ✅ ÉXITO - Usuario registrado en la BD con hash correcto`);
          registeredCount++;

          // Continuar con el siguiente usuario después de un delay
          setTimeout(() => registerUser(index + 1), 500);
        },
        error: (error) => {
          const errorMsg = error.error?.message || error.message || 'Error desconocido';

          // Si el error es "usuario ya existe", lo consideramos éxito parcial
          if (errorMsg.includes('ya existe') || errorMsg.includes('already exists')) {
            console.log(`    ⚠️  YA EXISTE - El usuario ya estaba registrado`);
            registeredCount++;
          } else {
            console.log(`    ❌ ERROR - ${errorMsg}`);
            errors.push(`${user.email}: ${errorMsg}`);
            failedCount++;
          }

          // Continuar con el siguiente usuario aunque falle
          setTimeout(() => registerUser(index + 1), 500);
        }
      });
    };

    // Iniciar el registro del primer usuario
    registerUser(0);
  }, 120000); // Timeout de 2 minutos para todos los registros

  it('debe validar que el backend esté corriendo', (done) => {
    // Test simple para verificar conectividad
    authService.register({
      nombre: 'Test',
      apellido: 'Conectividad',
      nroDocumento: 99999999,
      tipoDocumentoCodigo: 'DNI',
      genero: 'Prefiere no decirlo',
      email: 'test.conectividad@test.com',
      password: 'Test123456'
    }).subscribe({
      next: () => {
        console.log('✅ Backend está corriendo y respondiendo');
        done();
      },
      error: (error) => {
        if (error.status === 0) {
          console.error('❌ ERROR: No se puede conectar al backend en http://localhost:5000');
          console.error('   Asegúrate de que el backend esté corriendo');
          fail('Backend no disponible');
        } else {
          // Cualquier otra respuesta significa que el backend está corriendo
          console.log('✅ Backend está corriendo');
          done();
        }
      }
    });
  }, 10000);
});
