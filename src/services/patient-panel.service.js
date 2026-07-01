import { apiRequest } from './api.js';

export async function getMyPatientProfile() {
  return apiRequest('/paciente/me/perfil');
}

export async function getMyPatientAppointments() {
  return apiRequest('/paciente/me/citas');
}

export async function cancelMyPatientAppointment(id, motivo_cancelacion) {
  return apiRequest(`/paciente/me/citas/${id}/cancelar`, {
    method: 'PATCH',
    body: JSON.stringify({ motivo_cancelacion }),
  });
}
