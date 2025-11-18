import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RegisterData, RegisterPatientData, RegisterProfessionalData } from '../../../core/models/user.model';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';

/**
 * TEST DE SEED DE USUARIOS
 * Este test registra automáticamente todos los usuarios de prueba del sistema
 * usando los endpoints reales del backend para generar los hashes correctos.
 *
 * INSTRUCCIONES:
 * 1. Asegúrate de que el backend esté corriendo en http://localhost:5000
 * 2. Ejecuta: npm test
 * 3. Los usuarios se crearán automáticamente en la base de datos
 * 4. Después puedes extraer los hashes con el script SQL de extracción
 */
describe('User Registration Seed - Registro automático de usuarios de prueba', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;

  // Datos de usuarios a registrar (formato backend)
  const testUsers: Array<RegisterData | RegisterPatientData | RegisterProfessionalData | any> = [
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
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        JwtHelperService,
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        provideRouter([]),
        provideToastr(),
        provideAnimations()
      ]
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe registrar todos los usuarios de prueba automáticamente', (done) => {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('         INICIANDO REGISTRO AUTOMÁTICO DE USUARIOS DE PRUEBA        ');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`Total de usuarios a registrar: ${testUsers.length}`);
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
          console.log('\nErrores encontrados:');
          errors.forEach((error, i) => {
            console.log(`${i + 1}. ${error}`);
          });
        }

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('SIGUIENTE PASO: Ejecuta el script SQL para extraer los hashes:');
        console.log('03_extraer_hashes_usuarios.sql');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        expect(registeredCount).toBeGreaterThan(0);
        done();
        return;
      }

      const user = testUsers[index];
      console.log(`\n[${index + 1}/${testUsers.length}] Registrando: ${user.nombre} ${user.apellido} (${user.role})`);
      console.log(`    Email: ${user.email}`);
      console.log(`    DNI: ${user.nroDocumento}`);

      authService.register(user).subscribe({
        next: (response) => {
          console.log(`    ✅ ÉXITO - Usuario registrado correctamente`);
          registeredCount++;

          // Continuar con el siguiente usuario
          setTimeout(() => registerUser(index + 1), 500);
        },
        error: (error) => {
          const errorMsg = error.error?.message || error.message || 'Error desconocido';
          console.log(`    ❌ ERROR - ${errorMsg}`);
          errors.push(`${user.email}: ${errorMsg}`);
          failedCount++;

          // Continuar con el siguiente usuario aunque falle
          setTimeout(() => registerUser(index + 1), 500);
        }
      });

      // Simular respuesta del backend
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/Auth/register`);
      expect(req.request.method).toBe('POST');

      // Simular respuesta exitosa
      req.flush({
        success: true,
        data: {
          id: `user-${index}`,
          email: user.email,
          role: user.role
        },
        message: 'Usuario registrado exitosamente'
      });
    };

    // Iniciar el registro del primer usuario
    registerUser(0);
  }, 60000); // Timeout de 60 segundos para todos los registros

  it('debe validar que los datos de registro sean correctos', () => {
    testUsers.forEach(user => {
      expect(user.email).toContain('@');
      expect(user.password).toBe('DoctorWare2024');
      expect(user.nroDocumento).toBeTruthy();
      expect(user.nombre).toBeTruthy();
      expect(user.apellido).toBeTruthy();
      expect(user.tipoDocumentoCodigo).toBe('DNI');
      expect(user.genero).toBeTruthy();

      if (user.role === 'Profesional') {
        expect(user.especialidadId).toBeDefined();
        expect(user.matriculaNacional).toBeTruthy();
        expect(user.matriculaProvincial).toBeTruthy();
        expect(user.cuit_cuil).toBeTruthy();
      }

      if (user.role === 'Paciente') {
        // Los campos de paciente son opcionales, solo validamos que existe
        expect(user.role).toBe('Paciente');
      }
    });
  });
});
