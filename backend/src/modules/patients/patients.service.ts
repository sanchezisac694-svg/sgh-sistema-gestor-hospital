import { Prisma, RolNombre, SexoPaciente } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { hashPassword } from '../../utils/hash';
import {
  CreatePatientInput,
  UpdatePatientInput,
  UpdatePatientStatusInput,
} from './patients.validators';

type GetPatientsQuery = {
  search?: unknown;
  sexo?: unknown;
  estado?: unknown;
};

const patientInclude = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      correo: true,
      telefono: true,
      estado: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.PacienteInclude;

const appointmentInclude = {
  doctor: {
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          correo: true,
          telefono: true,
        },
      },
      especialidad: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  },
  especialidad: {
    select: {
      id: true,
      nombre: true,
    },
  },
} satisfies Prisma.CitaInclude;

function parseEstado(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new AppError('El filtro estado debe ser true o false.', 400);
}

function parseSexo(value: unknown): SexoPaciente | undefined {
  if (typeof value !== 'string') return undefined;
  if (!Object.values(SexoPaciente).includes(value as SexoPaciente)) {
    throw new AppError('Sexo invalido.', 400);
  }
  return value as SexoPaciente;
}

function parseOptionalDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new AppError('La fecha de nacimiento no es valida.', 400, [
      {
        field: 'fecha_nacimiento',
        message: 'Use el formato YYYY-MM-DD.',
      },
    ]);
  }

  return date;
}

async function ensureEmailAvailable(correo: string, usuarioId?: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo },
  });

  if (usuario && usuario.id !== usuarioId) {
    throw new AppError('El correo ya esta registrado.', 409, [
      {
        field: 'correo',
        message: 'Este correo ya existe.',
      },
    ]);
  }
}

async function getPatientRoleOrThrow() {
  const rol = await prisma.rol.findUnique({
    where: { nombre: RolNombre.PACIENTE },
  });

  if (!rol) {
    throw new AppError('Rol PACIENTE no configurado.', 500);
  }

  return rol;
}

export async function getPatients(query: GetPatientsQuery) {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const sexo = parseSexo(query.sexo);
  const estado = parseEstado(query.estado);
  const where: Prisma.PacienteWhereInput = {};

  if (sexo) where.sexo = sexo;
  if (typeof estado === 'boolean') where.estado = estado;

  if (search) {
    where.OR = [
      { usuario: { nombre: { contains: search, mode: 'insensitive' } } },
      { usuario: { apellidoPaterno: { contains: search, mode: 'insensitive' } } },
      { usuario: { apellidoMaterno: { contains: search, mode: 'insensitive' } } },
      { usuario: { correo: { contains: search, mode: 'insensitive' } } },
      { usuario: { telefono: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return prisma.paciente.findMany({
    where,
    include: patientInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getPatientById(id: string) {
  const patient = await prisma.paciente.findUnique({
    where: { id },
    include: patientInclude,
  });

  if (!patient) {
    throw new AppError('Paciente no encontrado.', 404);
  }

  return patient;
}

export async function createPatient(input: CreatePatientInput) {
  const rolPaciente = await getPatientRoleOrThrow();
  await ensureEmailAvailable(input.usuario.correo);

  const passwordHash = await hashPassword(input.usuario.password);
  const estado = input.estado ?? true;
  const fechaNacimiento = parseOptionalDate(input.fecha_nacimiento);

  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        rolId: rolPaciente.id,
        nombre: input.usuario.nombre,
        apellidoPaterno: input.usuario.apellido_paterno,
        apellidoMaterno: input.usuario.apellido_materno ?? null,
        correo: input.usuario.correo,
        passwordHash,
        telefono: input.usuario.telefono ?? null,
        estado,
      },
    });

    return tx.paciente.create({
      data: {
        usuarioId: usuario.id,
        fechaNacimiento,
        sexo: input.sexo,
        direccion: input.direccion ?? null,
        contactoEmergencia: input.contacto_emergencia ?? null,
        telefonoEmergencia: input.telefono_emergencia ?? null,
        estado,
      },
      include: patientInclude,
    });
  });
}

export async function updatePatient(id: string, input: UpdatePatientInput) {
  const patient = await getPatientById(id);

  if (input.usuario?.correo) {
    await ensureEmailAvailable(input.usuario.correo, patient.usuario.id);
  }

  const fechaNacimiento =
    input.fecha_nacimiento !== undefined
      ? parseOptionalDate(input.fecha_nacimiento)
      : undefined;

  return prisma.$transaction(async (tx) => {
    if (input.usuario || input.estado !== undefined) {
      await tx.usuario.update({
        where: { id: patient.usuario.id },
        data: {
          nombre: input.usuario?.nombre,
          apellidoPaterno: input.usuario?.apellido_paterno,
          apellidoMaterno: input.usuario?.apellido_materno,
          correo: input.usuario?.correo,
          telefono: input.usuario?.telefono,
          estado: input.estado,
        },
      });
    }

    return tx.paciente.update({
      where: { id },
      data: {
        fechaNacimiento,
        sexo: input.sexo,
        direccion: input.direccion,
        contactoEmergencia: input.contacto_emergencia,
        telefonoEmergencia: input.telefono_emergencia,
        estado: input.estado,
      },
      include: patientInclude,
    });
  });
}

export async function updatePatientStatus(
  id: string,
  input: UpdatePatientStatusInput
) {
  const patient = await getPatientById(id);

  return prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: patient.usuario.id },
      data: {
        estado: input.estado,
      },
    });

    return tx.paciente.update({
      where: { id },
      data: {
        estado: input.estado,
      },
      include: patientInclude,
    });
  });
}

export async function getPatientAppointments(id: string) {
  await getPatientById(id);

  return prisma.cita.findMany({
    where: {
      pacienteId: id,
    },
    include: appointmentInclude,
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
  });
}

export async function getMyPatientProfile(usuarioId: string) {
  const patient = await prisma.paciente.findUnique({
    where: { usuarioId },
    include: patientInclude,
  });

  if (!patient) {
    throw new AppError('Paciente no encontrado.', 404);
  }

  return patient;
}
