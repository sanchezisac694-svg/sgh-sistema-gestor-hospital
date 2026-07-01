# SGH - Fase 2, Parte 2

## Objetivo

Diseñar la base de datos inicial de PostgreSQL para el SGH - Sistema Gestor de Hospital.

El script principal está en:

```txt
database/schema.sql
```

## Decisiones principales

- Motor: PostgreSQL.
- Llaves primarias: UUID con `gen_random_uuid()`.
- Extensión requerida: `pgcrypto`.
- Nombres de tablas: plural y `snake_case`.
- Campos: `snake_case`.
- Tablas principales con `created_at` y `updated_at`.
- Activo/inactivo con `estado BOOLEAN` donde aplique.
- Estados de cita controlados con `CHECK`.
- Relaciones con `FOREIGN KEY`.
- Datos iniciales para roles, especialidades y turnos.

## Tablas incluidas

- `roles`
- `usuarios`
- `especialidades`
- `turnos`
- `doctores`
- `enfermeros`
- `personal_administrativo`
- `pacientes`
- `horarios`
- `citas`
- `observaciones_consulta`
- `historial_citas`
- `auditoria_basica`

## Roles iniciales

```txt
ADMIN
DOCTOR
ENFERMERO
RECEPCIONISTA
PACIENTE
```

## Estados de cita permitidos

```txt
Pendiente
Confirmada
Cancelada
Reprogramada
Atendida
No asistió
```

## Regla crítica de disponibilidad

Para evitar doble cita del mismo doctor en la misma fecha y hora, se usa un índice único parcial:

```sql
CREATE UNIQUE INDEX unique_cita_activa_doctor_fecha_hora
ON citas (doctor_id, fecha, hora_inicio)
WHERE estado IN ('Pendiente', 'Confirmada', 'Reprogramada');
```

Esta decisión reemplaza un `UNIQUE` directo sobre:

```txt
doctor_id, fecha, hora_inicio
```

## Justificación

Un `UNIQUE` directo bloquearía el horario aunque la cita estuviera cancelada, atendida o marcada como no asistió.

El índice único parcial solo bloquea horarios con citas activas:

- `Pendiente`
- `Confirmada`
- `Reprogramada`

Así:

- Una cita cancelada libera el horario.
- Una cita atendida queda como historial.
- Una cita marcada como no asistió queda como historial.
- La disponibilidad real se controla desde la base de datos.

## Reglas de integridad cubiertas

- No duplicar correos de usuarios.
- No duplicar cédulas profesionales.
- No duplicar folios de cita.
- No duplicar citas activas para el mismo doctor en la misma fecha y hora.
- No registrar horarios con hora fin menor o igual a hora inicio.
- No registrar citas con hora fin menor o igual a hora inicio.
- No registrar estados de cita fuera de los permitidos.
- No registrar días de semana inválidos.
- No registrar duración de cita menor o igual a cero.

## Consideraciones para Prisma

Prisma puede modelar la mayoría de tablas y relaciones, pero los índices únicos parciales no siempre se expresan completamente desde el schema de Prisma.

Recomendación:

- Mantener este índice parcial en una migración SQL manual.
- Documentarlo como regla crítica de disponibilidad.
- No reemplazarlo por `@@unique([doctor_id, fecha, hora_inicio])`, porque eso reintroduciría el bloqueo de horarios cancelados.

## Siguiente parte recomendada

1. Crear `backend/`.
2. Configurar Prisma o Drizzle.
3. Convertir `database/schema.sql` en migración inicial.
4. Crear seed inicial.
5. Implementar módulo Auth.
6. Implementar guards por rol.
7. Implementar validación real de disponibilidad de citas usando la misma regla del índice parcial.
