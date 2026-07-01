# SGH - Fase 2, Parte 3

## Objetivo

Definir formalmente los roles, permisos, reglas de negocio y restricciones funcionales del SGH - Sistema Gestor de Hospital.

Esta fase no implementa endpoints ni conecta frontend con backend. Sirve como contrato funcional para las siguientes fases.

## Roles oficiales

```txt
ADMIN
DOCTOR
ENFERMERO
RECEPCIONISTA
PACIENTE
```

## Descripción de Roles

### ADMIN

Rol con acceso completo al sistema administrativo.

Puede:

- Gestionar usuarios.
- Gestionar doctores.
- Gestionar enfermeros.
- Gestionar personal administrativo.
- Gestionar especialidades.
- Gestionar horarios.
- Gestionar turnos.
- Gestionar pacientes.
- Gestionar citas.
- Ver reportes generales.
- Confirmar, cancelar o reprogramar citas.
- Activar o inactivar registros.

No puede en esta versión:

- Registrar observaciones clínicas.
- Marcar citas como atendidas.
- Actuar como doctor, salvo que en una versión futura tenga también perfil médico.

### DOCTOR

Rol médico con acceso limitado a sus propias citas, horario y perfil profesional.

Puede:

- Ver su dashboard.
- Ver únicamente sus citas.
- Ver citas de hoy.
- Ver próximas citas.
- Ver información básica del paciente.
- Ver motivo de consulta.
- Marcar cita como atendida.
- Marcar cita como no asistió.
- Registrar observaciones de consulta.
- Ver su horario.
- Ver su perfil profesional.

No puede:

- Crear doctores.
- Crear especialidades.
- Modificar horarios.
- Eliminar citas.
- Ver citas de otros doctores.
- Administrar usuarios.
- Ver reportes generales del hospital.
- Modificar datos administrativos del sistema.
- Reprogramar citas.

### ENFERMERO

Rol operativo preparado para futuras funciones clínicas u operativas.

Puede en esta versión:

- Existir como personal registrado.
- Tener área asignada.
- Tener turno asignado.
- Ver su perfil propio cuando exista módulo específico.

No puede:

- Administrar usuarios.
- Crear doctores.
- Crear especialidades.
- Modificar horarios.
- Gestionar reportes generales.
- Atender citas como doctor.
- Registrar observaciones médicas principales.

### RECEPCIONISTA

Rol administrativo limitado para apoyo en citas y pacientes.

Puede:

- Ver citas.
- Crear citas.
- Confirmar citas.
- Cancelar citas.
- Reprogramar citas.
- Registrar pacientes.
- Consultar pacientes.
- Actualizar información básica de pacientes.

No puede:

- Crear doctores.
- Inactivar doctores.
- Crear especialidades.
- Modificar horarios médicos.
- Ver reportes generales avanzados.
- Administrar usuarios administradores.
- Registrar observaciones clínicas.

### PACIENTE

Rol público para usuarios que agendan y consultan sus propias citas.

Puede:

- Registrarse.
- Iniciar sesión.
- Buscar doctores por especialidad.
- Ver información pública de doctores.
- Ver horarios disponibles.
- Agendar citas.
- Consultar sus propias citas.
- Cancelar sus citas pendientes o confirmadas si cumple reglas.
- Actualizar su perfil básico.

No puede:

- Ver citas de otros pacientes.
- Ver información interna del hospital.
- Confirmar citas.
- Reprogramar citas directamente sin autorización.
- Atender citas.
- Registrar observaciones médicas.
- Ver reportes.
- Administrar usuarios.

## Matriz General de Permisos

| Módulo / Acción | ADMIN | DOCTOR | ENFERMERO | RECEPCIONISTA | PACIENTE |
|---|---:|---:|---:|---:|---:|
| Ver dashboard administrador | Sí | No | No | Parcial | No |
| Ver dashboard doctor | No | Sí | No | No | No |
| Ver área pública | Sí | Sí | Sí | Sí | Sí |
| Gestionar usuarios | Sí | No | No | No | No |
| Crear doctores | Sí | No | No | No | No |
| Editar doctores | Sí | No | No | No | No |
| Activar/inactivar doctores | Sí | No | No | No | No |
| Crear enfermeros | Sí | No | No | No | No |
| Crear personal administrativo | Sí | No | No | No | No |
| Crear especialidades | Sí | No | No | No | No |
| Editar especialidades | Sí | No | No | No | No |
| Gestionar horarios | Sí | No | No | No | No |
| Ver horario propio | No | Sí | No | No | No |
| Gestionar turnos | Sí | No | No | No | No |
| Ver todas las citas | Sí | No | No | Sí | No |
| Ver citas propias como doctor | No | Sí | No | No | No |
| Ver citas propias como paciente | No | No | No | No | Sí |
| Crear cita | Sí | No | No | Sí | Sí |
| Confirmar cita | Sí | No | No | Sí | No |
| Cancelar cualquier cita | Sí | No | No | Sí | No |
| Cancelar cita propia | No | No | No | No | Sí |
| Reprogramar cita | Sí | No | No | Sí | Solicitud futura |
| Atender cita | No | Sí | No | No | No |
| Marcar no asistió | No | Sí | No | No | No |
| Registrar observaciones | No | Sí | Futuro parcial | No | No |
| Ver reportes generales | Sí | No | No | No | No |
| Ver perfil propio | Sí | Sí | Sí | Sí | Sí |

## Autenticación

1. Todo usuario debe iniciar sesión para acceder a módulos privados.
2. El acceso se controla con JWT.
3. El token debe incluir `usuario_id`, `rol` y `correo`.
4. Un usuario inactivo no puede iniciar sesión.
5. Un usuario autenticado solo puede acceder a rutas permitidas por su rol.
6. Si el usuario intenta acceder a una ruta no permitida, el backend debe responder `403 Forbidden`.
7. Si el token no existe o no es válido, el backend debe responder `401 Unauthorized`.

Payload recomendado:

```json
{
  "usuario_id": "uuid",
  "rol": "DOCTOR",
  "correo": "juan.perez@sgh.com"
}
```

## Reglas de Usuarios

1. Solo ADMIN puede crear usuarios internos.
2. Los pacientes pueden registrarse desde el área pública.
3. El correo del usuario debe ser único.
4. La contraseña debe guardarse con hash.
5. Un usuario inactivo no puede acceder al sistema.
6. No se elimina físicamente un usuario; se inactiva.
7. Los cambios importantes deben registrarse en auditoría.

## Reglas de Doctores

1. Solo ADMIN puede crear, editar, activar o inactivar doctores.
2. Cada doctor debe tener un usuario asociado.
3. Cada doctor debe tener una especialidad.
4. Cada doctor debe tener cédula profesional única.
5. Cada doctor debe tener consultorio asignado.
6. Un doctor inactivo no aparece en búsqueda pública.
7. Un doctor inactivo no recibe nuevas citas.
8. Un doctor inactivo no genera disponibilidad.
9. El doctor solo puede consultar su perfil en esta versión.
10. La edición del perfil profesional queda reservada para ADMIN.

## Reglas de Especialidades

1. Solo ADMIN puede crear o editar especialidades.
2. Una especialidad puede estar activa o inactiva.
3. Una especialidad inactiva no aparece en filtros públicos.
4. No se pueden duplicar nombres de especialidad.
5. No se recomienda eliminar especialidades con doctores relacionados; se deben inactivar.

## Reglas de Horarios

1. Solo ADMIN puede crear, editar o inactivar horarios.
2. Cada horario pertenece a un doctor.
3. La hora fin debe ser mayor que la hora inicio.
4. La duración de cita debe ser mayor a cero.
5. Los horarios inactivos no generan disponibilidad.
6. El doctor puede ver su horario, pero no editarlo.
7. El paciente solo ve disponibilidad generada desde horarios activos.
8. Un doctor puede tener varios horarios por semana.
9. No se deben generar bloques fuera del horario asignado.
10. No se deben mostrar horarios ocupados.

## Reglas de Turnos

1. Solo ADMIN puede crear, editar o inactivar turnos.
2. Los turnos se usan principalmente para enfermeros y personal administrativo.
3. El turno nocturno puede cruzar el día.
4. Un turno inactivo no debe asignarse a nuevo personal.
5. No se recomienda eliminar turnos usados en registros existentes.

## Reglas de Pacientes

1. Un paciente puede registrarse desde el sitio público.
2. Cada paciente debe tener un usuario asociado.
3. Un paciente activo puede agendar citas.
4. Un paciente inactivo no puede agendar nuevas citas.
5. El paciente solo puede ver sus propias citas.
6. El paciente no puede ver citas de otros pacientes.
7. El paciente puede cancelar citas propias si la cita está pendiente o confirmada.
8. El paciente puede cancelar solo si la cita no está en el pasado.
9. El paciente puede cancelar solo si cumple el tiempo mínimo de cancelación definido por el sistema.
10. El paciente no puede marcar citas como atendidas.
11. El paciente no puede confirmar citas.

## Reglas de Citas

### Creación

Una cita puede ser creada por:

```txt
ADMIN
RECEPCIONISTA
PACIENTE
```

Validaciones obligatorias:

- Paciente obligatorio.
- Doctor obligatorio.
- Especialidad obligatoria.
- Fecha obligatoria.
- Hora obligatoria.
- Motivo de consulta obligatorio.
- Doctor activo.
- Paciente activo.
- Especialidad activa.
- Fecha no pasada.
- Horario disponible.
- Sin doble cita activa del doctor a esa hora.

### Estado Inicial

Toda cita nueva inicia con estado:

```txt
Pendiente
```

Excepción futura: administración podría crear citas directamente como confirmadas si la configuración del hospital lo permite.

### Estados Oficiales

```txt
Pendiente
Confirmada
Cancelada
Reprogramada
Atendida
No asistió
```

### Transiciones Permitidas

| Estado actual | Puede cambiar a |
|---|---|
| Pendiente | Confirmada, Cancelada, Reprogramada |
| Confirmada | Cancelada, Reprogramada, Atendida, No asistió |
| Reprogramada | Confirmada, Cancelada |
| Cancelada | No cambia |
| Atendida | No cambia |
| No asistió | No cambia |

### Permisos de Cambio de Estado

| Cambio de estado | ADMIN | RECEPCIONISTA | DOCTOR | PACIENTE |
|---|---:|---:|---:|---:|
| Pendiente → Confirmada | Sí | Sí | No | No |
| Pendiente → Cancelada | Sí | Sí | No | Sí, si es propia |
| Pendiente → Reprogramada | Sí | Sí | No | No |
| Confirmada → Cancelada | Sí | Sí | No | Sí, si es propia y cumple reglas |
| Confirmada → Reprogramada | Sí | Sí | No | No |
| Confirmada → Atendida | No | No | Sí | No |
| Confirmada → No asistió | No | No | Sí | No |
| Reprogramada → Confirmada | Sí | Sí | No | No |
| Reprogramada → Cancelada | Sí | Sí | No | Sí, si es propia |
| Atendida → Otro estado | No | No | No | No |
| Cancelada → Otro estado | No | No | No | No |
| No asistió → Otro estado | No | No | No | No |

## Reglas de Disponibilidad

Para obtener horarios disponibles:

1. Verificar que el doctor exista.
2. Verificar que el doctor esté activo.
3. Verificar que la especialidad esté activa.
4. Verificar que la fecha no sea pasada.
5. Obtener el día de la semana de la fecha.
6. Buscar horarios activos del doctor para ese día.
7. Generar bloques según `duracion_cita_minutos`.
8. Consultar citas del doctor en esa fecha con estado `Pendiente`, `Confirmada` o `Reprogramada`.
9. Excluir horas ocupadas.
10. Devolver solo horarios disponibles.

La regla de base de datos que respalda esto es el índice único parcial:

```sql
CREATE UNIQUE INDEX unique_cita_activa_doctor_fecha_hora
ON citas (doctor_id, fecha, hora_inicio)
WHERE estado IN ('Pendiente', 'Confirmada', 'Reprogramada');
```

## Reglas Específicas del Doctor

1. El doctor solo accede a citas donde `citas.doctor_id` corresponde a su perfil.
2. El doctor no puede consultar citas de otros doctores.
3. El doctor puede atender solo citas propias.
4. El doctor puede atender solo citas confirmadas.
5. El doctor puede marcar como `No asistió` solo citas propias y confirmadas.
6. El doctor debe registrar observaciones para marcar como `Atendida`.
7. El doctor no puede eliminar observaciones.
8. El doctor no puede modificar datos del paciente desde este módulo.
9. El doctor no puede reprogramar citas.

## Reglas de Observaciones de Consulta

1. Solo DOCTOR puede registrar observaciones.
2. La cita debe pertenecer al doctor autenticado.
3. La cita debe estar confirmada.
4. Las observaciones son obligatorias si se marca como atendida.
5. Una cita solo debe tener una observación principal.
6. No se deben eliminar físicamente observaciones.
7. La observación debe quedar relacionada con cita, doctor y paciente.
8. Al registrar observación y marcar atendida, debe actualizarse el estado de la cita.

## Reglas del Administrador

1. ADMIN puede ver todo el sistema administrativo.
2. ADMIN puede registrar, editar, activar e inactivar personal.
3. ADMIN puede crear especialidades.
4. ADMIN puede crear horarios.
5. ADMIN puede crear turnos.
6. ADMIN puede ver todas las citas.
7. ADMIN puede confirmar, cancelar o reprogramar citas.
8. ADMIN puede consultar reportes generales.
9. ADMIN no debe registrar atención médica en esta versión.
10. ADMIN no debe eliminar registros críticos; debe inactivar.

## Reglas del Recepcionista

1. RECEPCIONISTA puede apoyar en gestión de pacientes y citas.
2. Puede registrar pacientes.
3. Puede crear citas.
4. Puede confirmar citas.
5. Puede cancelar citas.
6. Puede reprogramar citas.
7. No puede crear doctores.
8. No puede modificar horarios.
9. No puede ver reportes generales.
10. No puede administrar usuarios administrativos.
11. No puede registrar observaciones médicas.

## Reglas del Enfermero

1. ENFERMERO no tiene módulo operativo completo en esta versión.
2. Puede existir como personal registrado.
3. Puede tener turno y área asignada.
4. No puede atender citas como doctor.
5. No puede registrar observaciones principales.
6. Queda preparado para fases futuras.

## Validaciones por Formulario

### Usuario

- Nombre obligatorio.
- Apellido paterno obligatorio.
- Correo obligatorio.
- Correo único.
- Rol obligatorio.
- Contraseña obligatoria al crear.
- Teléfono opcional.
- Estado obligatorio.

### Doctor

- Usuario obligatorio.
- Especialidad obligatoria.
- Cédula profesional obligatoria.
- Cédula profesional única.
- Consultorio obligatorio.
- Estado obligatorio.

### Especialidad

- Nombre obligatorio.
- Nombre único.
- Estado obligatorio.

### Horario

- Doctor obligatorio.
- Día obligatorio.
- Hora inicio obligatoria.
- Hora fin obligatoria.
- Hora fin mayor que hora inicio.
- Duración mayor a cero.
- Estado obligatorio.

### Cita

- Paciente obligatorio.
- Doctor obligatorio.
- Especialidad obligatoria.
- Fecha obligatoria.
- Hora obligatoria.
- Motivo obligatorio.
- Fecha no pasada.
- Doctor activo.
- Paciente activo.
- Horario disponible.
- Sin doble cita activa.
- Estado válido.

### Observación de Consulta

- Cita obligatoria.
- Doctor obligatorio.
- Paciente obligatorio.
- Observaciones obligatorias.
- Diagnóstico opcional.
- Recomendaciones opcionales.

## Seguridad por Rol en Frontend

El frontend debe ocultar opciones no permitidas:

- El doctor no ve menú de reportes.
- El paciente no ve panel admin.
- El recepcionista no ve gestión de doctores.
- El enfermero no ve gestión de usuarios.
- El admin ve todos los módulos administrativos.

Ocultar opciones mejora la experiencia, pero la seguridad real siempre debe aplicarse en backend.

## Seguridad por Rol en Backend

El backend debe validar permisos en cada endpoint protegido.

Ejemplos:

```txt
POST  /api/doctores                    -> Solo ADMIN
GET   /api/citas                       -> ADMIN o RECEPCIONISTA
GET   /api/citas/doctor/me             -> Solo DOCTOR
GET   /api/citas/paciente/me           -> Solo PACIENTE
PATCH /api/citas/:id/atendida          -> Solo DOCTOR dueño de la cita
PATCH /api/citas/:id/no-asistio        -> Solo DOCTOR dueño de la cita
PATCH /api/citas/:id/confirmar         -> ADMIN o RECEPCIONISTA
PATCH /api/citas/:id/cancelar          -> ADMIN, RECEPCIONISTA o PACIENTE dueño si cumple reglas
PATCH /api/citas/:id/reprogramar       -> ADMIN o RECEPCIONISTA
POST  /api/citas/:id/observaciones     -> Solo DOCTOR dueño de la cita
```

## Flujos Permitidos

### Paciente agenda cita

1. Paciente selecciona especialidad.
2. Sistema muestra doctores activos.
3. Paciente selecciona doctor.
4. Sistema consulta horarios activos.
5. Sistema excluye citas activas ya ocupadas.
6. Paciente selecciona fecha y hora disponible.
7. Paciente registra motivo.
8. Sistema crea cita en estado `Pendiente`.

### Recepcionista confirma cita

1. Recepcionista consulta citas pendientes.
2. Verifica datos de paciente y doctor.
3. Cambia estado de `Pendiente` a `Confirmada`.
4. Sistema registra historial de cita.

### Doctor atiende cita

1. Doctor consulta sus citas.
2. Selecciona cita propia confirmada.
3. Registra observaciones obligatorias.
4. Puede registrar diagnóstico y recomendaciones.
5. Sistema marca la cita como `Atendida`.
6. Sistema registra historial y observación.

### Paciente cancela cita propia

1. Paciente consulta sus citas.
2. Selecciona cita pendiente o confirmada.
3. Sistema valida que la cita no esté en pasado.
4. Sistema valida tiempo mínimo de cancelación.
5. Sistema cambia estado a `Cancelada`.
6. El horario queda disponible porque la cita cancelada no participa en el índice único parcial.

## Flujos No Permitidos

- Doctor intentando ver citas de otro doctor.
- Doctor intentando reprogramar cita.
- Paciente intentando confirmar cita.
- Paciente intentando ver cita ajena.
- Recepcionista intentando registrar observaciones médicas.
- Enfermero intentando atender cita como doctor.
- ADMIN intentando registrar atención médica en esta versión.
- Cualquier rol intentando acceder a rutas no autorizadas.

## Códigos de Respuesta Esperados

```txt
200 OK                  Operación exitosa.
201 Created             Recurso creado.
400 Bad Request          Validación fallida.
401 Unauthorized         Token ausente o inválido.
403 Forbidden            Rol sin permiso.
404 Not Found            Recurso no encontrado.
409 Conflict             Conflicto de negocio, por ejemplo horario ocupado.
422 Unprocessable Entity Transición de estado no permitida.
```

