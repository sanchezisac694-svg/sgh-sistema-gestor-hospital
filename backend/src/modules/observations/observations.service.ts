import { Prisma, RolNombre } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { buildDateRangeFilter } from '../../utils/dates';

type AuthUser = {
  id: string;
  correo: string;
  rol: RolNombre;
};

type GetObservationsQuery = {
  doctor_id?: unknown;
  paciente_id?: unknown;
  fecha?: unknown;
  search?: unknown;
};

const observationInclude = {
  cita: {
    select: {
      id: true,
      folio: true,
      fecha: true,
      horaInicio: true,
      horaFin: true,
      motivoConsulta: true,
      estado: true,
    },
  },
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
    },
  },
  paciente: {
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
    },
  },
} satisfies Prisma.ObservacionConsultaInclude;

async function getDoctorFromAuthUser(usuarioId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { usuarioId },
  });

  if (!doctor) {
    throw new AppError('Perfil de doctor no encontrado.', 404);
  }

  return doctor;
}

function ensureDoctorOwnsObservation(
  observation: { doctor: { usuarioId: string } },
  user: AuthUser
) {
  if (user.rol === RolNombre.DOCTOR && observation.doctor.usuarioId !== user.id) {
    throw new AppError('No tienes permisos para realizar esta accion.', 403);
  }
}

export async function getObservations(query: GetObservationsQuery) {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const where: Prisma.ObservacionConsultaWhereInput = {};

  if (typeof query.doctor_id === 'string') where.doctorId = query.doctor_id;
  if (typeof query.paciente_id === 'string') where.pacienteId = query.paciente_id;
  if (typeof query.fecha === 'string') {
    where.cita = { fecha: buildDateRangeFilter(query.fecha, query.fecha) };
  }

  if (search) {
    where.OR = [
      { observaciones: { contains: search, mode: 'insensitive' } },
      { diagnosticoInicial: { contains: search, mode: 'insensitive' } },
      { recomendaciones: { contains: search, mode: 'insensitive' } },
      { paciente: { usuario: { nombre: { contains: search, mode: 'insensitive' } } } },
      { doctor: { usuario: { nombre: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  return prisma.observacionConsulta.findMany({
    where,
    include: observationInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getObservationById(id: string, user: AuthUser) {
  const observation = await prisma.observacionConsulta.findUnique({
    where: { id },
    include: observationInclude,
  });

  if (!observation) {
    throw new AppError('Observacion no encontrada.', 404);
  }

  ensureDoctorOwnsObservation(observation, user);
  return observation;
}

export async function getObservationByAppointment(citaId: string, user: AuthUser) {
  const observation = await prisma.observacionConsulta.findUnique({
    where: { citaId },
    include: observationInclude,
  });

  if (!observation) {
    throw new AppError('Observacion no encontrada.', 404);
  }

  ensureDoctorOwnsObservation(observation, user);
  return observation;
}

export async function getMyDoctorObservations(usuarioId: string) {
  const doctor = await getDoctorFromAuthUser(usuarioId);

  return prisma.observacionConsulta.findMany({
    where: { doctorId: doctor.id },
    include: observationInclude,
    orderBy: { createdAt: 'desc' },
  });
}
