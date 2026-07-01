export function generateAppointmentFolio(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');

  return `CITA-${timestamp}-${random}`;
}
