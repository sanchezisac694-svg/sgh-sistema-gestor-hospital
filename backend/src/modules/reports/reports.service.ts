import { EstadoCita, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { buildDateRangeFilter, dateStringToDate } from '../../utils/dates';

type DateRangeQuery = {
  fecha_inicio?: unknown;
  fecha_fin?: unknown;
};

function appointmentDateWhere(query: DateRangeQuery): Prisma.CitaWhereInput {
  const range = buildDateRangeFilter(query.fecha_inicio, query.fecha_fin);
  return range ? { fecha: range } : {};
}

function currentMonthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
  return { gte: start, lte: end };
}

export async function getDashboardReport() {
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayDate = dateStringToDate(todayString);

  const [
    totalDoctores,
    totalEnfermeros,
    totalPacientes,
    totalEspecialidades,
    citasHoy,
    citasPendientes,
    citasConfirmadas,
    citasCanceladas,
    citasAtendidas,
    citasNoAsistio,
  ] = await Promise.all([
    prisma.doctor.count(),
    prisma.enfermero.count(),
    prisma.paciente.count(),
    prisma.especialidad.count(),
    prisma.cita.count({ where: { fecha: todayDate } }),
    prisma.cita.count({ where: { estado: EstadoCita.PENDIENTE } }),
    prisma.cita.count({ where: { estado: EstadoCita.CONFIRMADA } }),
    prisma.cita.count({ where: { estado: EstadoCita.CANCELADA } }),
    prisma.cita.count({ where: { estado: EstadoCita.ATENDIDA } }),
    prisma.cita.count({ where: { estado: EstadoCita.NO_ASISTIO } }),
  ]);

  return {
    totalDoctores,
    totalEnfermeros,
    totalPacientes,
    totalEspecialidades,
    citasHoy,
    citasPendientes,
    citasConfirmadas,
    citasCanceladas,
    citasAtendidas,
    citasNoAsistio,
  };
}

export async function getAppointmentsByStatusReport(query: DateRangeQuery) {
  const where = appointmentDateWhere(query);
  const grouped = await prisma.cita.groupBy({
    by: ['estado'],
    where,
    _count: { _all: true },
  });

  return Object.values(EstadoCita).map((estado) => ({
    estado,
    totalCitas: grouped.find((item) => item.estado === estado)?._count._all ?? 0,
  }));
}

export async function getAppointmentsByDoctorReport(query: DateRangeQuery) {
  const where = appointmentDateWhere(query);
  const grouped = await prisma.cita.groupBy({
    by: ['doctorId'],
    where,
    _count: { _all: true },
    orderBy: { _count: { doctorId: 'desc' } },
  });

  const doctors = await prisma.doctor.findMany({
    where: { id: { in: grouped.map((item) => item.doctorId) } },
    include: {
      usuario: {
        select: {
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
        },
      },
      especialidad: {
        select: { nombre: true },
      },
    },
  });

  return grouped
    .map((item) => {
      const doctor = doctors.find((entry) => entry.id === item.doctorId);
      return {
        doctorId: item.doctorId,
        nombreDoctor: doctor
          ? `${doctor.usuario.nombre} ${doctor.usuario.apellidoPaterno} ${doctor.usuario.apellidoMaterno ?? ''}`.trim()
          : 'Doctor no encontrado',
        especialidad: doctor?.especialidad.nombre ?? null,
        totalCitas: item._count._all,
      };
    })
    .sort((a, b) => b.totalCitas - a.totalCitas);
}

export async function getAppointmentsBySpecialtyReport(query: DateRangeQuery) {
  const where = appointmentDateWhere(query);
  const grouped = await prisma.cita.groupBy({
    by: ['especialidadId'],
    where,
    _count: { _all: true },
  });

  const specialties = await prisma.especialidad.findMany({
    where: { id: { in: grouped.map((item) => item.especialidadId) } },
    select: { id: true, nombre: true },
  });

  return grouped
    .map((item) => ({
      especialidadId: item.especialidadId,
      nombreEspecialidad:
        specialties.find((entry) => entry.id === item.especialidadId)?.nombre ??
        'Especialidad no encontrada',
      totalCitas: item._count._all,
    }))
    .sort((a, b) => b.totalCitas - a.totalCitas);
}

export async function getActiveStaffReport() {
  const [
    doctoresActivos,
    doctoresInactivos,
    enfermerosActivos,
    enfermerosInactivos,
    personalAdminActivo,
    personalAdminInactivo,
  ] = await Promise.all([
    prisma.doctor.count({ where: { estado: true } }),
    prisma.doctor.count({ where: { estado: false } }),
    prisma.enfermero.count({ where: { estado: true } }),
    prisma.enfermero.count({ where: { estado: false } }),
    prisma.personalAdministrativo.count({ where: { estado: true } }),
    prisma.personalAdministrativo.count({ where: { estado: false } }),
  ]);

  return {
    doctoresActivos,
    doctoresInactivos,
    enfermerosActivos,
    enfermerosInactivos,
    personalAdminActivo,
    personalAdminInactivo,
  };
}

export async function getPatientsReport() {
  const [pacientesActivos, pacientesInactivos, pacientesRegistradosMesActual, totalPacientes] =
    await Promise.all([
      prisma.paciente.count({ where: { estado: true } }),
      prisma.paciente.count({ where: { estado: false } }),
      prisma.paciente.count({ where: { createdAt: currentMonthRange() } }),
      prisma.paciente.count(),
    ]);

  return {
    pacientesActivos,
    pacientesInactivos,
    pacientesRegistradosMesActual,
    totalPacientes,
  };
}
