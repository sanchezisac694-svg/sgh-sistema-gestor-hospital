# SGH - Fase 2, Parte 5

## Objetivo

Definir formalmente las validaciones, seguridad inicial, manejo de errores y protección de rutas del SGH - Sistema Gestor de Hospital.

Esta fase no implementa backend completo ni conecta frontend. El documento funciona como contrato técnico para las siguientes fases.

## Principios Generales de Seguridad

- Nunca guardar contraseñas en texto plano.
- Nunca confiar únicamente en validaciones del frontend.
- Validar siempre datos en backend.
- Validar siempre permisos por rol.
- Validar siempre pertenencia de recursos.
- Evitar eliminación física de registros importantes.
- Usar inactivación lógica cuando aplique.
- Registrar acciones importantes en historial o auditoría.
- No exponer datos sensibles innecesarios.
- No devolver `password_hash` en respuestas.
- No registrar contraseñas ni tokens en logs.

## Seguridad con JWT

El sistema utilizará JWT para proteger rutas privadas.

Payload recomendado:

```json
{
  "usuario_id": "uuid",
  "correo": "usuario@sgh.com",
  "rol": "DOCTOR"
}
```

Duración sugerida:

```txt
Access token: 1h a 8h
Refresh token: opcional para fases futuras
```

Para la versión inicial puede usarse solo access token.

Header obligatorio en rutas privadas:

```txt
Authorization: Bearer jwt_token
```

## Hash de Contraseñas

Usar:

```txt
bcrypt
```

Reglas:

- Hashear contraseña antes de guardar.
- Comparar contraseña ingresada contra `password_hash`.
- Nunca devolver `password_hash` en respuestas.
- No registrar contraseñas en logs.
- Usar rondas configurables mediante variable de entorno.

Variable sugerida:

```txt
BCRYPT_SALT_ROUNDS=10
```

## Middleware de Autenticación

Middleware recomendado:

```txt
authMiddleware
```

Debe validar:

- Que exista header `Authorization`.
- Que el formato sea `Bearer token`.
- Que el token sea válido.
- Que el usuario exista.
- Que el usuario esté activo.

### Sin Token

Código: `401 Unauthorized`

```json
{
  "success": false,
  "message": "No autenticado. Token requerido.",
  "errors": []
}
```

### Token Inválido o Expirado

Código: `401 Unauthorized`

```json
{
  "success": false,
  "message": "Token inválido o expirado.",
  "errors": []
}
```

### Usuario Inactivo

Código: `403 Forbidden`

```json
{
  "success": false,
  "message": "El usuario se encuentra inactivo.",
  "errors": []
}
```

## Middleware de Roles

Middleware recomendado:

```txt
roleMiddleware(...rolesPermitidos)
```

Ejemplos:

```txt
roleMiddleware('ADMIN')
roleMiddleware('ADMIN', 'RECEPCIONISTA')
roleMiddleware('DOCTOR')
roleMiddleware('PACIENTE')
```

Debe validar:

- Que el usuario tenga un rol permitido.
- Que el rol venga desde el token o usuario autenticado.
- Que rutas críticas no puedan usarse con roles incorrectos.

### Sin Permisos

Código: `403 Forbidden`

```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción.",
  "errors": []
}
```

## Validación de Pertenencia de Recursos

Además del rol, se debe validar que el usuario sea dueño o responsable del recurso.

### Doctor

El doctor solo puede acceder a citas donde:

```txt
cita.doctor_id = doctor_autenticado.id
```

### Paciente

El paciente solo puede acceder a citas donde:

```txt
cita.paciente_id = paciente_autenticado.id
```

Ejemplo:

Aunque un usuario tenga rol `DOCTOR`, no puede acceder a:

```txt
GET /api/citas/:id
```

si la cita no le pertenece.

### Recurso Ajeno

Código: `403 Forbidden`

```json
{
  "success": false,
  "message": "No tienes acceso a este recurso.",
  "errors": []
}
```

## Validaciones Generales por Módulo

### Usuario

- `nombre` obligatorio.
- `apellido_paterno` obligatorio.
- `correo` obligatorio.
- `correo` con formato válido.
- `correo` único.
- `password` obligatoria al crear.
- `rol` obligatorio.
- `telefono` opcional.
- `estado` booleano.

### Paciente

- Usuario asociado obligatorio.
- `fecha_nacimiento` válida.
- `sexo` permitido.
- `telefono` opcional.
- `contacto_emergencia` opcional.
- `telefono_emergencia` opcional.
- `estado` booleano.

Valores permitidos para sexo:

```txt
Masculino
Femenino
Otro
No especificado
```

### Doctor

- Usuario asociado obligatorio.
- Especialidad obligatoria.
- Especialidad activa.
- `cedula_profesional` obligatoria.
- `cedula_profesional` única.
- `consultorio` obligatorio.
- `estado` booleano.

### Enfermero

- Usuario asociado obligatorio.
- `area_asignada` opcional.
- Turno válido si se envía.
- `estado` booleano.

### Personal Administrativo

- Usuario asociado obligatorio.
- `puesto` obligatorio.
- Rol permitido: `ADMIN` o `RECEPCIONISTA`.
- `estado` booleano.

### Especialidad

- `nombre` obligatorio.
- `nombre` único.
- `descripcion` opcional.
- `estado` booleano.

### Turno

- `nombre` obligatorio.
- `hora_inicio` obligatoria.
- `hora_fin` obligatoria.
- `descripcion` opcional.
- `estado` booleano.

Nota:

No usar validación estricta `hora_fin > hora_inicio` en turnos, porque el turno nocturno puede cruzar el día.

### Horario

- Doctor obligatorio.
- Doctor activo.
- `dia_semana` obligatorio.
- `dia_semana` válido.
- `hora_inicio` obligatoria.
- `hora_fin` obligatoria.
- `hora_fin` mayor que `hora_inicio`.
- `duracion_cita_minutos` mayor a 0.
- `consultorio` opcional.
- `estado` booleano.

Días válidos:

```txt
Lunes
Martes
Miércoles
Jueves
Viernes
Sábado
Domingo
```

## Validaciones Especiales de Citas

### Crear Cita

Validar:

- `paciente_id` obligatorio.
- `doctor_id` obligatorio.
- `especialidad_id` obligatorio.
- `fecha` obligatoria.
- `hora_inicio` obligatoria.
- `motivo_consulta` obligatorio.
- Fecha no puede estar en pasado.
- Paciente debe estar activo.
- Doctor debe estar activo.
- Especialidad debe estar activa.
- Doctor debe pertenecer a esa especialidad.
- Hora debe estar dentro del horario activo del doctor.
- Hora debe estar disponible.
- No debe existir cita activa del doctor en la misma fecha y hora.
- Estado inicial debe ser `Pendiente`.

### Calcular Hora Fin

La hora final debe calcularse usando la duración del horario activo del doctor.

Ejemplo:

```txt
hora_inicio: 10:00
duracion_cita_minutos: 30
hora_fin: 10:30
```

### Estados que Bloquean Disponibilidad

Bloquean disponibilidad:

```txt
Pendiente
Confirmada
Reprogramada
```

No bloquean disponibilidad:

```txt
Cancelada
Atendida
No asistió
```

La base de datos debe respaldar esta regla con el índice parcial:

```sql
CREATE UNIQUE INDEX unique_cita_activa_doctor_fecha_hora
ON citas (doctor_id, fecha, hora_inicio)
WHERE estado IN ('Pendiente', 'Confirmada', 'Reprogramada');
```

### Confirmar Cita

Validar:

- La cita existe.
- La cita está en estado `Pendiente` o `Reprogramada`.
- El usuario tiene rol `ADMIN` o `RECEPCIONISTA`.
- Registrar historial de estado.

### Cancelar Cita

Validar:

- La cita existe.
- La cita no está `Atendida`.
- La cita no está `Cancelada`.
- La cita no está en estado `No asistió`.
- `ADMIN` o `RECEPCIONISTA` pueden cancelar cualquier cita válida.
- `PACIENTE` solo puede cancelar citas propias.
- `PACIENTE` solo puede cancelar citas `Pendiente` o `Confirmada`.
- `PACIENTE` no puede cancelar citas pasadas.
- `PACIENTE` debe cumplir tiempo mínimo de cancelación.
- Registrar motivo de cancelación.
- Registrar historial.

### Reprogramar Cita

Validar:

- La cita existe.
- La cita no está `Atendida`.
- La cita no está `Cancelada`.
- La cita no está en estado `No asistió`.
- Solo `ADMIN` o `RECEPCIONISTA` pueden reprogramar.
- Nueva fecha no puede estar en pasado.
- Nueva hora debe estar disponible.
- Actualizar fecha, `hora_inicio` y `hora_fin`.
- Cambiar estado a `Reprogramada`.
- Registrar historial.

### Marcar Atendida

Validar:

- La cita existe.
- El usuario tiene rol `DOCTOR`.
- La cita pertenece al doctor autenticado.
- La cita está `Confirmada`.
- Observaciones obligatorias.
- No existe observación previa para esa cita.
- Crear observación de consulta.
- Cambiar estado a `Atendida`.
- Registrar historial.

### Marcar No Asistió

Validar:

- La cita existe.
- El usuario tiene rol `DOCTOR`.
- La cita pertenece al doctor autenticado.
- La cita está `Confirmada`.
- Cambiar estado a `No asistió`.
- Registrar historial.

## Validaciones de Disponibilidad

Para devolver horarios disponibles:

1. Validar doctor existente.
2. Validar doctor activo.
3. Validar fecha no pasada.
4. Obtener día de la semana.
5. Buscar horarios activos del doctor para ese día.
6. Generar bloques según duración.
7. Buscar citas activas del doctor en esa fecha.
8. Excluir bloques ocupados.
9. Devolver solo horarios disponibles.

### Sin Disponibilidad

Código: `200 OK`

```json
{
  "success": true,
  "message": "No hay horarios disponibles para la fecha seleccionada.",
  "data": {
    "doctor_id": "uuid",
    "fecha": "2026-07-15",
    "horarios_disponibles": []
  }
}
```

## Manejo Estándar de Errores

### Error de Validación

Código: `400 Bad Request`

```json
{
  "success": false,
  "message": "Datos inválidos.",
  "errors": [
    {
      "field": "correo",
      "message": "El correo electrónico no es válido."
    }
  ]
}
```

### Registro Duplicado

Código: `409 Conflict`

```json
{
  "success": false,
  "message": "El registro ya existe.",
  "errors": [
    {
      "field": "correo",
      "message": "Este correo ya está registrado."
    }
  ]
}
```

### Cita Ocupada

Código: `409 Conflict`

```json
{
  "success": false,
  "message": "El horario seleccionado ya no está disponible.",
  "errors": [
    {
      "field": "hora_inicio",
      "message": "El doctor ya tiene una cita activa en ese horario."
    }
  ]
}
```

### Recurso No Encontrado

Código: `404 Not Found`

```json
{
  "success": false,
  "message": "Recurso no encontrado.",
  "errors": []
}
```

### Error Interno

Código: `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Ocurrió un error interno en el servidor.",
  "errors": []
}
```

## Códigos HTTP por Acción

| Acción | Código recomendado |
|---|---:|
| Crear registro | `201 Created` |
| Consultar registros | `200 OK` |
| Actualizar registro | `200 OK` |
| Cambiar estado | `200 OK` |
| Datos inválidos | `400 Bad Request` |
| No autenticado | `401 Unauthorized` |
| Sin permisos | `403 Forbidden` |
| No encontrado | `404 Not Found` |
| Duplicado / conflicto | `409 Conflict` |
| Transición inválida | `422 Unprocessable Entity` |
| Error interno | `500 Internal Server Error` |

## Auditoría e Historial

### Historial de Citas

Registrar en `historial_citas` cuando:

- Se confirme una cita.
- Se cancele una cita.
- Se reprograme una cita.
- Se marque como atendida.
- Se marque como no asistió.

Guardar:

- `cita_id`
- `usuario_id` que realizó la acción
- `estado_anterior`
- `estado_nuevo`
- `comentario`
- `created_at`

### Auditoría Básica

Registrar en `auditoria_basica` acciones como:

- Crear doctor.
- Editar doctor.
- Inactivar doctor.
- Crear especialidad.
- Editar horario.
- Inactivar usuario.
- Crear paciente desde administración.

Guardar:

- `usuario_id`
- `tabla_afectada`
- `registro_id`
- `accion`
- `descripcion`
- `created_at`

## Protección de Datos Sensibles

El sistema no debe devolver:

- `password_hash`
- Tokens internos
- Datos innecesarios de otros usuarios
- Observaciones médicas a roles no autorizados
- Información de citas ajenas

## Validación Frontend vs Backend

### Frontend

Debe validar para mejorar experiencia:

- Campos obligatorios.
- Formato de correo.
- Contraseñas coincidentes.
- Fechas pasadas.
- Campos vacíos.

### Backend

Debe validar obligatoriamente:

- Permisos.
- Roles.
- Datos duplicados.
- Disponibilidad.
- Pertenencia de recursos.
- Estados permitidos.
- Transiciones de estado.
- Reglas críticas de citas.

## Protección de Rutas Frontend

Componentes recomendados:

```txt
ProtectedRoute
RoleRoute
```

Reglas:

```txt
/admin/* solo ADMIN
/doctor/* solo DOCTOR
/paciente/* solo PACIENTE
```

Si un usuario no tiene permiso:

```txt
Redirigir a /login o /unauthorized
```

## Protección de Rutas Backend

Ejemplos:

```js
router.post('/doctores', authMiddleware, roleMiddleware('ADMIN'), crearDoctor);

router.get('/doctor/me/citas', authMiddleware, roleMiddleware('DOCTOR'), obtenerMisCitas);

router.patch('/citas/:id/atendida', authMiddleware, roleMiddleware('DOCTOR'), marcarAtendida);

router.patch('/citas/:id/confirmar', authMiddleware, roleMiddleware('ADMIN', 'RECEPCIONISTA'), confirmarCita);
```

## Reglas Contra Accesos Indebidos

- Un `DOCTOR` no puede consultar citas de otro doctor.
- Un `PACIENTE` no puede consultar citas de otro paciente.
- Un `RECEPCIONISTA` no puede registrar observaciones médicas.
- Un `ENFERMERO` no puede marcar citas como atendidas.
- Un `ADMIN` no debe registrar atención médica en esta versión.
- Un usuario inactivo no puede consumir endpoints protegidos.
- Una ruta protegida nunca debe responder datos aunque el frontend oculte el acceso.

## Orden Recomendado de Implementación

1. Utilidades de respuesta estándar.
2. Manejo centralizado de errores.
3. Validadores de entrada.
4. Hash y comparación de contraseñas.
5. Generación y verificación JWT.
6. `authMiddleware`.
7. `roleMiddleware`.
8. Validadores de pertenencia de recurso.
9. Validaciones de disponibilidad.
10. Auditoría e historial.

