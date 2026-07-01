CREATE UNIQUE INDEX unique_cita_activa_doctor_fecha_hora
ON citas (doctor_id, fecha, hora_inicio)
WHERE estado IN ('PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA');
