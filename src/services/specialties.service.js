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

export async function getSpecialties(params) {
  return apiRequest(`/especialidades${buildQuery({ admin: true, ...params })}`);
}

export async function getPublicSpecialties(params) {
  return apiRequest(`/especialidades${buildQuery(params)}`);
}

export async function getSpecialtyById(id) {
  return apiRequest(`/especialidades/${id}?admin=true`);
}

export async function createSpecialty(payload) {
  return apiRequest('/especialidades', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateSpecialty(id, payload) {
  return apiRequest(`/especialidades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateSpecialtyStatus(id, estado) {
  return apiRequest(`/especialidades/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}
