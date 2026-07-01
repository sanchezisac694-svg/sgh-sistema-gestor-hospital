import { Prisma, RolNombre } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { hashPassword } from '../../utils/hash';
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
} from './users.validators';

type GetUsersQuery = {
  search?: unknown;
  rol?: unknown;
  estado?: unknown;
};

const userSelect = {
  id: true,
  nombre: true,
  apellidoPaterno: true,
  apellidoMaterno: true,
  correo: true,
  telefono: true,
  estado: true,
  createdAt: true,
  updatedAt: true,
  rol: {
    select: {
      id: true,
      nombre: true,
    },
  },
} satisfies Prisma.UsuarioSelect;

function parseRol(value: unknown): RolNombre | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  if (!Object.values(RolNombre).includes(value as RolNombre)) {
    throw new AppError('Rol invalido.', 400);
  }

  return value as RolNombre;
}

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

async function getRolOrThrow(nombre: RolNombre) {
  const rol = await prisma.rol.findUnique({
    where: { nombre },
  });

  if (!rol) {
    throw new AppError('Rol no encontrado.', 400);
  }

  return rol;
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

export async function getUsers(query: GetUsersQuery) {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const rol = parseRol(query.rol);
  const estado = parseEstado(query.estado);

  const where: Prisma.UsuarioWhereInput = {};

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { apellidoPaterno: { contains: search, mode: 'insensitive' } },
      { apellidoMaterno: { contains: search, mode: 'insensitive' } },
      { correo: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (rol) {
    where.rol = {
      nombre: rol,
    };
  }

  if (typeof estado === 'boolean') {
    where.estado = estado;
  }

  return prisma.usuario.findMany({
    where,
    select: userSelect,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getUserById(id: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!usuario) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  return usuario;
}

export async function createUser(input: CreateUserInput) {
  await ensureEmailAvailable(input.correo);

  const rol = await getRolOrThrow(input.rol as RolNombre);
  const passwordHash = await hashPassword(input.password);

  return prisma.usuario.create({
    data: {
      rolId: rol.id,
      nombre: input.nombre,
      apellidoPaterno: input.apellido_paterno,
      apellidoMaterno: input.apellido_materno ?? null,
      correo: input.correo,
      passwordHash,
      telefono: input.telefono ?? null,
      estado: input.estado ?? true,
    },
    select: userSelect,
  });
}

export async function updateUser(id: string, input: UpdateUserInput) {
  await getUserById(id);

  if (input.correo) {
    await ensureEmailAvailable(input.correo, id);
  }

  const data: Prisma.UsuarioUpdateInput = {};

  if (input.nombre !== undefined) {
    data.nombre = input.nombre;
  }

  if (input.apellido_paterno !== undefined) {
    data.apellidoPaterno = input.apellido_paterno;
  }

  if (input.apellido_materno !== undefined) {
    data.apellidoMaterno = input.apellido_materno;
  }

  if (input.correo !== undefined) {
    data.correo = input.correo;
  }

  if (input.telefono !== undefined) {
    data.telefono = input.telefono;
  }

  if (input.estado !== undefined) {
    data.estado = input.estado;
  }

  if (input.rol !== undefined) {
    const rol = await getRolOrThrow(input.rol as RolNombre);
    data.rol = {
      connect: {
        id: rol.id,
      },
    };
  }

  return prisma.usuario.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function updateUserStatus(
  id: string,
  input: UpdateUserStatusInput
) {
  await getUserById(id);

  return prisma.usuario.update({
    where: { id },
    data: {
      estado: input.estado,
    },
    select: userSelect,
  });
}
