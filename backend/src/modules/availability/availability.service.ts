import { EstadoCita } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import {
  dateToTimeString,
  generateTimeSlots,
  getDiaSemanaFromDate,
} from '../../utils/time';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isPastDate(dateString: string): boolean {
  return dateString < getLocalDateString(new Date());
}

function validateDate(fecha: unknown): string {
  if (typeof fecha !== 'string' || !fecha) {
    throw new AppError('La fecha es obligatoria.', 400);
  }

  if (!DATE_REGEX.test(fecha)) {
    throw new AppError('La fecha debe tener formato YYYY-MM-DD.', 400);
  }

  const date = new Date(`${fecha}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new AppError('La fecha no es valida.', 400);
  }

  if (isPastDate(fecha)) {
    throw new AppError('La fecha no puede ser pasada.', 400);
  }

  return fecha;
}

export async function getDoctorAvailability(doctorId: string, fechaInput: unknown) {
  const fecha = validateDate(fechaInput);

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      usuario: {
        select: {
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          estado: true,
        },
      },
    },
  });

  if (!doctor || !doctor.estado || !doctor.usuario.estado) {
    throw new AppError('Doctor no encontrado.', 404);
  }

  const diaSemana = getDiaSemanaFromDate(fecha);
  const horarios = await prisma.horario.findMany({
    where: {
      doctorId,
      diaSemana,
      estado: true,
    },
    orderBy: {
      horaInicio: 'asc',
    },
  });

  const slots = horarios.flatMap((horario) =>
    generateTimeSlots(
      dateToTimeString(horario.horaInicio),
      dateToTimeString(horario.horaFin),
      horario.duracionCitaMinutos
    )
  );

  const citasActivas = await prisma.cita.findMany({
    where: {
      doctorId,
      fecha: new Date(`${fecha}T00:00:00.000Z`),
      estado: {
        in: [
          EstadoCita.PENDIENTE,
          EstadoCita.CONFIRMADA,
          EstadoCita.REPROGRAMADA,
        ],
      },
    },
    select: {
      horaInicio: true,
    },
  });

  const horasOcupadas = new Set(
    citasActivas.map((cita) => dateToTimeString(cita.horaInicio))
  );

  const horariosDisponibles = [...new Set(slots)].filter(
    (slot) => !horasOcupadas.has(slot)
  );

  return {
    doctorId,
    doctor: `Dr. ${doctor.usuario.nombre} ${doctor.usuario.apellidoPaterno} ${
      doctor.usuario.apellidoMaterno ?? ''
    }`.trim(),
    fecha,
    diaSemana,
    horariosDisponibles,
  };
}
