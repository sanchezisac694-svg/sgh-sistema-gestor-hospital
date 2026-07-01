import { Prisma, RolNombre } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { hashPassword } from '../../utils/hash';
import {
  CreateDoctorInput,
  UpdateDoctorInput,
  UpdateDoctorStatusInput,
} from './doctors.validators';

type GetDoctorsQuery = {
  search?: unknown;
  especialidad_id?: unknown;
  estado?: unknown;
};

const doctorInclude = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      correo: true,
      telefono: true,
      estado: true,
    },
  },
  especialidad: {
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      estado: true,
    },
  },
} satisfies Prisma.DoctorInclude;

function parseEstado(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new AppError('El filtro estado debe ser true o false.', 400);
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

async function ensureCedulaAvailable(cedulaProfesional: string, doctorId?: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { cedulaProfesional },
  });

  if (doctor && doctor.id !== doctorId) {
    throw new AppError('La cedula profesional ya esta registrada.', 409, [
      {
        field: 'cedula_profesional',
        message: 'Esta cedula ya existe.',
      },
    ]);
  }
}

async function getActiveSpecialtyOrThrow(especialidadId: string) {
  const especialidad = await prisma.especialidad.findUnique({
    where: { id: especialidadId },
  });

  if (!especialidad || !especialidad.estado) {
    throw new AppError('Especialidad no encontrada o inactiva.', 400);
  }

  return especialidad;
}

async function getDoctorRoleOrThrow() {
  const rol = await prisma.rol.findUnique({
    where: { nombre: RolNombre.DOCTOR },
  });

  if (!rol) {
    throw new AppError('Rol DOCTOR no configurado.', 500);
  }

  return rol;
}

export async function getDoctors(
  query: GetDoctorsQuery,
  includeInactive = false
) {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const especialidadId =
    typeof query.especialidad_id === 'string' ? query.especialidad_id : undefined;
  const estado = parseEstado(query.estado);
  const where: Prisma.DoctorWhereInput = {};

  if (!includeInactive) {
    where.estado = true;
    where.usuario = {
      estado: true,
    };
  } else if (typeof estado === 'boolean') {
    where.estado = estado;
  }

  if (especialidadId) {
    where.especialidadId = especialidadId;
  }

  if (search) {
    where.OR = [
      { cedulaProfesional: { contains: search, mode: 'insensitive' } },
      { consultorio: { contains: search, mode: 'insensitive' } },
      { usuario: { nombre: { contains: search, mode: 'insensitive' } } },
      { usuario: { apellidoPaterno: { contains: search, mode: 'insensitive' } } },
      { usuario: { correo: { contains: search, mode: 'insensitive' } } },
      { especialidad: { nombre: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return prisma.doctor.findMany({
    where,
    include: doctorInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getDoctorById(id: string, includeInactive = false) {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: doctorInclude,
  });

  if (
    !doctor ||
    (!includeInactive && (!doctor.estado || !doctor.usuario.estado))
  ) {
    throw new AppError('Doctor no encontrado.', 404);
  }

  return doctor;
}

export async function createDoctor(input: CreateDoctorInput) {
  const rolDoctor = await getDoctorRoleOrThrow();
  await ensureEmailAvailable(input.usuario.correo);
  await ensureCedulaAvailable(input.cedula_profesional);
  await getActiveSpecialtyOrThrow(input.especialidad_id);

  const passwordHash = await hashPassword(input.usuario.password);
  const estado = input.estado ?? true;

  const doctor = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        rolId: rolDoctor.id,
        nombre: input.usuario.nombre,
        apellidoPaterno: input.usuario.apellido_paterno,
        apellidoMaterno: input.usuario.apellido_materno ?? null,
        correo: input.usuario.correo,
        passwordHash,
        telefono: input.usuario.telefono ?? null,
        estado,
      },
    });

    return tx.doctor.create({
      data: {
        usuarioId: usuario.id,
        especialidadId: input.especialidad_id,
        cedulaProfesional: input.cedula_profesional,
        consultorio: input.consultorio,
        biografia: input.biografia ?? null,
        fotoUrl: input.foto_url ?? null,
        estado,
      },
      include: doctorInclude,
    });
  });

  return doctor;
}

export async function updateDoctor(id: string, input: UpdateDoctorInput) {
  const doctor = await getDoctorById(id, true);

  if (input.usuario?.correo) {
    await ensureEmailAvailable(input.usuario.correo, doctor.usuario.id);
  }

  if (input.cedula_profesional) {
    await ensureCedulaAvailable(input.cedula_profesional, id);
  }

  if (input.especialidad_id) {
    await getActiveSpecialtyOrThrow(input.especialidad_id);
  }

  return prisma.$transaction(async (tx) => {
    if (input.usuario) {
      await tx.usuario.update({
        where: { id: doctor.usuario.id },
        data: {
          nombre: input.usuario.nombre,
          apellidoPaterno: input.usuario.apellido_paterno,
          apellidoMaterno: input.usuario.apellido_materno,
          correo: input.usuario.correo,
          telefono: input.usuario.telefono,
          estado: input.estado,
        },
      });
    } else if (input.estado !== undefined) {
      await tx.usuario.update({
        where: { id: doctor.usuario.id },
        data: {
          estado: input.estado,
        },
      });
    }

    return tx.doctor.update({
      where: { id },
      data: {
        especialidadId: input.especialidad_id,
        cedulaProfesional: input.cedula_profesional,
        consultorio: input.consultorio,
        biografia: input.biografia,
        fotoUrl: input.foto_url,
        estado: input.estado,
      },
      include: doctorInclude,
    });
  });
}

export async function updateDoctorStatus(
  id: string,
  input: UpdateDoctorStatusInput
) {
  const doctor = await getDoctorById(id, true);

  return prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: doctor.usuario.id },
      data: {
        estado: input.estado,
      },
    });

    return tx.doctor.update({
      where: { id },
      data: {
        estado: input.estado,
      },
      include: doctorInclude,
    });
  });
}

export async function getDoctorsBySpecialty(especialidadId: string) {
  await getActiveSpecialtyOrThrow(especialidadId);

  return prisma.doctor.findMany({
    where: {
      especialidadId,
      estado: true,
      usuario: {
        estado: true,
      },
    },
    include: doctorInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });
}
