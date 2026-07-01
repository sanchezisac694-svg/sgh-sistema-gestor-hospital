CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rol_id UUID NOT NULL REFERENCES roles(id),
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  correo VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  telefono VARCHAR(20),
  estado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE especialidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  estado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  descripcion TEXT,
  estado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE doctores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id),
  especialidad_id UUID NOT NULL REFERENCES especialidades(id),
  cedula_profesional VARCHAR(50) UNIQUE NOT NULL,
  consultorio VARCHAR(50) NOT NULL,
  biografia TEXT,
  foto_url TEXT,
  estado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE enfermeros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id),
  area_asignada VARCHAR(100),
  turno_id UUID REFERENCES turnos(id),
  estado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE personal_administrativo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id),
  puesto VARCHAR(100) NOT NULL,
  estado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id),
  fecha_nacimiento DATE,
  sexo VARCHAR(20),
  direccion TEXT,
  contacto_emergencia VARCHAR(150),
  telefono_emergencia VARCHAR(20),
  estado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,

  CONSTRAINT chk_sexo_paciente CHECK (
    sexo IS NULL OR sexo IN ('Femenino', 'Masculino', 'Prefiero no especificar')
  )
);

CREATE TABLE horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctores(id),
  dia_semana VARCHAR(20) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  duracion_cita_minutos INT DEFAULT 30,
  consultorio VARCHAR(50),
  estado BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,

  CONSTRAINT chk_horario_valido CHECK (hora_fin > hora_inicio),
  CONSTRAINT chk_duracion_cita CHECK (duracion_cita_minutos > 0),
  CONSTRAINT chk_dia_semana CHECK (
    dia_semana IN (
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo'
    )
  )
);

CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio VARCHAR(50) UNIQUE NOT NULL,
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  doctor_id UUID NOT NULL REFERENCES doctores(id),
  especialidad_id UUID NOT NULL REFERENCES especialidades(id),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  motivo_consulta TEXT NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
  observaciones_admin TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,

  CONSTRAINT chk_estado_cita CHECK (
    estado IN (
      'Pendiente',
      'Confirmada',
      'Cancelada',
      'Reprogramada',
      'Atendida',
      'No asistió'
    )
  ),

  CONSTRAINT chk_hora_cita_valida CHECK (hora_fin > hora_inicio)
);

CREATE TABLE observaciones_consulta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id UUID UNIQUE NOT NULL REFERENCES citas(id),
  doctor_id UUID NOT NULL REFERENCES doctores(id),
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  observaciones TEXT NOT NULL,
  diagnostico_inicial TEXT,
  recomendaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE historial_citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id UUID NOT NULL REFERENCES citas(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  estado_anterior VARCHAR(30),
  estado_nuevo VARCHAR(30),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_historial_estado_anterior CHECK (
    estado_anterior IS NULL OR estado_anterior IN (
      'Pendiente',
      'Confirmada',
      'Cancelada',
      'Reprogramada',
      'Atendida',
      'No asistió'
    )
  ),

  CONSTRAINT chk_historial_estado_nuevo CHECK (
    estado_nuevo IS NULL OR estado_nuevo IN (
      'Pendiente',
      'Confirmada',
      'Cancelada',
      'Reprogramada',
      'Atendida',
      'No asistió'
    )
  )
);

CREATE TABLE auditoria_basica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  tabla_afectada VARCHAR(100),
  registro_id UUID,
  accion VARCHAR(50),
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (nombre, descripcion) VALUES
('ADMIN', 'Administrador general del sistema'),
('DOCTOR', 'Médico con acceso a sus citas, horario y perfil'),
('ENFERMERO', 'Personal de enfermería'),
('RECEPCIONISTA', 'Personal de recepción y apoyo en citas'),
('PACIENTE', 'Usuario paciente del sistema');

INSERT INTO especialidades (nombre, descripcion) VALUES
('Medicina general', 'Atención médica primaria y seguimiento general del paciente'),
('Pediatría', 'Atención médica especializada para niños y adolescentes'),
('Cardiología', 'Diagnóstico y tratamiento de enfermedades del corazón'),
('Ginecología', 'Atención médica especializada en salud femenina'),
('Otorrinolaringología', 'Atención de oído, nariz y garganta'),
('Gastroenterología', 'Atención del sistema digestivo'),
('Dermatología', 'Atención de piel, cabello y uñas'),
('Traumatología', 'Atención de lesiones óseas, musculares y articulares');

INSERT INTO turnos (nombre, hora_inicio, hora_fin, descripcion) VALUES
('Matutino', '07:00', '14:00', 'Turno de la mañana'),
('Vespertino', '14:00', '21:00', 'Turno de la tarde'),
('Nocturno', '21:00', '07:00', 'Turno de la noche');

CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_doctores_especialidad ON doctores(especialidad_id);
CREATE INDEX idx_citas_doctor_fecha ON citas(doctor_id, fecha);
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_estado ON citas(estado);
CREATE INDEX idx_horarios_doctor ON horarios(doctor_id);
CREATE INDEX idx_observaciones_cita ON observaciones_consulta(cita_id);
CREATE INDEX idx_historial_cita ON historial_citas(cita_id);
CREATE INDEX idx_auditoria_usuario ON auditoria_basica(usuario_id);

CREATE UNIQUE INDEX unique_cita_activa_doctor_fecha_hora
ON citas (doctor_id, fecha, hora_inicio)
WHERE estado IN ('Pendiente', 'Confirmada', 'Reprogramada');
