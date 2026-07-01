import { apiRequest } from './api.js';

export async function getDoctorAvailability(doctorId, fecha) {
  return apiRequest(`/disponibilidad/doctores/${doctorId}?fecha=${encodeURIComponent(fecha)}`);
}
