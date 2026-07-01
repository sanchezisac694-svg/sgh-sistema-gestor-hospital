import { DiaSemana, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { dateToTimeString, timeStringToDate, timeStringToMinutes } from '../../utils/time';
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  UpdateScheduleStatusInput,
} from './schedules.validators';

type GetSchedulesQuery = {
  doctor_id?: unknown;
  dia_semana?: unknown;
  estado?: unknown;
};

const scheduleInclude = {
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
          estado: true,
        },
      },
      especialidad: {
        select: {
          id: true,
          nombre: true,
          estado: true,
        },
      },
    },
  },
} satisfies Prisma.HorarioInclude;

function parseEstado(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new AppError('El filtro estado debe ser true o false.', 400);
}

function parseDiaSemana(value: unknown): DiaSemana | undefined {
  if (typeof value !== 'string') return undefined;
  if (!Object.values(DiaSemana).includes(value as DiaSemana)) {
    throw new AppError('Dia de semana invalido.', 400);
  }
  return value as DiaSemana;
}

function validateTimeRange(horaInicio: string, horaFin: string) {
  if (timeStringToMinutes(horaFin) <= timeStringToMinutes(horaInicio)) {
    throw new AppError('La hora fin debe ser mayor que la hora inicio.', 400);
  }
}

function formatSchedule<T extends { horaInicio: Date; horaFin: Date }>(schedule: T) {
  return {
    ...schedule,
    horaInicio: dateToTimeString(schedule.horaInicio),
    horaFin: dateToTimeString(schedule.horaFin),
  };
}

async function getActiveDoctorOrThrow(doctorId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { usuario: true },
  });

  if (!doctor) {
    throw new AppError('Doctor no encontrado.', 404);
  }

  if (!doctor.estado || !doctor.usuario.estado) {
    throw new AppError('Doctor inactivo.', 400);
  }

  return doctor;
}

async function ensureDuplicateAvailable(input: {
  doctorId: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  scheduleId?: string;
}) {
  const duplicate = await prisma.horario.findFirst({
    where: {
      doctorId: input.doctorId,
      diaSemana: input.diaSemana,
      horaInicio: timeStringToDate(input.horaInicio),
      horaFin: timeStringToDate(input.horaFin),
      NOT: input.scheduleId ? { id: input.scheduleId } : undefined,
    },
  });

  if (duplicate) {
    throw new AppError('Ya existe un horario para el mismo doctor, dia y rango.', 409);
  }
}

export async function getSchedules(query: GetSchedulesQuery) {
  const doctorId = typeof query.doctor_id === 'string' ? query.doctor_id : undefined;
  const diaSemana = parseDiaSemana(query.dia_semana);
  const estado = parseEstado(query.estado);
  const where: Prisma.HorarioWhereInput = {};

  if (doctorId) where.doctorId = doctorId;
  if (diaSemana) where.diaSemana = diaSemana;
  if (typeof estado === 'boolean') where.estado = estado;

  const schedules = await prisma.horario.findMany({
    where,
    include: scheduleInclude,
    orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
  });

  return schedules.map(formatSchedule);
}

export async function getScheduleById(id: string) {
  const schedule = await prisma.horario.findUnique({
    where: { id },
    include: scheduleInclude,
  });

  if (!schedule) {
    throw new AppError('Horario no encontrado.', 404);
  }

  return formatSchedule(schedule);
}

export async function createSchedule(input: CreateScheduleInput) {
  await getActiveDoctorOrThrow(input.doctor_id);
  validateTimeRange(input.hora_inicio, input.hora_fin);
  await ensureDuplicateAvailable({
    doctorId: input.doctor_id,
    diaSemana: input.dia_semana,
    horaInicio: input.hora_inicio,
    horaFin: input.hora_fin,
  });

  const schedule = await prisma.horario.create({
    data: {
      doctorId: input.doctor_id,
      diaSemana: input.dia_semana,
      horaInicio: timeStringToDate(input.hora_inicio),
      horaFin: timeStringToDate(input.hora_fin),
      duracionCitaMinutos: input.duracion_cita_minutos,
      consultorio: input.consultorio ?? null,
      estado: input.estado ?? true,
    },
    include: scheduleInclude,
  });

  return formatSchedule(schedule);
}

export async function updateSchedule(id: string, input: UpdateScheduleInput) {
  const current = await prisma.horario.findUnique({ where: { id } });

  if (!current) {
    throw new AppError('Horario no encontrado.', 404);
  }

  const nextDiaSemana = input.dia_semana ?? current.diaSemana;
  const nextHoraInicio = input.hora_inicio ?? dateToTimeString(current.horaInicio);
  const nextHoraFin = input.hora_fin ?? dateToTimeString(current.horaFin);

  validateTimeRange(nextHoraInicio, nextHoraFin);
  await ensureDuplicateAvailable({
    doctorId: current.doctorId,
    diaSemana: nextDiaSemana,
    horaInicio: nextHoraInicio,
    horaFin: nextHoraFin,
    scheduleId: id,
  });

  const schedule = await prisma.horario.update({
    where: { id },
    data: {
      diaSemana: input.dia_semana,
      horaInicio: input.hora_inicio ? timeStringToDate(input.hora_inicio) : undefined,
      horaFin: input.hora_fin ? timeStringToDate(input.hora_fin) : undefined,
      duracionCitaMinutos: input.duracion_cita_minutos,
      consultorio: input.consultorio,
      estado: input.estado,
    },
    include: scheduleInclude,
  });

  return formatSchedule(schedule);
}

export async function updateScheduleStatus(
  id: string,
  input: UpdateScheduleStatusInput
) {
  await getScheduleById(id);

  const schedule = await prisma.horario.update({
    where: { id },
    data: { estado: input.estado },
    include: scheduleInclude,
  });

  return formatSchedule(schedule);
}

export async function getSchedulesByDoctor(doctorId: string, includeInactive = false) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { usuario: true },
  });

  if (!doctor || (!includeInactive && (!doctor.estado || !doctor.usuario.estado))) {
    throw new AppError('Doctor no encontrado.', 404);
  }

  const schedules = await prisma.horario.findMany({
    where: {
      doctorId,
      estado: includeInactive ? undefined : true,
    },
    include: scheduleInclude,
    orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
  });

  return schedules.map(formatSchedule);
}
