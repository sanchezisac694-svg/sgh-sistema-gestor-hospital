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

export async function getSchedules(params) {
  return apiRequest(`/horarios${buildQuery(params)}`);
}

export async function getScheduleById(id) {
  return apiRequest(`/horarios/${id}`);
}

export async function createSchedule(payload) {
  return apiRequest('/horarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateSchedule(id, payload) {
  return apiRequest(`/horarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateScheduleStatus(id, estado) {
  return apiRequest(`/horarios/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}

export async function getSchedulesByDoctor(doctorId) {
  return apiRequest(`/horarios/doctor/${doctorId}`);
}
