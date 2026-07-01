import { EstadoCita, Prisma, RolNombre } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import {
  addMinutesToTime,
  dateStringToDate,
  dateToDateString,
  isPastDate,
} from '../../utils/dates';
import { generateAppointmentFolio } from '../../utils/generateFolio';
import {
  dateToTimeString,
  generateTimeSlots,
  getDiaSemanaFromDate,
  timeStringToDate,
} from '../../utils/time';
import {
  AttendAppointmentInput,
  CancelAppointmentInput,
  ConfirmAppointmentInput,
  CreateAppointmentInput,
  NoShowAppointmentInput,
  RescheduleAppointmentInput,
  UpdateAppointmentInput,
} from './appointments.validators';

type AuthUser = {
  id: string;
  correo: string;
  rol: RolNombre;
};

type GetAppointmentsQuery = {
  doctor_id?: unknown;
  paciente_id?: unknown;
  especialidad_id?: unknown;
  estado?: unknown;
  fecha?: unknown;
  search?: unknown;
};

const blockingStates: EstadoCita[] = [
  EstadoCita.PENDIENTE,
  EstadoCita.CONFIRMADA,
  EstadoCita.REPROGRAMADA,
] ;

const closedStates: EstadoCita[] = [
  EstadoCita.ATENDIDA,
  EstadoCita.CANCELADA,
  EstadoCita.NO_ASISTIO,
] ;

const confirmableStates: EstadoCita[] = [
  EstadoCita.PENDIENTE,
  EstadoCita.REPROGRAMADA,
] ;

const patientCancelableStates: EstadoCita[] = [
  EstadoCita.PENDIENTE,
  EstadoCita.CONFIRMADA,
] ;

const appointmentInclude = {
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
  especialidad: {
    select: {
      id: true,
      nombre: true,
      estado: true,
    },
  },
  observacion: true,
  historialCitas: {
    orderBy: { createdAt: 'asc' },
  },
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

function parseEstado(value: unknown): EstadoCita | undefined {
  if (typeof value !== 'string') return undefined;
  if (!Object.values(EstadoCita).includes(value as EstadoCita)) {
    throw new AppError('Estado de cita invalido.', 400);
  }
  return value as EstadoCita;
}

function assertNotPastDate(fecha: string) {
  if (isPastDate(fecha)) {
    throw new AppError('La fecha no puede ser pasada.', 400);
  }
}

async function getPatientByUserId(usuarioId: string) {
  const patient = await prisma.paciente.findUnique({
    where: { usuarioId },
    include: { usuario: true },
  });

  if (!patient) throw new AppError('Paciente no encontrado.', 404);
  return patient;
}

async function getDoctorByUserId(usuarioId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { usuarioId },
    include: { usuario: true },
  });

  if (!doctor) throw new AppError('Doctor no encontrado.', 404);
  return doctor;
}

async function createAppointmentHistory(
  tx: Prisma.TransactionClient,
  params: {
    citaId: string;
    usuarioId: string;
    estadoAnterior?: EstadoCita | null;
    estadoNuevo?: EstadoCita | null;
    comentario?: string | null;
  }
) {
  await tx.historialCita.create({
    data: {
      citaId: params.citaId,
      usuarioId: params.usuarioId,
      estadoAnterior: params.estadoAnterior ?? null,
      estadoNuevo: params.estadoNuevo ?? null,
      comentario: params.comentario ?? null,
    },
  });
}

async function validateBaseEntities(input: {
  pacienteId: string;
  doctorId: string;
  especialidadId: string;
}) {
  const [patient, doctor, specialty] = await Promise.all([
    prisma.paciente.findUnique({
      where: { id: input.pacienteId },
      include: { usuario: true },
    }),
    prisma.doctor.findUnique({
      where: { id: input.doctorId },
      include: { usuario: true },
    }),
    prisma.especialidad.findUnique({
      where: { id: input.especialidadId },
    }),
  ]);

  if (!patient) throw new AppError('Paciente no encontrado.', 404);
  if (!patient.estado || !patient.usuario.estado) {
    throw new AppError('Paciente inactivo.', 400);
  }

  if (!doctor) throw new AppError('Doctor no encontrado.', 404);
  if (!doctor.estado || !doctor.usuario.estado) {
    throw new AppError('Doctor inactivo.', 400);
  }

  if (!specialty) throw new AppError('Especialidad no encontrada.', 404);
  if (!specialty.estado) throw new AppError('Especialidad inactiva.', 400);

  if (doctor.especialidadId !== specialty.id) {
    throw new AppError('Doctor no pertenece a esa especialidad.', 400);
  }

  return { patient, doctor, specialty };
}

async function validateAvailability(input: {
  doctorId: string;
  fecha: string;
  horaInicio: string;
  excludeAppointmentId?: string;
}) {
  assertNotPastDate(input.fecha);

  const diaSemana = getDiaSemanaFromDate(input.fecha);
  const schedules = await prisma.horario.findMany({
    where: {
      doctorId: input.doctorId,
      diaSemana,
      estado: true,
    },
  });

  for (const schedule of schedules) {
    const slots = generateTimeSlots(
      dateToTimeString(schedule.horaInicio),
      dateToTimeString(schedule.horaFin),
      schedule.duracionCitaMinutos
    );

    if (!slots.includes(input.horaInicio)) continue;

    const existing = await prisma.cita.findFirst({
      where: {
        doctorId: input.doctorId,
        fecha: dateStringToDate(input.fecha),
        horaInicio: timeStringToDate(input.horaInicio),
        estado: { in: blockingStates },
        NOT: input.excludeAppointmentId ? { id: input.excludeAppointmentId } : undefined,
      },
    });

    if (existing) throw new AppError('Horario no disponible.', 409);

    return {
      horaFin: addMinutesToTime(input.horaInicio, schedule.duracionCitaMinutos),
    };
  }

  throw new AppError('Horario no disponible.', 409);
}

async function getAppointmentOrThrow(id: string) {
  const appointment = await prisma.cita.findUnique({
    where: { id },
    include: appointmentInclude,
  });

  if (!appointment) throw new AppError('Cita no encontrada.', 404);
  return appointment;
}

async function assertAppointmentAccess(appointmentId: string, user: AuthUser) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  if (user.rol === RolNombre.DOCTOR) {
    const doctor = await getDoctorByUserId(user.id);
    if (appointment.doctorId !== doctor.id) {
      throw new AppError('No tienes permisos para realizar esta accion.', 403);
    }
  }

  if (user.rol === RolNombre.PACIENTE) {
    const patient = await getPatientByUserId(user.id);
    if (appointment.pacienteId !== patient.id) {
      throw new AppError('No tienes permisos para realizar esta accion.', 403);
    }
  }

  return appointment;
}

function assertCanModifyAppointment(appointment: { estado: EstadoCita }) {
  if (closedStates.includes(appointment.estado)) {
    throw new AppError('La cita ya no puede modificarse.', 400);
  }
}

export async function getAppointments(query: GetAppointmentsQuery) {
  const estado = parseEstado(query.estado);
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const where: Prisma.CitaWhereInput = {};

  if (typeof query.doctor_id === 'string') where.doctorId = query.doctor_id;
  if (typeof query.paciente_id === 'string') where.pacienteId = query.paciente_id;
  if (typeof query.especialidad_id === 'string') {
    where.especialidadId = query.especialidad_id;
  }
  if (estado) where.estado = estado;
  if (typeof query.fecha === 'string') where.fecha = dateStringToDate(query.fecha);

  if (search) {
    where.OR = [
      { folio: { contains: search, mode: 'insensitive' } },
      { motivoConsulta: { contains: search, mode: 'insensitive' } },
      { paciente: { usuario: { nombre: { contains: search, mode: 'insensitive' } } } },
      { paciente: { usuario: { correo: { contains: search, mode: 'insensitive' } } } },
      { doctor: { usuario: { nombre: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const appointments = await prisma.cita.findMany({
    where,
    include: appointmentInclude,
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
  });

  return appointments.map(formatAppointment);
}

export async function getAppointmentById(id: string, user: AuthUser) {
  const appointment = await assertAppointmentAccess(id, user);
  return formatAppointment(appointment);
}

export async function createAppointment(input: CreateAppointmentInput, user: AuthUser) {
  let pacienteId = input.paciente_id;

  if (user.rol === RolNombre.PACIENTE) {
    const patient = await getPatientByUserId(user.id);
    pacienteId = patient.id;
  }

  if (!pacienteId) {
    throw new AppError('El paciente es obligatorio.', 400);
  }

  await validateBaseEntities({
    pacienteId,
    doctorId: input.doctor_id,
    especialidadId: input.especialidad_id,
  });

  const availability = await validateAvailability({
    doctorId: input.doctor_id,
    fecha: input.fecha,
    horaInicio: input.hora_inicio,
  });

  const appointment = await prisma.$transaction(async (tx) => {
    const created = await tx.cita.create({
      data: {
        folio: generateAppointmentFolio(),
        pacienteId,
        doctorId: input.doctor_id,
        especialidadId: input.especialidad_id,
        fecha: dateStringToDate(input.fecha),
        horaInicio: timeStringToDate(input.hora_inicio),
        horaFin: timeStringToDate(availability.horaFin),
        motivoConsulta: input.motivo_consulta,
        observacionesAdmin: input.observaciones_admin ?? null,
        estado: EstadoCita.PENDIENTE,
      },
    });

    await createAppointmentHistory(tx, {
      citaId: created.id,
      usuarioId: user.id,
      estadoAnterior: null,
      estadoNuevo: EstadoCita.PENDIENTE,
      comentario: 'Cita creada.',
    });

    return tx.cita.findUniqueOrThrow({
      where: { id: created.id },
      include: appointmentInclude,
    });
  });

  return formatAppointment(appointment);
}

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput
) {
  const appointment = await getAppointmentOrThrow(id);
  assertCanModifyAppointment(appointment);

  const updated = await prisma.cita.update({
    where: { id },
    data: {
      motivoConsulta: input.motivo_consulta,
      observacionesAdmin: input.observaciones_admin,
    },
    include: appointmentInclude,
  });

  return formatAppointment(updated);
}

export async function confirmAppointment(
  id: string,
  input: ConfirmAppointmentInput,
  user: AuthUser
) {
  const appointment = await getAppointmentOrThrow(id);

  if (!confirmableStates.includes(appointment.estado)) {
    throw new AppError('La cita no puede confirmarse en su estado actual.', 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const cita = await tx.cita.update({
      where: { id },
      data: { estado: EstadoCita.CONFIRMADA },
      include: appointmentInclude,
    });

    await createAppointmentHistory(tx, {
      citaId: id,
      usuarioId: user.id,
      estadoAnterior: appointment.estado,
      estadoNuevo: EstadoCita.CONFIRMADA,
      comentario: input.comentario ?? 'Cita confirmada.',
    });

    return cita;
  });

  return formatAppointment(updated);
}

export async function cancelAppointment(
  id: string,
  input: CancelAppointmentInput,
  user: AuthUser
) {
  const appointment = await assertAppointmentAccess(id, user);

  if (closedStates.includes(appointment.estado)) {
    throw new AppError('La cita no puede cancelarse en su estado actual.', 400);
  }

  if (user.rol === RolNombre.PACIENTE) {
    if (!patientCancelableStates.includes(appointment.estado)) {
      throw new AppError('La cita no puede cancelarse en su estado actual.', 400);
    }
    if (isPastDate(dateToDateString(appointment.fecha))) {
      throw new AppError('No se puede cancelar una cita pasada.', 400);
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const cita = await tx.cita.update({
      where: { id },
      data: { estado: EstadoCita.CANCELADA },
      include: appointmentInclude,
    });

    await createAppointmentHistory(tx, {
      citaId: id,
      usuarioId: user.id,
      estadoAnterior: appointment.estado,
      estadoNuevo: EstadoCita.CANCELADA,
      comentario: input.motivo_cancelacion,
    });

    return cita;
  });

  return formatAppointment(updated);
}

export async function rescheduleAppointment(
  id: string,
  input: RescheduleAppointmentInput,
  user: AuthUser
) {
  const appointment = await getAppointmentOrThrow(id);
  assertCanModifyAppointment(appointment);

  const availability = await validateAvailability({
    doctorId: appointment.doctorId,
    fecha: input.nueva_fecha,
    horaInicio: input.nueva_hora_inicio,
    excludeAppointmentId: id,
  });

  const updated = await prisma.$transaction(async (tx) => {
    const cita = await tx.cita.update({
      where: { id },
      data: {
        fecha: dateStringToDate(input.nueva_fecha),
        horaInicio: timeStringToDate(input.nueva_hora_inicio),
        horaFin: timeStringToDate(availability.horaFin),
        estado: EstadoCita.REPROGRAMADA,
      },
      include: appointmentInclude,
    });

    await createAppointmentHistory(tx, {
      citaId: id,
      usuarioId: user.id,
      estadoAnterior: appointment.estado,
      estadoNuevo: EstadoCita.REPROGRAMADA,
      comentario: input.comentario ?? 'Cita reprogramada.',
    });

    return cita;
  });

  return formatAppointment(updated);
}

export async function attendAppointment(
  id: string,
  input: AttendAppointmentInput,
  user: AuthUser
) {
  const doctor = await getDoctorByUserId(user.id);
  const appointment = await getAppointmentOrThrow(id);

  if (appointment.doctorId !== doctor.id) {
    throw new AppError('No tienes permisos para realizar esta accion.', 403);
  }

  if (appointment.estado !== EstadoCita.CONFIRMADA) {
    throw new AppError('Solo se pueden atender citas confirmadas.', 400);
  }

  if (appointment.observacion) {
    throw new AppError('La cita ya tiene observacion registrada.', 409);
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.observacionConsulta.create({
      data: {
        citaId: id,
        doctorId: doctor.id,
        pacienteId: appointment.pacienteId,
        observaciones: input.observaciones,
        diagnosticoInicial: input.diagnostico_inicial ?? null,
        recomendaciones: input.recomendaciones ?? null,
      },
    });

    const cita = await tx.cita.update({
      where: { id },
      data: { estado: EstadoCita.ATENDIDA },
      include: appointmentInclude,
    });

    await createAppointmentHistory(tx, {
      citaId: id,
      usuarioId: user.id,
      estadoAnterior: appointment.estado,
      estadoNuevo: EstadoCita.ATENDIDA,
      comentario: 'Cita atendida.',
    });

    return cita;
  });

  return formatAppointment(updated);
}

export async function markNoShowAppointment(
  id: string,
  input: NoShowAppointmentInput,
  user: AuthUser
) {
  const doctor = await getDoctorByUserId(user.id);
  const appointment = await getAppointmentOrThrow(id);

  if (appointment.doctorId !== doctor.id) {
    throw new AppError('No tienes permisos para realizar esta accion.', 403);
  }

  if (appointment.estado !== EstadoCita.CONFIRMADA) {
    throw new AppError('Solo se pueden marcar como no asistio citas confirmadas.', 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const cita = await tx.cita.update({
      where: { id },
      data: { estado: EstadoCita.NO_ASISTIO },
      include: appointmentInclude,
    });

    await createAppointmentHistory(tx, {
      citaId: id,
      usuarioId: user.id,
      estadoAnterior: appointment.estado,
      estadoNuevo: EstadoCita.NO_ASISTIO,
      comentario: input.comentario ?? 'El paciente no asistio.',
    });

    return cita;
  });

  return formatAppointment(updated);
}

export async function getMyPatientAppointments(user: AuthUser) {
  const patient = await getPatientByUserId(user.id);

  const appointments = await prisma.cita.findMany({
    where: { pacienteId: patient.id },
    include: appointmentInclude,
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
  });

  return appointments.map(formatAppointment);
}

export async function cancelMyPatientAppointment(
  id: string,
  input: CancelAppointmentInput,
  user: AuthUser
) {
  return cancelAppointment(id, input, user);
}
