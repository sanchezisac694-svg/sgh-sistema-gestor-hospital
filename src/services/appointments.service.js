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

export async function getAppointments(params) {
  return apiRequest(`/citas${buildQuery(params)}`);
}

export async function getAppointmentById(id) {
  return apiRequest(`/citas/${id}`);
}

export async function createAppointment(payload) {
  return apiRequest('/citas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAppointment(id, payload) {
  return apiRequest(`/citas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function confirmAppointment(id, comentario) {
  return apiRequest(`/citas/${id}/confirmar`, {
    method: 'PATCH',
    body: JSON.stringify({ comentario: comentario || null }),
  });
}

export async function cancelAppointment(id, motivo_cancelacion) {
  return apiRequest(`/citas/${id}/cancelar`, {
    method: 'PATCH',
    body: JSON.stringify({ motivo_cancelacion }),
  });
}

export async function rescheduleAppointment(id, payload) {
  return apiRequest(`/citas/${id}/reprogramar`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function attendAppointment(id, payload) {
  return apiRequest(`/citas/${id}/atendida`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function markNoShowAppointment(id, comentario) {
  return apiRequest(`/citas/${id}/no-asistio`, {
    method: 'PATCH',
    body: JSON.stringify({ comentario: comentario || null }),
  });
}
