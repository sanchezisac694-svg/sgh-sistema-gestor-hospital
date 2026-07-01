import { apiRequest, TOKEN_KEY } from './api.js';

const USER_KEY = 'sgh_user';

export async function login(credentials) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  return response.data;
}

export async function registerPatient(payload) {
  const response = await apiRequest('/auth/register-paciente', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function getMe() {
  const response = await apiRequest('/auth/me');
  return response.data;
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // El cierre local debe funcionar aunque el token haya expirado.
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function saveSession({ token, usuario }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function readStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export { USER_KEY };
