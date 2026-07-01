# SGH - Fase 2, Parte 1

## Objetivo

Definir el diseño técnico inicial del SGH - Sistema Gestor de Hospital para preparar la implementación de backend, base de datos, autenticación JWT y control de roles.

Esta fase no implementa lógica funcional. Su propósito es dejar una arquitectura clara, profesional y escalable.

## Stack recomendado

### Frontend

- React con Vite.
- JavaScript inicialmente, migrable a TypeScript cuando el dominio se estabilice.
- CSS modular por capas o CSS Modules en una fase posterior.
- React Router para rutas públicas, administrativas y doctor.
- Cliente HTTP centralizado con `fetch` o Axios.
- Manejo de sesión con contexto de autenticación.
- Validación de formularios con React Hook Form y Zod en fases posteriores.

### Backend

- Node.js.
- Express.js o NestJS.
- Recomendación principal: NestJS si el sistema crecerá con muchos módulos hospitalarios.
- Recomendación pragmática: Express.js si se busca avanzar rápido con menor complejidad inicial.
- JWT para autenticación.
- Bcrypt para hash de contraseñas.
- Zod, Joi o class-validator para validación de entrada.

### Base de datos

- PostgreSQL.
- Prisma ORM recomendado para modelado, migraciones y tipado gradual.
- Migraciones versionadas.
- Seeds para datos iniciales: roles, usuario administrador, especialidades base y turnos.

### Herramientas

- PNPM como gestor de paquetes.
- ESLint y Prettier.
- Variables de entorno con `.env`.
- Docker Compose opcional para PostgreSQL local.
- Swagger/OpenAPI para documentación de endpoints.

## Arquitectura general

Arquitectura recomendada: monorepo por capas.

```txt
SGH/
  frontend/
    Aplicación React para área pública, administrador y doctor.

  backend/
    API REST, autenticación, autorización, reglas de negocio y acceso a datos.

  database/
    Scripts SQL opcionales, documentación del modelo y respaldos de referencia.

  docs/
    Documentación técnica y decisiones de arquitectura.
```

## Separación de responsabilidades

### Frontend

Responsable de:

- Renderizar interfaces.
- Consumir API.
- Mantener estado visual de sesión.
- Proteger rutas de forma visual.
- Mostrar vistas según rol.
- Validar formularios antes de enviar.

No debe:

- Decidir permisos reales.
- Calcular disponibilidad definitiva.
- Confirmar citas sin backend.
- Guardar datos críticos en localStorage sin control.

### Backend

Responsable de:

- Autenticación.
- Autorización por rol.
- Reglas de negocio.
- CRUD de módulos hospitalarios.
- Validar disponibilidad de citas.
- Evitar doble cita para un doctor en misma fecha/hora.
- Gestionar estados de cita.
- Emitir respuestas seguras al frontend.

### Base de datos

Responsable de persistir:

- Usuarios.
- Roles.
- Pacientes.
- Doctores.
- Enfermeros.
- Personal administrativo.
- Especialidades.
- Horarios.
- Citas.
- Observaciones médicas.
- Configuración del hospital.

## Roles del sistema

Roles previstos:

```txt
ADMIN
DOCTOR
ENFERMERO
RECEPCIONISTA
PACIENTE
```

### Permisos esperados por rol

```txt
ADMIN
- Gestiona usuarios, roles, personal, doctores, enfermeros, especialidades, horarios, turnos, citas, pacientes, reportes y configuración.

DOCTOR
- Consulta solo sus citas.
- Atiende citas asignadas.
- Marca citas como atendidas o no asistió.
- Registra observaciones médicas.
- Consulta su horario y perfil.

ENFERMERO
- Perfil preparado para futuras vistas clínicas y apoyo operativo.

RECEPCIONISTA
- Gestiona citas, pacientes y recepción.

PACIENTE
- Consulta doctores.
- Agenda citas.
- Consulta sus propias citas.
- Actualiza datos personales permitidos.
```

## Estructura frontend recomendada

Cuando se reorganice el proyecto, mover la app actual a `frontend/`.

```txt
frontend/
  public/
  src/
    app/
      App.jsx
      routes.jsx
      providers/
        AuthProvider.jsx
        RoleProvider.jsx

    assets/

    components/
      ui/
        Button.jsx
        Card.jsx
        Input.jsx
        Select.jsx
        Textarea.jsx
        Modal.jsx
        DataTable.jsx
        StatusBadge.jsx

      layout/
        PublicLayout.jsx
        AdminLayout.jsx
        DoctorLayout.jsx
        PublicNavbar.jsx
        AdminSidebar.jsx
        DoctorSidebar.jsx
        AdminHeader.jsx
        DoctorHeader.jsx

    config/
      roles.js
      routes.js
      api.js

    features/
      public/
        pages/
        components/

      auth/
        pages/
        components/
        services/

      admin/
        dashboard/
        usuarios/
        doctores/
        enfermeros/
        personal/
        especialidades/
        horarios/
        turnos/
        citas/
        pacientes/
        reportes/
        configuracion/

      doctor/
        dashboard/
        citas/
        citasHoy/
        detalleCita/
        atenderCita/
        horario/
        perfil/
        observaciones/

      paciente/
        citas/
        perfil/

    hooks/
      useAuth.js
      useRole.js
      useApi.js

    lib/
      http.js
      storage.js
      formatters.js

    services/
      authService.js
      appointmentService.js
      doctorService.js
      patientService.js

    styles/
      globals.css
      tokens.css
      responsive.css

    utils/
      dates.js
      status.js
      validators.js
```

## Estructura backend recomendada

Opción recomendada con NestJS:

```txt
backend/
  src/
    main.ts
    app.module.ts

    common/
      decorators/
        current-user.decorator.ts
        roles.decorator.ts

      guards/
        jwt-auth.guard.ts
        roles.guard.ts

      filters/
      interceptors/
      pipes/

    config/
      env.config.ts
      jwt.config.ts
      database.config.ts

    database/
      prisma.service.ts
      prisma.module.ts

    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        dto/
        strategies/

      users/
        users.controller.ts
        users.service.ts
        dto/

      roles/

      patients/

      doctors/

      nurses/

      staff/

      specialties/

      schedules/

      shifts/

      appointments/
        appointments.controller.ts
        appointments.service.ts
        dto/

      medical-notes/

      reports/

      settings/

  prisma/
    schema.prisma
    migrations/
    seed.ts

  test/
  .env.example
  package.json
```

Opción alternativa con Express:

```txt
backend/
  src/
    server.js
    app.js

    config/
      env.js
      database.js
      jwt.js

    middlewares/
      auth.middleware.js
      roles.middleware.js
      error.middleware.js
      validate.middleware.js

    modules/
      auth/
        auth.routes.js
        auth.controller.js
        auth.service.js
        auth.schema.js

      users/
      patients/
      doctors/
      nurses/
      staff/
      specialties/
      schedules/
      shifts/
      appointments/
      medical-notes/
      reports/
      settings/

    prisma/
      prismaClient.js

    utils/
      ApiError.js
      asyncHandler.js
      password.js
      tokens.js
```

## Organización por módulos

Cada módulo backend debe seguir una estructura consistente:

```txt
module/
  module.controller
  module.service
  dto/
  entities/ o models/
  module.routes o module.module
```

Responsabilidad típica:

- Controller: recibe petición y devuelve respuesta.
- Service: contiene reglas de negocio.
- DTO/Schema: valida datos de entrada.
- Repository/Prisma: accede a base de datos.

## Convenciones de nombres

### Frontend

- Componentes: `PascalCase`.
- Hooks: `useCamelCase`.
- Servicios: `camelCaseService`.
- Rutas de archivo de páginas: `PascalCase.jsx` o `index.jsx` dentro del módulo.
- Constantes: `UPPER_SNAKE_CASE` para valores globales.
- Estados de cita visibles: `Pendiente`, `Confirmada`, `Cancelada`, `Reprogramada`, `Atendida`, `No asistió`.

### Backend

- Tablas: `snake_case`.
- Campos de base de datos: `snake_case`.
- DTOs: `CreateAppointmentDto`, `UpdateDoctorDto`.
- Servicios: `AppointmentsService`.
- Controladores: `AppointmentsController`.
- Endpoints REST: plural y en kebab-case si aplica.

Ejemplos:

```txt
GET    /api/doctors
GET    /api/doctors/:id
POST   /api/appointments
PATCH  /api/appointments/:id/status
GET    /api/doctors/me/appointments
POST   /api/auth/login
```

## Preparación para JWT

Flujo esperado:

```txt
1. Usuario envía correo y contraseña.
2. Backend valida credenciales.
3. Backend genera access token JWT.
4. Frontend guarda sesión de forma controlada.
5. Frontend envía token en Authorization: Bearer <token>.
6. Backend valida token en rutas protegidas.
7. Backend verifica rol con guards/middlewares.
```

Payload recomendado:

```json
{
  "sub": "user_id",
  "email": "admin@sgh.com",
  "role": "ADMIN",
  "profileId": "doctor_or_patient_id_if_applies"
}
```

## Protección de rutas frontend

Rutas públicas:

```txt
/
/doctores
/doctores/detalle
/login
/registro
/agendar-cita
```

Rutas ADMIN:

```txt
/admin/*
```

Rutas DOCTOR:

```txt
/doctor/*
```

Rutas futuras PACIENTE:

```txt
/paciente/*
```

Componente recomendado:

```txt
ProtectedRoute
- Verifica sesión.
- Verifica rol permitido.
- Redirige a /login si no hay sesión.
- Redirige a una pantalla no autorizada si el rol no corresponde.
```

## Endpoints iniciales previstos

### Auth

```txt
POST /api/auth/login
POST /api/auth/register-patient
GET  /api/auth/me
POST /api/auth/logout
```

### Admin

```txt
GET /api/users
GET /api/doctors
GET /api/nurses
GET /api/staff
GET /api/specialties
GET /api/schedules
GET /api/shifts
GET /api/appointments
GET /api/patients
GET /api/reports/appointments
GET /api/settings
```

### Doctor

```txt
GET   /api/doctors/me
GET   /api/doctors/me/appointments
GET   /api/doctors/me/appointments/today
GET   /api/doctors/me/schedule
PATCH /api/appointments/:id/attend
PATCH /api/appointments/:id/no-show
POST  /api/appointments/:id/medical-notes
```

### Patient

```txt
GET  /api/public/doctors
GET  /api/public/specialties
POST /api/appointments
GET  /api/patients/me/appointments
```

## Módulos de base de datos previstos

Entidades principales:

```txt
roles
users
patients
doctors
nurses
administrative_staff
specialties
doctor_schedules
shifts
appointments
medical_notes
hospital_settings
```

Relaciones clave:

- `users.role_id -> roles.id`
- `doctors.user_id -> users.id`
- `patients.user_id -> users.id`
- `doctors.specialty_id -> specialties.id`
- `appointments.patient_id -> patients.id`
- `appointments.doctor_id -> doctors.id`
- `appointments.specialty_id -> specialties.id`
- `medical_notes.appointment_id -> appointments.id`
- `medical_notes.doctor_id -> doctors.id`

## Reglas técnicas futuras

- Un usuario debe tener un rol.
- Un doctor debe tener especialidad.
- Una cita debe tener paciente, doctor, fecha, hora y estado.
- No debe existir doble cita para el mismo doctor en la misma fecha y hora.
- Un doctor solo debe consultar sus propias citas.
- Un paciente solo debe consultar sus propias citas.
- Solo ADMIN o RECEPCIONISTA debe gestionar citas de terceros.
- Solo DOCTOR debe registrar observaciones médicas de sus citas.
- Los doctores inactivos no deben mostrarse en búsqueda pública.
- Los horarios inactivos no generan disponibilidad.

## Variables de entorno previstas

Frontend:

```txt
VITE_API_URL=http://localhost:3000/api
```

Backend:

```txt
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/sgh
JWT_SECRET=change_me
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
```

## Plan recomendado para la siguiente parte

1. Reorganizar el proyecto como monorepo.
2. Crear carpeta `backend/`.
3. Configurar backend base.
4. Configurar PostgreSQL y Prisma.
5. Definir `schema.prisma`.
6. Crear seed inicial de roles.
7. Crear módulo Auth con JWT.
8. Conectar login visual al backend.

