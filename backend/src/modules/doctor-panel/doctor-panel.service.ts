import { EstadoCita, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { dateStringToDate, dateToDateString } from '../../utils/dates';
import { dateToTimeString } from '../../utils/time';

type DoctorAppointmentsQuery = {
  fecha?: unknown;
  estado?: unknown;
  search?: unknown;
};

const doctorProfileInclude = {
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
  especialidad: {
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      estado: true,
    },
  },
} satisfies Prisma.DoctorInclude;

const doctorAppointmentInclude = {
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
          estado: true,
        },
      },
    },
  },
  especialidad: {
    select: {
      id: true,
      nombre: true,
      estado: true,
    },
  },
  observacion: true,
} satisfies Prisma.CitaInclude;

function formatAppointment<T extends { fecha: Date; horaInicio: Date; horaFin: Date }>(
  appointment: T
) {
  return {
    ...appointment,
    fecha: dateToDateString(appointment.fecha),
    horaInicio: dateToTimeString(appointment.horaInicio),
    horaFin: dateToTimeString(appointment.horaFin),
  };
}

function formatSchedule<T extends { horaInicio: Date; horaFin: Date }>(schedule: T) {
  return {
    ...schedule,
    horaInicio: dateToTimeString(schedule.horaInicio),
    horaFin: dateToTimeString(schedule.horaFin),
  };
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseEstado(value: unknown): EstadoCita | undefined {
  if (typeof value !== 'string') return undefined;

  if (!Object.values(EstadoCita).includes(value as EstadoCita)) {
    throw new AppError('Estado de cita invalido.', 400);
  }

  return value as EstadoCita;
}

export async function getDoctorFromAuthUser(usuarioId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { usuarioId },
    include: doctorProfileInclude,
  });

  if (!doctor || !doctor.estado || !doctor.usuario.estado) {
    throw new AppError('Perfil de doctor no encontrado.', 404);
  }

  return doctor;
}

export async function getDoctorDashboard(usuarioId: string) {
  const doctor = await getDoctorFromAuthUser(usuarioId);
  const today = getLocalDateString();
  const todayDate = dateStringToDate(today);

  const [
    citasHoy,
    proximasCitas,
    pendientes,
    confirmadas,
    atendidas,
    noAsistio,
    citasHoyLista,
    proximasCitasLista,
  ] = await Promise.all([
    prisma.cita.count({ where: { doctorId: doctor.id, fecha: todayDate } }),
    prisma.cita.count({
      where: {
        doctorId: doctor.id,
        fecha: { gte: todayDate },
        estado: { in: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA, EstadoCita.REPROGRAMADA] },
      },
    }),
    prisma.cita.count({ where: { doctorId: doctor.id, estado: EstadoCita.PENDIENTE } }),
    prisma.cita.count({ where: { doctorId: doctor.id, estado: EstadoCita.CONFIRMADA } }),
    prisma.cita.count({ where: { doctorId: doctor.id, estado: EstadoCita.ATENDIDA } }),
    prisma.cita.count({ where: { doctorId: doctor.id, estado: EstadoCita.NO_ASISTIO } }),
    prisma.cita.findMany({
      where: { doctorId: doctor.id, fecha: todayDate },
      include: doctorAppointmentInclude,
      orderBy: { horaInicio: 'asc' },
      take: 10,
    }),
    prisma.cita.findMany({
      where: {
        doctorId: doctor.id,
        fecha: { gte: todayDate },
        estado: { in: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA, EstadoCita.REPROGRAMADA] },
      },
      include: doctorAppointmentInclude,
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
      take: 10,
    }),
  ]);

  return {
    resumen: {
      citasHoy,
      proximasCitas,
      pendientes,
      confirmadas,
      atendidas,
      noAsistio,
    },
    citasHoy: citasHoyLista.map(formatAppointment),
    proximasCitas: proximasCitasLista.map(formatAppointment),
  };
}

export async function getMyDoctorAppointments(
  usuarioId: string,
  query: DoctorAppointmentsQuery
) {
  const doctor = await getDoctorFromAuthUser(usuarioId);
  const estado = parseEstado(query.estado);
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const where: Prisma.CitaWhereInput = {
    doctorId: doctor.id,
  };

  if (typeof query.fecha === 'string') {
    where.fecha = dateStringToDate(query.fecha);
  }

  if (estado) {
    where.estado = estado;
  }

  if (search) {
    where.OR = [
      { folio: { contains: search, mode: 'insensitive' } },
      { motivoConsulta: { contains: search, mode: 'insensitive' } },
      { paciente: { usuario: { nombre: { contains: search, mode: 'insensitive' } } } },
      { paciente: { usuario: { apellidoPaterno: { contains: search, mode: 'insensitive' } } } },
      { paciente: { usuario: { correo: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const appointments = await prisma.cita.findMany({
    where,
    include: doctorAppointmentInclude,
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
  });

  return appointments.map(formatAppointment);
}

export async function getTodayDoctorAppointments(usuarioId: string) {
  const doctor = await getDoctorFromAuthUser(usuarioId);
  const today = dateStringToDate(getLocalDateString());

  const appointments = await prisma.cita.findMany({
    where: {
      doctorId: doctor.id,
      fecha: today,
    },
    include: doctorAppointmentInclude,
    orderBy: {
      horaInicio: 'asc',
    },
  });

  return appointments.map(formatAppointment);
}

export async function getMyDoctorSchedule(usuarioId: string, estado?: unknown) {
  const doctor = await getDoctorFromAuthUser(usuarioId);
  const includeAll = estado === 'all';

  const schedules = await prisma.horario.findMany({
    where: {
      doctorId: doctor.id,
      estado: includeAll ? undefined : true,
    },
    orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
  });

  return schedules.map(formatSchedule);
}

export async function getMyDoctorProfile(usuarioId: string) {
  return getDoctorFromAuthUser(usuarioId);
}

export async function getMyDoctorAppointmentById(usuarioId: string, appointmentId: string) {
  const doctor = await getDoctorFromAuthUser(usuarioId);
  const appointment = await prisma.cita.findUnique({
    where: { id: appointmentId },
    include: doctorAppointmentInclude,
  });

  if (!appointment) {
    throw new AppError('Cita no encontrada.', 404);
  }

  if (appointment.doctorId !== doctor.id) {
    throw new AppError('No tienes permisos para realizar esta accion.', 403);
  }

  return formatAppointment(appointment);
}
