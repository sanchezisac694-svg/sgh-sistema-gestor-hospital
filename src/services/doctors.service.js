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

export async function getDoctors(params) {
  return apiRequest(`/doctores${buildQuery({ admin: true, ...params })}`);
}

export async function getPublicDoctors(params) {
  return apiRequest(`/doctores${buildQuery(params)}`);
}

export async function getDoctorById(id) {
  return apiRequest(`/doctores/${id}?admin=true`);
}

export async function getPublicDoctorById(id) {
  return apiRequest(`/doctores/${id}`);
}

export async function createDoctor(payload) {
  return apiRequest('/doctores', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDoctor(id, payload) {
  return apiRequest(`/doctores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateDoctorStatus(id, estado) {
  return apiRequest(`/doctores/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}

export async function getDoctorsBySpecialty(especialidadId) {
  return apiRequest(`/doctores/especialidad/${especialidadId}`);
}
