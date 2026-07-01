-- Prisma no soporta indices unicos parciales desde schema.prisma.
-- Agregar este SQL manualmente al final de:
-- prisma/migrations/<timestamp>_init/migration.sql
-- despues de ejecutar:
-- npx prisma migrate dev --name init

CREATE UNIQUE INDEX unique_cita_activa_doctor_fecha_hora
ON citas (doctor_id, fecha, hora_inicio)
WHERE estado IN ('PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA');
