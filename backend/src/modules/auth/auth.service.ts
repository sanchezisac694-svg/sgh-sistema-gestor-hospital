import { RolNombre, SexoPaciente } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { comparePassword, hashPassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import { LoginInput, RegisterPacienteInput } from './auth.validators';

function publicUsuario(usuario: {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  correo: string;
  telefono: string | null;
  estado: boolean;
  rol: { nombre: RolNombre };
}) {
  return {
    id: usuario.id,
    nombre: `${usuario.nombre} ${usuario.apellidoPaterno}`.trim(),
    nombres: usuario.nombre,
    apellido_paterno: usuario.apellidoPaterno,
    apellido_materno: usuario.apellidoMaterno,
    correo: usuario.correo,
    telefono: usuario.telefono,
    estado: usuario.estado,
    rol: usuario.rol.nombre,
  };
}

function parseOptionalDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(
      'La fecha de nacimiento no es valida.',
      400,
      [
        {
          field: 'fecha_nacimiento',
          message: 'Use el formato YYYY-MM-DD.',
        },
      ]
    );
  }

  return date;
}

export async function login(input: LoginInput) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo: input.correo },
    include: { rol: true },
  });

  if (!usuario) {
    throw new AppError('Credenciales incorrectas.', 401);
  }

  if (!usuario.estado) {
    throw new AppError('El usuario se encuentra inactivo.', 403);
  }

  const passwordValida = await comparePassword(input.password, usuario.passwordHash);

  if (!passwordValida) {
    throw new AppError('Credenciales incorrectas.', 401);
  }

  const token = generateToken({
    usuarioId: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol.nombre,
  });

  return {
    token,
    usuario: publicUsuario(usuario),
  };
}

export async function registerPaciente(input: RegisterPacienteInput) {
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { correo: input.correo },
  });

  if (usuarioExistente) {
    throw new AppError(
      'El correo ya esta registrado.',
      409,
      [
        {
          field: 'correo',
          message: 'Este correo ya existe.',
        },
      ]
    );
  }

  const rolPaciente = await prisma.rol.findUnique({
    where: { nombre: RolNombre.PACIENTE },
  });

  if (!rolPaciente) {
    throw new AppError('Rol PACIENTE no configurado.', 500);
  }

  const passwordHash = await hashPassword(input.password);
  const fechaNacimiento = parseOptionalDate(input.fecha_nacimiento);

  const usuarioCreado = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        rolId: rolPaciente.id,
        nombre: input.nombre,
        apellidoPaterno: input.apellido_paterno,
        apellidoMaterno: input.apellido_materno ?? null,
        correo: input.correo,
        passwordHash,
        telefono: input.telefono ?? null,
      },
      include: { rol: true },
    });

    await tx.paciente.create({
      data: {
        usuarioId: usuario.id,
        fechaNacimiento,
        sexo: input.sexo as SexoPaciente,
        direccion: input.direccion ?? null,
        contactoEmergencia: input.contacto_emergencia ?? null,
        telefonoEmergencia: input.telefono_emergencia ?? null,
      },
    });

    return usuario;
  });

  const token = generateToken({
    usuarioId: usuarioCreado.id,
    correo: usuarioCreado.correo,
    rol: usuarioCreado.rol.nombre,
  });

  return {
    token,
    usuario: publicUsuario(usuarioCreado),
  };
}

export async function getMe(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: {
      rol: true,
      doctor: {
        select: {
          id: true,
          cedulaProfesional: true,
          consultorio: true,
          especialidad: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
      paciente: {
        select: {
          id: true,
          fechaNacimiento: true,
          sexo: true,
          direccion: true,
          contactoEmergencia: true,
          telefonoEmergencia: true,
        },
      },
    },
  });

  if (!usuario) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  return {
    ...publicUsuario(usuario),
    doctor: usuario.doctor
      ? {
          id: usuario.doctor.id,
          cedula_profesional: usuario.doctor.cedulaProfesional,
          consultorio: usuario.doctor.consultorio,
          especialidad: usuario.doctor.especialidad,
        }
      : null,
    paciente: usuario.paciente
      ? {
          id: usuario.paciente.id,
          fecha_nacimiento: usuario.paciente.fechaNacimiento,
          sexo: usuario.paciente.sexo,
          direccion: usuario.paciente.direccion,
          contacto_emergencia: usuario.paciente.contactoEmergencia,
          telefono_emergencia: usuario.paciente.telefonoEmergencia,
        }
      : null,
  };
}
