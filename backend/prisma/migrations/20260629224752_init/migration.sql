-- CreateEnum
CREATE TYPE "RolNombre" AS ENUM ('ADMIN', 'DOCTOR', 'ENFERMERO', 'RECEPCIONISTA', 'PACIENTE');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'REPROGRAMADA', 'ATENDIDA', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "SexoPaciente" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO', 'NO_ESPECIFICADO');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "nombre" "RolNombre" NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido_paterno" VARCHAR(100) NOT NULL,
    "apellido_materno" VARCHAR(100),
    "correo" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "telefono" VARCHAR(20),
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especialidades" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctores" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "especialidad_id" UUID NOT NULL,
    "cedula_profesional" VARCHAR(50) NOT NULL,
    "consultorio" VARCHAR(50) NOT NULL,
    "biografia" TEXT,
    "foto_url" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "doctores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enfermeros" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "area_asignada" VARCHAR(100),
    "turno_id" UUID,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "enfermeros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_administrativo" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "puesto" VARCHAR(100) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "personal_administrativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "fecha_nacimiento" DATE,
    "sexo" "SexoPaciente" NOT NULL DEFAULT 'NO_ESPECIFICADO',
    "direccion" TEXT,
    "contacto_emergencia" VARCHAR(150),
    "telefono_emergencia" VARCHAR(20),
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "duracion_cita_minutos" INTEGER NOT NULL DEFAULT 30,
    "consultorio" VARCHAR(50),
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "horarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" UUID NOT NULL,
    "folio" VARCHAR(50) NOT NULL,
    "paciente_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "especialidad_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "motivo_consulta" TEXT NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones_admin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observaciones_consulta" (
    "id" UUID NOT NULL,
    "cita_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "observaciones" TEXT NOT NULL,
    "diagnostico_inicial" TEXT,
    "recomendaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "observaciones_consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_citas" (
    "id" UUID NOT NULL,
    "cita_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "estado_anterior" "EstadoCita",
    "estado_nuevo" "EstadoCita",
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_basica" (
    "id" UUID NOT NULL,
    "usuario_id" UUID,
    "tabla_afectada" VARCHAR(100),
    "registro_id" UUID,
    "accion" VARCHAR(50),
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_basica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_nombre_key" ON "especialidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "doctores_usuario_id_key" ON "doctores"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctores_cedula_profesional_key" ON "doctores"("cedula_profesional");

-- CreateIndex
CREATE UNIQUE INDEX "enfermeros_usuario_id_key" ON "enfermeros"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "personal_administrativo_usuario_id_key" ON "personal_administrativo"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_usuario_id_key" ON "pacientes"("usuario_id");

-- CreateIndex
CREATE INDEX "horarios_doctor_id_idx" ON "horarios"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "citas_folio_key" ON "citas"("folio");

-- CreateIndex
CREATE INDEX "citas_doctor_id_fecha_idx" ON "citas"("doctor_id", "fecha");

-- CreateIndex
CREATE INDEX "citas_paciente_id_idx" ON "citas"("paciente_id");

-- CreateIndex
CREATE INDEX "citas_estado_idx" ON "citas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "observaciones_consulta_cita_id_key" ON "observaciones_consulta"("cita_id");

-- CreateIndex
CREATE INDEX "observaciones_consulta_cita_id_idx" ON "observaciones_consulta"("cita_id");

-- CreateIndex
CREATE INDEX "historial_citas_cita_id_idx" ON "historial_citas"("cita_id");

-- CreateIndex
CREATE INDEX "auditoria_basica_usuario_id_idx" ON "auditoria_basica"("usuario_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctores" ADD CONSTRAINT "doctores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctores" ADD CONSTRAINT "doctores_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enfermeros" ADD CONSTRAINT "enfermeros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enfermeros" ADD CONSTRAINT "enfermeros_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_administrativo" ADD CONSTRAINT "personal_administrativo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_consulta" ADD CONSTRAINT "observaciones_consulta_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_consulta" ADD CONSTRAINT "observaciones_consulta_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_consulta" ADD CONSTRAINT "observaciones_consulta_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_citas" ADD CONSTRAINT "historial_citas_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_citas" ADD CONSTRAINT "historial_citas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_basica" ADD CONSTRAINT "auditoria_basica_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
