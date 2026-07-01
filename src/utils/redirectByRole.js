const roleRedirects = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  PACIENTE: '/paciente/inicio',
  RECEPCIONISTA: '/admin/dashboard',
  ENFERMERO: '/admin/dashboard',
};

export function redirectByRole(role) {
  return roleRedirects[role] || '/';
}

export function canAccessArea(role, area) {
  if (area === 'admin') {
    return ['ADMIN', 'RECEPCIONISTA', 'ENFERMERO'].includes(role);
  }

  if (area === 'doctor') {
    return role === 'DOCTOR';
  }

  if (area === 'paciente') {
    return role === 'PACIENTE';
  }

  return true;
}
