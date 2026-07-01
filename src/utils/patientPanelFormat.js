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

export function getDoctorName(doctor) {
  return fullName(doctor?.usuario);
}

export function getAppointmentDoctorName(appointment) {
  return getDoctorName(appointment?.doctor);
}

export function canPatientCancel(appointment) {
  return ['PENDIENTE', 'CONFIRMADA'].includes(appointment?.estado);
}

export function appointmentToPatientRow(appointment) {
  return {
    ...appointment,
    doctorNombre: getAppointmentDoctorName(appointment),
    especialidadNombre: appointment?.especialidad?.nombre || appointment?.doctor?.especialidad?.nombre || 'Sin especialidad',
    hora: `${appointment?.horaInicio || ''} - ${appointment?.horaFin || ''}`.trim(),
    motivo: appointment?.motivoConsulta || 'Sin motivo',
    consultorio: appointment?.doctor?.consultorio || 'Sin consultorio',
  };
}

export function doctorToOption(doctor) {
  return {
    label: `${getDoctorName(doctor)} - ${doctor?.consultorio || 'Sin consultorio'}`,
    value: doctor.id,
  };
}

export function specialtyToOption(specialty) {
  return {
    label: specialty.nombre,
    value: specialty.id,
  };
}

export function getNextAppointment(appointments) {
  const active = appointments
    .filter((appointment) => ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(appointment.estado))
    .sort((a, b) => `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`));

  return active[0] || null;
}
