# Instrucciones para Registrar Usuarios de Prueba

## 🚀 Cómo Ejecutar el Test de Integración REAL

Para registrar los usuarios en la base de datos con hashes correctos, ejecuta:

```bash
npm test -- --include="**/register-users-integration.spec.ts"
```

**IMPORTANTE:** Este test hace peticiones HTTP REALES al backend, creando usuarios REALES en la base de datos.

### Requisitos:
1. ✅ Backend corriendo en `http://localhost:5000`
2. ✅ Base de datos PostgreSQL activa

El test registrará **8 usuarios de prueba** utilizando el endpoint real de registro del backend, garantizando que los hashes de password se generen correctamente.

## 📝 Usuarios que se Registraron

El test registró exitosamente los siguientes usuarios:

### 1. Administrador
- **Email:** admin@doctorware.com
- **Password:** DoctorWare2024
- **Nombre:** Admin Sistema
- **DNI:** 10000001

### 2. Dr. Juan Pérez (Cardiólogo)
- **Email:** juan.perez@doctorware.com
- **Password:** DoctorWare2024
- **Nombre:** Juan Pérez
- **DNI:** 25123456
- **Matrícula Nacional:** MN-12345
- **Matrícula Provincial:** MP-TUC-5678

### 3. Dra. María González (Pediatra)
- **Email:** maria.gonzalez@doctorware.com
- **Password:** DoctorWare2024
- **Nombre:** María González
- **DNI:** 27234567
- **Matrícula Nacional:** MN-23456
- **Matrícula Provincial:** MP-TUC-6789

### 4. Carlos Rodríguez (Paciente)
- **Email:** carlos.rodriguez@email.com
- **Password:** DoctorWare2024
- **DNI:** 35456789
- **Obra Social:** OSDE

### 5. Ana Martínez (Paciente)
- **Email:** ana.martinez@email.com
- **Password:** DoctorWare2024
- **DNI:** 38567890
- **Obra Social:** Swiss Medical

### 6. Pedro López (Paciente)
- **Email:** pedro.lopez@email.com
- **Password:** DoctorWare2024
- **DNI:** 42678901
- **Obra Social:** APROSS
- **Contacto Emergencia:** Marta López (Madre)

### 7. Laura Fernández (Paciente)
- **Email:** laura.fernandez@email.com
- **Password:** DoctorWare2024
- **DNI:** 40789012
- **Contacto Emergencia:** Ricardo Fernández (Padre)

### 8. Diego Sánchez (Paciente)
- **Email:** diego.sanchez@email.com
- **Password:** DoctorWare2024
- **DNI:** 33890123
- **Obra Social:** Galeno

## ✨ ¿Qué Logramos?

1. **Hashes Correctos:** Todos los usuarios ahora tienen hashes de password generados por el mismo sistema que usa el backend (SHA256 con salt)
2. **Emails Confirmados:** Todos los usuarios fueron creados con `EMAIL_CONFIRMADO = true` automáticamente por el sistema de registro
3. **Datos Completos:** Cada usuario tiene todos los campos necesarios según su rol
4. **Login Funcional:** Ahora puedes iniciar sesión con cualquiera de estos usuarios

## 🎯 Próximos Pasos

### 1. Probar el Login

Ve a http://localhost:4200/auth/login y prueba iniciar sesión con cualquiera de los usuarios:

```
Email: admin@doctorware.com
Password: DoctorWare2024
```

o

```
Email: juan.perez@doctorware.com
Password: DoctorWare2024
```

### 2. (Opcional) Insertar Turnos

Si necesitas agregar turnos de prueba, ahora puedes ejecutar el script SQL:
```sql
-- Ejecutar en pgAdmin 4
01_insertar_turnos_prueba.sql
```

Este script creará turnos para los pacientes y profesionales que acabas de registrar.

## 🔄 Si Necesitas Volver a Ejecutar el Test

Si en el futuro necesitas recrear estos usuarios:

1. Borra los usuarios existentes de la base de datos
2. Ejecuta el test nuevamente:
```bash
npm test -- --include="**/register-users-seed.spec.ts"
```

## 📁 Archivo del Test

El test se encuentra en:
```
src/app/features/auth/register/register-users-seed.spec.ts
```

## ⚠️ Notas Importantes

- Todos los usuarios usan la misma contraseña: `DoctorWare2024`
- Los hashes son generados automáticamente por el backend al registrar
- El test simula el registro real usando los formularios del frontend
- Los datos son solo para desarrollo/testing

## ✅ Resultado Final

**8/8 usuarios registrados exitosamente** ✨

Todos los hashes de password son correctos y puedes iniciar sesión inmediatamente con cualquiera de estos usuarios.
