import { apiRequest } from './api.js';

export async function getDashboardReport() {
  return apiRequest('/reportes/dashboard');
}

export async function getAppointmentsByStatusReport() {
  return apiRequest('/reportes/citas-por-estado');
}

export async function getAppointmentsByDoctorReport() {
  return apiRequest('/reportes/citas-por-doctor');
}

export async function getAppointmentsBySpecialtyReport() {
  return apiRequest('/reportes/citas-por-especialidad');
}

export async function getActiveStaffReport() {
  return apiRequest('/reportes/personal-activo');
}

export async function getPatientsReport() {
  return apiRequest('/reportes/pacientes');
}
