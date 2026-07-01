import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import {
  CreateSpecialtyInput,
  UpdateSpecialtyInput,
  UpdateSpecialtyStatusInput,
} from './specialties.validators';

type GetSpecialtiesQuery = {
  search?: unknown;
  estado?: unknown;
};

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

async function ensureSpecialtyNameAvailable(nombre: string, specialtyId?: string) {
  const specialty = await prisma.especialidad.findFirst({
    where: {
      nombre: {
        equals: nombre,
        mode: 'insensitive',
      },
    },
  });

  if (specialty && specialty.id !== specialtyId) {
    throw new AppError('La especialidad ya esta registrada.', 409, [
      {
        field: 'nombre',
        message: 'Este nombre de especialidad ya existe.',
      },
    ]);
  }
}

export async function getSpecialties(
  query: GetSpecialtiesQuery,
  includeInactive = false
) {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const estado = parseEstado(query.estado);
  const where: Prisma.EspecialidadWhereInput = {};

  if (!includeInactive) {
    where.estado = true;
  } else if (typeof estado === 'boolean') {
    where.estado = estado;
  }

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { descripcion: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.especialidad.findMany({
    where,
    orderBy: {
      nombre: 'asc',
    },
  });
}

export async function getSpecialtyById(id: string, includeInactive = false) {
  const specialty = await prisma.especialidad.findUnique({
    where: { id },
  });

  if (!specialty || (!includeInactive && !specialty.estado)) {
    throw new AppError('Especialidad no encontrada.', 404);
  }

  return specialty;
}

export async function createSpecialty(input: CreateSpecialtyInput) {
  await ensureSpecialtyNameAvailable(input.nombre);

  return prisma.especialidad.create({
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      estado: input.estado ?? true,
    },
  });
}

export async function updateSpecialty(id: string, input: UpdateSpecialtyInput) {
  await getSpecialtyById(id, true);

  if (input.nombre) {
    await ensureSpecialtyNameAvailable(input.nombre, id);
  }

  return prisma.especialidad.update({
    where: { id },
    data: {
      nombre: input.nombre,
      descripcion: input.descripcion,
      estado: input.estado,
    },
  });
}

export async function updateSpecialtyStatus(
  id: string,
  input: UpdateSpecialtyStatusInput
) {
  await getSpecialtyById(id, true);

  return prisma.especialidad.update({
    where: { id },
    data: {
      estado: input.estado,
    },
  });
}
