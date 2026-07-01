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

export async function getDoctorDashboard() {
  return apiRequest('/doctor/me/dashboard');
}

export async function getMyDoctorAppointments(params) {
  return apiRequest(`/doctor/me/citas${buildQuery(params)}`);
}

export async function getTodayDoctorAppointments() {
  return apiRequest('/doctor/me/citas/hoy');
}

export async function getMyDoctorSchedule() {
  return apiRequest('/doctor/me/horario');
}

export async function getMyDoctorProfile() {
  return apiRequest('/doctor/me/perfil');
}

export async function getMyDoctorAppointmentById(id) {
  return apiRequest(`/doctor/me/citas/${id}`);
}
