import { apiRequest } from './api.js';

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function getPatients(params) {
  return apiRequest(`/pacientes${buildQuery(params)}`);
}

export async function getPatientById(id) {
  return apiRequest(`/pacientes/${id}`);
}

export async function createPatient(payload) {
  return apiRequest('/pacientes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePatient(id, payload) {
  return apiRequest(`/pacientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updatePatientStatus(id, estado) {
  return apiRequest(`/pacientes/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}

export async function getPatientAppointments(id) {
  return apiRequest(`/pacientes/${id}/citas`);
}
