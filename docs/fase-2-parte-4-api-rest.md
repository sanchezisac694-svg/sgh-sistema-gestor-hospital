# SGH - Fase 2, Parte 4

## Objetivo

Definir los endpoints API REST del SGH - Sistema Gestor de Hospital para conectar el frontend con el backend y la base de datos en fases posteriores.

Esta fase no implementa código backend ni conecta el frontend. Este documento funciona como contrato inicial de API.

## Convenciones Generales

### Base URL

```txt
http://localhost:3000/api
```

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Operación realizada correctamente",
  "data": {}
}
```

### Respuesta de Error

```json
{
  "success": false,
  "message": "No se pudo completar la operación",
  "errors": []
}
```

### Códigos HTTP

| Código | Uso |
|---:|---|
| `200` | Consulta o actualización correcta |
| `201` | Registro creado correctamente |
| `400` | Datos inválidos |
| `401` | No autenticado |
| `403` | Sin permisos |
| `404` | Recurso no encontrado |
| `409` | Conflicto, registro duplicado o cita ocupada |
| `422` | Transición de estado no permitida |
| `500` | Error interno |

### Autenticación

Endpoints protegidos deben recibir:

```txt
Authorization: Bearer jwt_token
```

El backend debe validar JWT y rol en cada endpoint protegido.

## Autenticación

### Login

```txt
POST /api/auth/login
```

Acceso: público.

Body:

```json
{
  "correo": "admin@sgh.com",
  "password": "Admin123*"
}
```

Respuesta:

```json
{
  "success": true,
  "message": "Inicio de sesión correcto",
  "data": {
    "token": "jwt_token",
    "usuario": {
      "id": "uuid",
      "nombre": "Administrador SGH",
      "correo": "admin@sgh.com",
      "rol": "ADMIN"
    }
  }
}
```

Reglas:

- Validar correo y contraseña.
- Rechazar usuarios inactivos.
- No devolver `password_hash`.
- Incluir rol en el token.

### Registro de Paciente

```txt
POST /api/auth/register-paciente
```

Acceso: público.

Body:

```json
{
  "nombre": "Luis",
  "apellido_paterno": "Ramírez",
  "apellido_materno": "Gómez",
  "correo": "luis.ramirez@mail.com",
  "password": "Paciente123*",
  "telefono": "9614440001",
  "fecha_nacimiento": "2001-05-12",
  "sexo": "Masculino",
  "direccion": "Dirección simulada"
}
```

Reglas:

- Crear usuario con rol `PACIENTE`.
- Crear registro relacionado en `pacientes`.
- Validar correo único.
- Guardar contraseña con hash.

### Usuario Autenticado

```txt
GET /api/auth/me
```

Acceso: autenticado.

Respuesta: datos del usuario autenticado y rol.

### Logout

```txt
POST /api/auth/logout
```

Acceso: autenticado.

Regla:

- Con JWT simple, el frontend elimina el token.
- Si se implementa blacklist, el backend invalida el token.

## Usuarios

### Listar Usuarios

```txt
GET /api/usuarios?rol=DOCTOR&estado=true&search=juan
```

Acceso: `ADMIN`.

### Obtener Usuario

```txt
GET /api/usuarios/:id
```

Acceso:

- `ADMIN`
- Usuario dueño del perfil.

### Crear Usuario

```txt
POST /api/usuarios
```

Acceso: `ADMIN`.

Body:

```json
{
  "nombre": "Mariana",
  "apellido_paterno": "Torres",
  "apellido_materno": "López",
  "correo": "mariana.torres@sgh.com",
  "password": "Temporal123*",
  "telefono": "9616660003",
  "rol": "RECEPCIONISTA",
  "estado": true
}
```

### Actualizar Usuario

```txt
PUT /api/usuarios/:id
```

Acceso:

- `ADMIN`
- Usuario dueño del perfil con campos limitados.

### Activar/Inactivar Usuario

```txt
PATCH /api/usuarios/:id/estado
```

Acceso: `ADMIN`.

Body:

```json
{
  "estado": false
}
```

## Doctores

### Listar Doctores

```txt
GET /api/doctores?especialidad_id=uuid&estado=true&search=juan
```

Acceso:

- Público para doctores activos.
- `ADMIN` para todos.

### Obtener Doctor

```txt
GET /api/doctores/:id
```

Acceso:

- Público si el doctor está activo.
- `ADMIN`.
- `DOCTOR` dueño del perfil.

### Crear Doctor

```txt
POST /api/doctores
```

Acceso: `ADMIN`.

Body:

```json
{
  "usuario": {
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "apellido_materno": "López",
    "correo": "juan.perez@sgh.com",
    "password": "Doctor123*",
    "telefono": "9611111111"
  },
  "especialidad_id": "uuid",
  "cedula_profesional": "1234567",
  "consultorio": "C-204",
  "biografia": "Profesional médico especializado en cardiología.",
  "foto_url": null,
  "estado": true
}
```

Reglas:

- Crear usuario con rol `DOCTOR`.
- Crear registro en `doctores`.
- Validar correo único.
- Validar cédula única.
- Validar especialidad activa.

### Actualizar Doctor

```txt
PUT /api/doctores/:id
```

Acceso: `ADMIN`.

### Activar/Inactivar Doctor

```txt
PATCH /api/doctores/:id/estado
```

Acceso: `ADMIN`.

Body:

```json
{
  "estado": false
}
```

### Doctores por Especialidad

```txt
GET /api/doctores/especialidad/:especialidadId
```

Acceso: público.

Regla:

- Solo devolver doctores activos.

### Disponibilidad del Doctor

```txt
GET /api/doctores/:id/disponibilidad?fecha=2026-07-15
```

Acceso:

- Público.
- Autenticado para agendar.

Respuesta:

```json
{
  "success": true,
  "message": "Disponibilidad obtenida correctamente",
  "data": {
    "doctor_id": "uuid",
    "fecha": "2026-07-15",
    "horarios_disponibles": ["08:00", "08:30", "09:00", "10:00"]
  }
}
```

## Enfermeros

### Listar Enfermeros

```txt
GET /api/enfermeros
```

Acceso: `ADMIN`.

### Crear Enfermero

```txt
POST /api/enfermeros
```

Acceso: `ADMIN`.

Body:

```json
{
  "usuario": {
    "nombre": "Patricia",
    "apellido_paterno": "López",
    "apellido_materno": "Ruiz",
    "correo": "patricia.lopez@sgh.com",
    "password": "Enfermero123*",
    "telefono": "9615550001"
  },
  "area_asignada": "Urgencias",
  "turno_id": "uuid",
  "estado": true
}
```

### Actualizar Enfermero

```txt
PUT /api/enfermeros/:id
```

Acceso: `ADMIN`.

### Activar/Inactivar Enfermero

```txt
PATCH /api/enfermeros/:id/estado
```

Acceso: `ADMIN`.

## Personal Administrativo

### Listar Personal Administrativo

```txt
GET /api/personal-administrativo
```

Acceso: `ADMIN`.

### Crear Personal Administrativo

```txt
POST /api/personal-administrativo
```

Acceso: `ADMIN`.

Body:

```json
{
  "usuario": {
    "nombre": "Laura",
    "apellido_paterno": "Méndez",
    "apellido_materno": "Pérez",
    "correo": "laura.mendez@sgh.com",
    "password": "Recepcion123*",
    "telefono": "9616660001"
  },
  "puesto": "Recepcionista principal",
  "rol": "RECEPCIONISTA",
  "estado": true
}
```

### Actualizar Personal Administrativo

```txt
PUT /api/personal-administrativo/:id
```

Acceso: `ADMIN`.

### Activar/Inactivar Personal Administrativo

```txt
PATCH /api/personal-administrativo/:id/estado
```

Acceso: `ADMIN`.

## Especialidades

### Listar Especialidades

```txt
GET /api/especialidades
```

Acceso:

- Público para activas.
- `ADMIN` para todas.

### Obtener Especialidad

```txt
GET /api/especialidades/:id
```

Acceso:

- Público si está activa.
- `ADMIN`.

### Crear Especialidad

```txt
POST /api/especialidades
```

Acceso: `ADMIN`.

Body:

```json
{
  "nombre": "Cardiología",
  "descripcion": "Diagnóstico y tratamiento de enfermedades del corazón",
  "estado": true
}
```

### Actualizar Especialidad

```txt
PUT /api/especialidades/:id
```

Acceso: `ADMIN`.

### Activar/Inactivar Especialidad

```txt
PATCH /api/especialidades/:id/estado
```

Acceso: `ADMIN`.

## Horarios

### Listar Horarios

```txt
GET /api/horarios
```

Acceso: `ADMIN`.

### Horarios por Doctor

```txt
GET /api/horarios/doctor/:doctorId
```

Acceso:

- Público si el doctor está activo.
- `ADMIN`.
- `DOCTOR` dueño del horario.

### Crear Horario

```txt
POST /api/horarios
```

Acceso: `ADMIN`.

Body:

```json
{
  "doctor_id": "uuid",
  "dia_semana": "Lunes",
  "hora_inicio": "08:00",
  "hora_fin": "14:00",
  "duracion_cita_minutos": 30,
  "consultorio": "C-204",
  "estado": true
}
```

### Actualizar Horario

```txt
PUT /api/horarios/:id
```

Acceso: `ADMIN`.

### Activar/Inactivar Horario

```txt
PATCH /api/horarios/:id/estado
```

Acceso: `ADMIN`.

## Turnos

### Listar Turnos

```txt
GET /api/turnos
```

Acceso: `ADMIN`.

### Crear Turno

```txt
POST /api/turnos
```

Acceso: `ADMIN`.

Body:

```json
{
  "nombre": "Matutino",
  "hora_inicio": "07:00",
  "hora_fin": "14:00",
  "descripcion": "Turno de la mañana",
  "estado": true
}
```

### Actualizar Turno

```txt
PUT /api/turnos/:id
```

Acceso: `ADMIN`.

### Activar/Inactivar Turno

```txt
PATCH /api/turnos/:id/estado
```

Acceso: `ADMIN`.

## Pacientes

### Listar Pacientes

```txt
GET /api/pacientes
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`

### Obtener Paciente

```txt
GET /api/pacientes/:id
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`
- `PACIENTE` dueño del perfil.
- `DOCTOR` solo si tiene cita asignada con ese paciente.

### Crear Paciente

```txt
POST /api/pacientes
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`

Body:

```json
{
  "usuario": {
    "nombre": "Luis",
    "apellido_paterno": "Ramírez",
    "apellido_materno": "Gómez",
    "correo": "luis.ramirez@mail.com",
    "password": "Paciente123*",
    "telefono": "9614440001"
  },
  "fecha_nacimiento": "2001-05-12",
  "sexo": "Masculino",
  "direccion": "Dirección simulada",
  "contacto_emergencia": "María Gómez",
  "telefono_emergencia": "9619990000",
  "estado": true
}
```

### Actualizar Paciente

```txt
PUT /api/pacientes/:id
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`
- `PACIENTE` dueño del perfil con campos limitados.

### Activar/Inactivar Paciente

```txt
PATCH /api/pacientes/:id/estado
```

Acceso: `ADMIN`.

### Citas de Paciente

```txt
GET /api/pacientes/:id/citas
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`
- `PACIENTE` dueño del perfil.

## Citas

### Listar Citas

```txt
GET /api/citas?doctor_id=uuid&paciente_id=uuid&estado=Confirmada&fecha=2026-07-15
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`

### Obtener Cita

```txt
GET /api/citas/:id
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`
- `DOCTOR` dueño de la cita.
- `PACIENTE` dueño de la cita.

### Crear Cita

```txt
POST /api/citas
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`
- `PACIENTE`

Body:

```json
{
  "paciente_id": "uuid",
  "doctor_id": "uuid",
  "especialidad_id": "uuid",
  "fecha": "2026-07-15",
  "hora_inicio": "10:00",
  "motivo_consulta": "Dolor en el pecho"
}
```

Reglas:

- Validar paciente activo.
- Validar doctor activo.
- Validar especialidad activa.
- Validar fecha no pasada.
- Validar hora disponible.
- Calcular `hora_fin` según duración de cita.
- Generar folio.
- Crear con estado `Pendiente`.
- Respetar el índice único parcial de citas activas para evitar doble cita.

### Actualizar Cita

```txt
PUT /api/citas/:id
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`

### Confirmar Cita

```txt
PATCH /api/citas/:id/confirmar
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`

Reglas:

- Solo si está `Pendiente` o `Reprogramada`.
- Registrar historial.

### Cancelar Cita

```txt
PATCH /api/citas/:id/cancelar
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`
- `PACIENTE` dueño de la cita si cumple reglas.

Body:

```json
{
  "motivo_cancelacion": "No podré asistir"
}
```

Reglas:

- No cancelar citas atendidas.
- No cancelar citas ya canceladas.
- Paciente solo puede cancelar citas propias pendientes o confirmadas.
- Validar tiempo mínimo de cancelación para pacientes.
- Registrar historial.
- Al pasar a `Cancelada`, el horario queda libre porque el índice único parcial solo bloquea citas activas.

### Reprogramar Cita

```txt
PATCH /api/citas/:id/reprogramar
```

Acceso:

- `ADMIN`
- `RECEPCIONISTA`

Body:

```json
{
  "nueva_fecha": "2026-07-16",
  "nueva_hora_inicio": "09:30",
  "comentario": "Reprogramada por disponibilidad del doctor"
}
```

Reglas:

- Validar nueva disponibilidad.
- Actualizar fecha y hora.
- Calcular nueva `hora_fin`.
- Actualizar estado a `Reprogramada`.
- Registrar historial.

### Marcar Cita como Atendida

```txt
PATCH /api/citas/:id/atendida
```

Acceso:

- `DOCTOR` dueño de la cita.

Body:

```json
{
  "observaciones": "Paciente valorado durante consulta.",
  "diagnostico_inicial": "Dolor torácico en valoración",
  "recomendaciones": "Realizar estudios complementarios."
}
```

Reglas:

- La cita debe pertenecer al doctor autenticado.
- La cita debe estar `Confirmada`.
- Observaciones obligatorias.
- Crear observación de consulta.
- Cambiar estado a `Atendida`.
- Registrar historial.

### Marcar Cita como No Asistió

```txt
PATCH /api/citas/:id/no-asistio
```

Acceso:

- `DOCTOR` dueño de la cita.

Body:

```json
{
  "comentario": "El paciente no se presentó a la cita."
}
```

Reglas:

- La cita debe pertenecer al doctor autenticado.
- La cita debe estar `Confirmada`.
- Cambiar estado a `No asistió`.
- Registrar historial.

## Endpoints Específicos del Doctor

### Mis Citas

```txt
GET /api/doctor/me/citas
```

Acceso: `DOCTOR`.

Regla:

- Solo devuelve citas del doctor autenticado.

### Citas de Hoy

```txt
GET /api/doctor/me/citas/hoy
```

Acceso: `DOCTOR`.

### Mi Horario

```txt
GET /api/doctor/me/horario
```

Acceso: `DOCTOR`.

### Mi Perfil Médico

```txt
GET /api/doctor/me/perfil
```

Acceso: `DOCTOR`.

## Endpoints Específicos del Paciente

### Mis Citas

```txt
GET /api/paciente/me/citas
```

Acceso: `PACIENTE`.

### Mi Perfil Paciente

```txt
GET /api/paciente/me/perfil
```

Acceso: `PACIENTE`.

### Cancelar Mi Cita

```txt
PATCH /api/paciente/me/citas/:id/cancelar
```

Acceso:

- `PACIENTE` dueño de la cita.

Body:

```json
{
  "motivo_cancelacion": "No podré asistir"
}
```

## Observaciones de Consulta

### Listar Observaciones

```txt
GET /api/observaciones
```

Acceso:

- `ADMIN` para auditoría limitada si se permite.
- `DOCTOR` solo propias.

### Obtener Observación por Cita

```txt
GET /api/observaciones/cita/:citaId
```

Acceso:

- `DOCTOR` dueño de la cita.
- `ADMIN` si se permite.

### Observaciones del Doctor

```txt
GET /api/observaciones/doctor/me
```

Acceso: `DOCTOR`.

## Reportes

### Dashboard General

```txt
GET /api/reportes/dashboard
```

Acceso: `ADMIN`.

### Citas por Estado

```txt
GET /api/reportes/citas-por-estado
```

Acceso: `ADMIN`.

### Citas por Doctor

```txt
GET /api/reportes/citas-por-doctor
```

Acceso: `ADMIN`.

### Citas por Especialidad

```txt
GET /api/reportes/citas-por-especialidad
```

Acceso: `ADMIN`.

### Personal Activo

```txt
GET /api/reportes/personal-activo
```

Acceso: `ADMIN`.

## Disponibilidad

### Disponibilidad por Doctor y Fecha

```txt
GET /api/disponibilidad/doctores/:doctorId?fecha=2026-07-15
```

Acceso:

- Público.
- `PACIENTE`.
- `ADMIN`.
- `RECEPCIONISTA`.

Respuesta:

```json
{
  "success": true,
  "message": "Horarios disponibles obtenidos correctamente",
  "data": {
    "doctor_id": "uuid",
    "doctor": "Dr. Juan Pérez López",
    "fecha": "2026-07-15",
    "duracion_cita_minutos": 30,
    "horarios_disponibles": ["08:00", "08:30", "09:00", "10:00", "10:30"]
  }
}
```

Reglas:

- Validar doctor activo.
- Validar fecha no pasada.
- Buscar horarios activos del doctor.
- Excluir citas con estado `Pendiente`, `Confirmada` o `Reprogramada`.

## Rutas Públicas

```txt
/api/auth/login
/api/auth/register-paciente
/api/doctores
/api/doctores/:id
/api/doctores/especialidad/:especialidadId
/api/especialidades
/api/disponibilidad/doctores/:doctorId
```

## Rutas Solo ADMIN

```txt
/api/usuarios
/api/doctores POST/PUT/PATCH
/api/enfermeros
/api/personal-administrativo
/api/especialidades POST/PUT/PATCH
/api/horarios
/api/turnos
/api/reportes
```

## Rutas ADMIN y RECEPCIONISTA

```txt
/api/citas
/api/pacientes
/api/citas/:id/confirmar
/api/citas/:id/cancelar
/api/citas/:id/reprogramar
```

## Rutas DOCTOR

```txt
/api/doctor/me/citas
/api/doctor/me/citas/hoy
/api/doctor/me/horario
/api/doctor/me/perfil
/api/citas/:id/atendida
/api/citas/:id/no-asistio
/api/observaciones/doctor/me
```

## Rutas PACIENTE

```txt
/api/paciente/me/citas
/api/paciente/me/perfil
/api/paciente/me/citas/:id/cancelar
```

## Reglas de Seguridad por Endpoint

1. Nunca confiar solo en el frontend para permisos.
2. Todo endpoint protegido debe validar JWT.
3. Todo endpoint protegido debe validar rol.
4. Los endpoints de doctor deben validar que la cita pertenezca al doctor autenticado.
5. Los endpoints de paciente deben validar que la cita pertenezca al paciente autenticado.
6. El endpoint de crear cita debe validar disponibilidad real.
7. El endpoint de reprogramar cita debe validar nueva disponibilidad.
8. Las acciones de cambio de estado deben registrar historial.
9. Las eliminaciones deben evitarse; usar inactivación.
10. Las respuestas deben mantener formato estándar.

## Conflictos Esperados

El backend debe devolver `409 Conflict` cuando:

- El correo ya existe.
- La cédula profesional ya existe.
- El folio ya existe.
- La cita intenta ocupar un horario activo ya tomado.
- La base de datos rechaza por el índice parcial `unique_cita_activa_doctor_fecha_hora`.

## Orden Recomendado de Implementación

1. Auth.
2. Usuarios y roles.
3. Especialidades.
4. Doctores.
5. Horarios.
6. Disponibilidad.
7. Pacientes.
8. Citas.
9. Endpoints específicos de doctor.
10. Observaciones.
11. Reportes.

