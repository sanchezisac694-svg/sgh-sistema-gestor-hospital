const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'sgh_token';
const USER_KEY = 'sgh_user';

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    const message = payload?.message || 'No fue posible completar la solicitud.';
    const error = new Error(message);
    error.status = response.status;
    error.errors = payload?.errors || [];
    throw error;
  }

  return payload;
}

export async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

export { API_BASE_URL, TOKEN_KEY };
