export const DOCTOR_APPOINTMENT_STATES = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Confirmada', value: 'CONFIRMADA' },
  { label: 'Cancelada', value: 'CANCELADA' },
  { label: 'Reprogramada', value: 'REPROGRAMADA' },
  { label: 'Atendida', value: 'ATENDIDA' },
  { label: 'No asistio', value: 'NO_ASISTIO' },
];

const dayNames = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miercoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sabado',
  DOMINGO: 'Domingo',
};

export function unwrapData(response) {
  return response?.data ?? response;
}

export function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function fullName(user) {
  if (!user) return 'Sin nombre';
  return [user.nombre, user.apellidoPaterno, user.apellidoMaterno].filter(Boolean).join(' ') || 'Sin nombre';
}

export function initialsFromName(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'DR';
}

export function appointmentPatientName(appointment) {
  return fullName(appointment?.paciente?.usuario);
}

export function appointmentToRow(appointment) {
  return {
    ...appointment,
    pacienteNombre: appointmentPatientName(appointment),
    pacienteCorreo: appointment?.paciente?.usuario?.correo || 'Sin correo',
    pacienteTelefono: appointment?.paciente?.usuario?.telefono || 'Sin telefono',
    hora: `${appointment?.horaInicio || ''} - ${appointment?.horaFin || ''}`.trim(),
    motivo: appointment?.motivoConsulta || 'Sin motivo',
  };
}

export function scheduleToRow(schedule, consultorio) {
  return {
    ...schedule,
    dia: dayNames[schedule?.diaSemana] || schedule?.diaSemana || 'Sin dia',
    duracionCita: `${schedule?.duracionCitaMinutos || 0} min`,
    consultorio: schedule?.consultorio || consultorio || 'Sin consultorio',
  };
}

export function canAttend(status) {
  return status === 'CONFIRMADA';
}

export function canMarkNoShow(status) {
  return status === 'CONFIRMADA';
}
