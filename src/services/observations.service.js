import { apiRequest } from './api.js';

export async function getMyDoctorObservations() {
  return apiRequest('/observaciones/doctor/me');
}
