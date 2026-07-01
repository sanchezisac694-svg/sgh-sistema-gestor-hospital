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

export async function getUsers(params) {
  return apiRequest(`/usuarios${buildQuery(params)}`);
}

export async function getUserById(id) {
  return apiRequest(`/usuarios/${id}`);
}

export async function createUser(payload) {
  return apiRequest('/usuarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id, payload) {
  return apiRequest(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateUserStatus(id, estado) {
  return apiRequest(`/usuarios/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}
